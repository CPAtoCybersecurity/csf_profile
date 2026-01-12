import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput } from '../utils/sanitize';
import { DEFAULT_FINDINGS } from './defaultFindingsData';

/**
 * Findings Store
 * Manages security findings/gaps discovered during assessments.
 * Aligned with Jira FND (Findings) project structure.
 */

const useFindingsStore = create(
  persist(
    (set, get) => ({
      findings: DEFAULT_FINDINGS,
      loading: false,
      error: null,

      // Get all findings
      getFindings: () => get().findings,

      // Get finding by ID
      getFinding: (findingId) => {
        return get().findings.find(f => f.id === findingId);
      },

      // Get findings by compliance requirement
      getFindingsByRequirement: (requirementId) => {
        return get().findings.filter(f => f.complianceRequirement === requirementId);
      },

      // Get findings by control
      getFindingsByControl: (controlId) => {
        return get().findings.filter(f => f.controlId === controlId);
      },

      // Get findings by status
      getFindingsByStatus: (status) => {
        return get().findings.filter(f => f.status === status);
      },

      // Get findings by priority
      getFindingsByPriority: (priority) => {
        return get().findings.filter(f => f.priority === priority);
      },

      // Create new finding
      createFinding: (findingData) => {
        const newFinding = {
          id: `FND-${Date.now()}`,
          summary: sanitizeInput(findingData.summary || ''),
          complianceRequirement: findingData.complianceRequirement || null,
          controlId: findingData.controlId || null,
          assessmentId: findingData.assessmentId || null,
          rootCause: sanitizeInput(findingData.rootCause || ''),
          remediationActionPlan: sanitizeInput(findingData.remediationActionPlan || ''),
          remediationOwner: findingData.remediationOwner || null,
          dueDate: findingData.dueDate || '',
          status: findingData.status || 'Not Started', // Not Started, In Progress, Resolved
          priority: findingData.priority || 'Medium', // Low, Medium, High, Critical
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          jiraKey: findingData.jiraKey || null, // Jira issue key if synced
          linkedArtifacts: findingData.linkedArtifacts || []
        };

        set((state) => ({
          findings: [...state.findings, newFinding]
        }));

        return newFinding;
      },

      // Update finding
      updateFinding: (findingId, updates) => {
        const sanitizedUpdates = {
          ...updates,
          lastModified: new Date().toISOString()
        };

        if (updates.summary !== undefined) {
          sanitizedUpdates.summary = sanitizeInput(updates.summary);
        }
        if (updates.rootCause !== undefined) {
          sanitizedUpdates.rootCause = sanitizeInput(updates.rootCause);
        }
        if (updates.remediationActionPlan !== undefined) {
          sanitizedUpdates.remediationActionPlan = sanitizeInput(updates.remediationActionPlan);
        }

        set((state) => ({
          findings: state.findings.map(f =>
            f.id === findingId ? { ...f, ...sanitizedUpdates } : f
          )
        }));
      },

      // Delete finding
      deleteFinding: (findingId) => {
        set((state) => ({
          findings: state.findings.filter(f => f.id !== findingId)
        }));
      },

      // Link artifact to finding
      linkArtifact: (findingId, artifactId) => {
        set((state) => ({
          findings: state.findings.map(f => {
            if (f.id === findingId) {
              const artifacts = f.linkedArtifacts || [];
              if (!artifacts.includes(artifactId)) {
                return { ...f, linkedArtifacts: [...artifacts, artifactId] };
              }
            }
            return f;
          })
        }));
      },

      // Unlink artifact from finding
      unlinkArtifact: (findingId, artifactId) => {
        set((state) => ({
          findings: state.findings.map(f => {
            if (f.id === findingId) {
              return {
                ...f,
                linkedArtifacts: (f.linkedArtifacts || []).filter(id => id !== artifactId)
              };
            }
            return f;
          })
        }));
      },

      // Set Jira key (for sync tracking)
      setJiraKey: (findingId, jiraKey) => {
        get().updateFinding(findingId, { jiraKey });
      },

      // Get findings statistics
      getStatistics: () => {
        const findings = get().findings;
        return {
          total: findings.length,
          byStatus: {
            notStarted: findings.filter(f => f.status === 'Not Started').length,
            inProgress: findings.filter(f => f.status === 'In Progress').length,
            resolved: findings.filter(f => f.status === 'Resolved').length
          },
          byPriority: {
            low: findings.filter(f => f.priority === 'Low').length,
            medium: findings.filter(f => f.priority === 'Medium').length,
            high: findings.filter(f => f.priority === 'High').length,
            critical: findings.filter(f => f.priority === 'Critical').length
          },
          overdue: findings.filter(f => {
            if (!f.dueDate || f.status === 'Resolved') return false;
            return new Date(f.dueDate) < new Date();
          }).length
        };
      },

      // Export findings to CSV (standard format)
      exportFindingsCSV: (userStore) => {
        const findings = get().findings;
        const users = userStore?.getState?.()?.users || [];

        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          if (!user) return userId || '';
          return user.email ? `${user.name} <${user.email}>` : user.name;
        };

        const csvData = findings.map(f => ({
          'Finding ID': f.id,
          'Summary': f.summary,
          'Compliance Requirement': f.complianceRequirement || '',
          'Control ID': f.controlId || '',
          'Root Cause': f.rootCause,
          'Remediation Action Plan': f.remediationActionPlan,
          'Remediation Owner': getUserName(f.remediationOwner),
          'Due Date': f.dueDate,
          'Status': f.status,
          'Priority': f.priority,
          'Created Date': f.createdDate,
          'Jira Key': f.jiraKey || '',
          'Linked Artifacts': (f.linkedArtifacts || []).join('; ')
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `findings_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export to Jira FND project format
      exportForJiraCSV: (userStore) => {
        const findings = get().findings;
        const users = userStore?.getState?.()?.users || [];

        const getUserEmail = (userId) => {
          const user = users.find(u => u.id === userId);
          return user?.email || '';
        };

        // Jira CSV import format for FND project
        const csvData = findings.map(f => ({
          'Summary': f.summary,
          'Issue Type': 'Finding',
          'Project key': 'FND',
          'Priority': f.priority,
          'Assignee': getUserEmail(f.remediationOwner),
          'Due date': f.dueDate,
          'Custom field (Compliance Requirement)': f.complianceRequirement || '',
          'Custom field (Control ID)': f.controlId || '',
          'Custom field (Root Cause)': f.rootCause,
          'Custom field (Remediation Action Plan (Who will do What by When?))': f.remediationActionPlan,
          'Description': `Finding created from CSF Profile assessment.\n\nRoot Cause:\n${f.rootCause}\n\nRemediation Plan:\n${f.remediationActionPlan}`
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `jira_fnd_import_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Import findings from CSV
      importFindingsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              const parseUserString = (str) => {
                if (!str || !str.trim()) return null;
                str = str.trim();
                const match = str.match(/^(.+?)\s*<([^>]+)>$/);
                if (match) {
                  return { name: match[1].trim(), email: match[2].trim() };
                }
                if (str.includes('@')) {
                  return { name: str.split('@')[0].replace(/[._]/g, ' '), email: str };
                }
                return { name: str, email: null };
              };

              const newFindings = results.data.map(row => {
                let remediationOwner = null;
                const ownerStr = row['Remediation Owner'] || row['Assignee'] || row['Reporter'];
                if (ownerStr && findOrCreateUser) {
                  const info = parseUserString(ownerStr);
                  if (info) remediationOwner = findOrCreateUser(info);
                }

                // Map Jira status to our status
                const mapStatus = (status) => {
                  if (!status) return 'Not Started';
                  const s = status.toLowerCase();
                  if (s === 'to do' || s === 'not started') return 'Not Started';
                  if (s === 'in progress') return 'In Progress';
                  if (s === 'done' || s === 'resolved' || s === 'closed') return 'Resolved';
                  return status;
                };

                return {
                  id: row['Issue key'] || row['Finding ID'] || `FND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  summary: sanitizeInput(row['Summary'] || ''),
                  description: sanitizeInput(row['Description'] || ''),
                  complianceRequirement: row['Compliance Requirement'] || row['Custom field (Compliance Requirement)'] || null,
                  controlId: row['Control ID'] || row['Custom field (Control ID)'] || null,
                  rootCause: sanitizeInput(row['Root Cause'] || row['Custom field (Root Cause)'] || row['Custom field (Root Case)'] || ''),
                  remediationActionPlan: sanitizeInput(
                    row['Remediation Action Plan'] ||
                    row['Custom field (Remediation Action Plan (Who will do What by When?))'] || ''
                  ),
                  remediationOwner,
                  dueDate: row['Due Date'] || row['Due date'] || '',
                  status: mapStatus(row['Status']),
                  priority: row['Priority'] || 'Medium',
                  createdDate: row['Created Date'] || row['Created'] || new Date().toISOString(),
                  lastModified: row['Updated'] || new Date().toISOString(),
                  jiraKey: row['Issue key'] || row['Jira Key'] || null,
                  linkedArtifacts: (row['Linked Artifacts'] || '')
                    .split(';').map(s => s.trim()).filter(Boolean)
                };
              });

              set((state) => ({
                findings: [...state.findings, ...newFindings]
              }));

              resolve(newFindings.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Set all findings (for import/reset)
      setFindings: (findings) => {
        set({ findings });
      }
    }),
    {
      name: 'csf-findings-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Version 2: Added default findings for new installations
        // Existing users with data keep their findings, new users get defaults
        if (version < 2) {
          if (persistedState?.findings?.length > 0) {
            // Existing user with data - keep their findings
            return persistedState;
          }
          // New user or empty state - use defaults
          return { findings: DEFAULT_FINDINGS };
        }
        return persistedState;
      },
      partialize: (state) => ({
        findings: state.findings
      })
    }
  )
);

export default useFindingsStore;
