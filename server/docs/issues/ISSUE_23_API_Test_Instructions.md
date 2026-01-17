
# Jira & Confluence Backend API - Testing Instructions

## Environment Variables

```env
PORT=4000

# Jira
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token

# Confluence
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_API_TOKEN=your-confluence-api-token
```

## Base URL

```
http://localhost:4000
```

## API Endpoints

### Jira Endpoints

#### Create Jira Issue
- **Method:** POST  
- **Endpoint:** `/api/jira/issues`  
- **Body Example:**
```json
{
  "projectKey": "SCRUM",
  "summary": "Test issue from Node backend",
  "issueType": "Bug",
  "description": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Created via localhost Node.js API"
          }
        ]
      }
    ]
  }
}
```

#### Get Jira Issue Status
- **Method:** GET  
- **Endpoint:** `/api/jira/issues/:issueKey`

### Confluence Endpoints

#### Fetch Page Content
- **Method:** GET  
- **Endpoint:** `/api/confluence/page/:pageId`

#### Validate Confluence Connection
- **Method:** POST  
- **Endpoint:** `/api/confluence/validate`

### Config Endpoints

#### Save Jira Config
- **Method:** POST  
- **Endpoint:** `/api/config/jira`

#### Save Confluence Config
- **Method:** POST  
- **Endpoint:** `/api/config/confluence`

#### Check API Status
- **Method:** GET  
- **Endpoint:** `/api/config/status`

## Postman Testing Tips

- **Base URL:** `http://localhost:4000`  
  *Example:* To create a Jira issue, the full URL would be:
  ```
  http://localhost:4000/api/jira/issues
  ```

- **Headers:** 
  ```
  Content-Type: application/json
  ```

- **Body:** Use **raw JSON** as shown in the API endpoints section.  
  *Example Payload for Creating Jira Issue:*
```json
{
  "projectKey": "SCRUM",
  "summary": "Test issue from Node backend",
  "issueType": "Bug",
  "description": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Created via localhost Node.js API"
          }
        ]
      }
    ]
  }
}
```

- **URL Parameters:**  
  - Jira → `:issueKey` (e.g., `SCRUM-123`)  
  - Confluence → `:pageId` (e.g., `123456`)

- **Responses:** JSON containing `success` and `data` or `error`.