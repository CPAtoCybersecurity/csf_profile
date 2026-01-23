/**
 * Atlassian REST API Client
 * Handles authentication and API calls for Confluence and Jira
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AtlassianClient {
  constructor() {
    this.siteUrl = process.env.ATLASSIAN_SITE_URL;
    this.email = process.env.ATLASSIAN_EMAIL;
    this.apiToken = process.env.ATLASSIAN_API_TOKEN;

    if (!this.siteUrl || !this.email || !this.apiToken) {
      throw new Error('Missing Atlassian credentials. Please configure .env file.');
    }

    // Create axios instance with basic auth
    this.client = axios.create({
      baseURL: this.siteUrl,
      auth: {
        username: this.email,
        password: this.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  // ============================================
  // CONFLUENCE API METHODS
  // ============================================

  /**
   * Get all spaces
   */
  async getSpaces() {
    const response = await this.client.get('/wiki/api/v2/spaces');
    return response.data.results;
  }

  /**
   * Get space by key
   */
  async getSpace(spaceKey) {
    const response = await this.client.get(`/wiki/api/v2/spaces`, {
      params: { keys: spaceKey }
    });
    return response.data.results[0];
  }

  /**
   * Get databases in a space
   * Note: Confluence Databases API is limited - may need to use pages API
   */
  async getDatabases(spaceKey) {
    // Confluence databases are stored as pages with specific content type
    const response = await this.client.get('/wiki/api/v2/pages', {
      params: {
        spaceId: await this.getSpaceId(spaceKey),
        limit: 100
      }
    });
    return response.data.results;
  }

  /**
   * Get space ID from space key
   */
  async getSpaceId(spaceKey) {
    const space = await this.getSpace(spaceKey);
    return space?.id;
  }

  /**
   * Create a page in Confluence
   */
  async createPage(spaceId, title, body, parentId = null) {
    const payload = {
      spaceId: spaceId,
      status: 'current',
      title: title,
      body: {
        representation: 'storage',
        value: body
      }
    };

    if (parentId) {
      payload.parentId = parentId;
    }

    const response = await this.client.post('/wiki/api/v2/pages', payload);
    return response.data;
  }

  /**
   * Update a page in Confluence
   */
  async updatePage(pageId, title, body, version) {
    const payload = {
      id: pageId,
      status: 'current',
      title: title,
      body: {
        representation: 'storage',
        value: body
      },
      version: {
        number: version + 1
      }
    };

    const response = await this.client.put(`/wiki/api/v2/pages/${pageId}`, payload);
    return response.data;
  }

  /**
   * Search Confluence content
   */
  async searchConfluence(cql) {
    const response = await this.client.get('/wiki/rest/api/content/search', {
      params: { cql }
    });
    return response.data.results;
  }

  // ============================================
  // JIRA API METHODS
  // ============================================

  /**
   * Get project by key
   */
  async getProject(projectKey) {
    const response = await this.client.get(`/rest/api/3/project/${projectKey}`);
    return response.data;
  }

  /**
   * Get issue types for a project
   */
  async getIssueTypes(projectKey) {
    const response = await this.client.get(`/rest/api/3/project/${projectKey}`);
    return response.data.issueTypes;
  }

  /**
   * Get all custom fields
   */
  async getCustomFields() {
    const response = await this.client.get('/rest/api/3/field');
    return response.data.filter(f => f.custom);
  }

  /**
   * Create a Jira issue
   */
  async createIssue(projectKey, issueTypeId, fields) {
    const payload = {
      fields: {
        project: { key: projectKey },
        issuetype: { id: issueTypeId },
        ...fields
      }
    };

    const response = await this.client.post('/rest/api/3/issue', payload);
    return response.data;
  }

  /**
   * Update a Jira issue
   */
  async updateIssue(issueKey, fields) {
    const payload = { fields };
    await this.client.put(`/rest/api/3/issue/${issueKey}`, payload);
    return true;
  }

  /**
   * Search issues using JQL
   */
  async searchIssues(jql, fields = ['summary', 'status', 'assignee']) {
    const response = await this.client.get('/rest/api/3/search', {
      params: {
        jql,
        fields: fields.join(','),
        maxResults: 100
      }
    });
    return response.data.issues;
  }

  /**
   * Get a single issue by key
   */
  async getIssue(issueKey, fields = []) {
    const params = {};
    if (fields.length > 0) {
      params.fields = fields.join(',');
    }
    const response = await this.client.get(`/rest/api/3/issue/${issueKey}`, { params });
    return response.data;
  }

  /**
   * Add a comment to an issue
   */
  async addComment(issueKey, comment) {
    const payload = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment
              }
            ]
          }
        ]
      }
    };

    const response = await this.client.post(`/rest/api/3/issue/${issueKey}/comment`, payload);
    return response.data;
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(issueKey, transitionId) {
    const payload = {
      transition: { id: transitionId }
    };

    await this.client.post(`/rest/api/3/issue/${issueKey}/transitions`, payload);
    return true;
  }

  /**
   * Get available transitions for an issue
   */
  async getTransitions(issueKey) {
    const response = await this.client.get(`/rest/api/3/issue/${issueKey}/transitions`);
    return response.data.transitions;
  }

  /**
   * Bulk create issues
   */
  async bulkCreateIssues(issues) {
    const payload = { issueUpdates: issues };
    const response = await this.client.post('/rest/api/3/issue/bulk', payload);
    return response.data;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Test connection to Atlassian
   */
  async testConnection() {
    try {
      const user = await this.client.get('/rest/api/3/myself');
      console.log(`✓ Connected as: ${user.data.displayName} (${user.data.emailAddress})`);
      return true;
    } catch (error) {
      console.error('✗ Connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get the browse URL for a Jira issue
   */
  getIssueBrowseUrl(issueKey) {
    return `${this.siteUrl}/browse/${issueKey}`;
  }

  /**
   * Get the browse URL for a Confluence page
   */
  getPageBrowseUrl(spaceKey, pageTitle) {
    const encodedTitle = encodeURIComponent(pageTitle.replace(/ /g, '+'));
    return `${this.siteUrl}/wiki/spaces/${spaceKey}/pages/${encodedTitle}`;
  }
}

export default AtlassianClient;
