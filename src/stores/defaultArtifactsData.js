// Default artifacts data for the CSF assessment
// Based on JIRA-Artifacts.csv export from AR project
// These artifacts represent evidence documents collected during the assessment

export const DEFAULT_ARTIFACTS = [
  {
    id: 1,
    artifactId: 'AR-1',
    name: 'Phishing Campaign Results from Jan 2026',
    description: 'Phishing tool (Go Phish) campaign export of results',
    link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/2025-05-26_Phish-1001-LI-Campaign-Data.xlsx',
    complianceRequirement: null,
    controlId: 'PR.AT-01 Ex2', // Security awareness training control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-10T07:28:00.000Z',
    lastModified: '2026-01-10T10:14:00.000Z',
    jiraKey: 'AR-1',
    status: 'ACTIVE'
  },
  {
    id: 2,
    artifactId: 'AR-2',
    name: 'SOC-Ticket-1001',
    description: 'Sample case',
    link: 'https://github.com/CPAtoCybersecurity/csf_profile/commit/0977939cf00b964fdca5aa9339c24c6d12c23c56',
    complianceRequirement: null,
    controlId: null,
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-10T07:31:00.000Z',
    lastModified: '2026-01-10T07:32:00.000Z',
    jiraKey: 'AR-2',
    status: 'ACTIVE'
  },
  {
    id: 3,
    artifactId: 'AR-3',
    name: 'SOC-Ticket-1004',
    description: 'Sample case',
    link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/SOC-Ticket-1004.md',
    complianceRequirement: null,
    controlId: 'RS.MI-02 Ex2', // Incident eradication control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-10T07:31:00.000Z',
    lastModified: '2026-01-10T17:14:00.000Z',
    jiraKey: 'AR-3',
    status: 'ACTIVE'
  },
  {
    id: 4,
    artifactId: 'AR-4',
    name: 'SOC-Ticket-1005',
    description: 'Sample case',
    link: 'https://github.com/CPAtoCybersecurity/csf_profile/commit/104f9b021cc951d53947a99bbd0e44669adf4ebb',
    complianceRequirement: null,
    controlId: null,
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-10T07:31:00.000Z',
    lastModified: '2026-01-10T07:33:00.000Z',
    jiraKey: 'AR-4',
    status: 'ACTIVE'
  },
  {
    id: 5,
    artifactId: 'AR-5',
    name: 'Third Party Risk Management Policy',
    description: '',
    link: 'https://github.com/CPAtoCybersecurity/csf_profile/commit/3393340912d4d2e6a9607fa3d1ba251e8b9b23ce',
    complianceRequirement: null,
    controlId: null,
    linkedSubcategoryIds: [],
    type: 'Policy',
    createdDate: '2026-01-10T07:31:00.000Z',
    lastModified: '2026-01-10T07:33:00.000Z',
    jiraKey: 'AR-5',
    status: 'ACTIVE'
  },
  {
    id: 6,
    artifactId: 'AR-6',
    name: 'CloudTrail-Config-Exports.json',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T14:35:00.000Z',
    lastModified: '2026-01-11T14:45:00.000Z',
    jiraKey: 'AR-6',
    status: 'ACTIVE'
  },
  {
    id: 7,
    artifactId: 'AR-7',
    name: 'VPC-FlowLog-Dashboard-Screenshots.png',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Screenshot',
    createdDate: '2026-01-11T14:35:00.000Z',
    lastModified: '2026-01-11T14:45:00.000Z',
    jiraKey: 'AR-7',
    status: 'ACTIVE'
  },
  {
    id: 8,
    artifactId: 'AR-8',
    name: 'Route53-DNS-Logging-Config-Screenshots.png',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Screenshot',
    createdDate: '2026-01-11T14:36:00.000Z',
    lastModified: '2026-01-11T14:45:00.000Z',
    jiraKey: 'AR-8',
    status: 'ACTIVE'
  },
  {
    id: 9,
    artifactId: 'AR-9',
    name: 'ASM-Vendor-Evaluation-Matrix.xlsx',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T14:36:00.000Z',
    lastModified: '2026-01-11T14:45:00.000Z',
    jiraKey: 'AR-9',
    status: 'ACTIVE'
  },
  {
    id: 10,
    artifactId: 'AR-10',
    name: 'GuardDuty-Findings-Reports',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T14:46:00.000Z',
    lastModified: '2026-01-11T14:46:00.000Z',
    jiraKey: 'AR-10',
    status: 'ACTIVE'
  },
  {
    id: 11,
    artifactId: 'AR-11',
    name: 'VPC-FlowLog-Retention-Remediation-Evidence',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'DE.CM-01 Ex1', // Network monitoring control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T14:46:00.000Z',
    lastModified: '2026-01-11T14:46:00.000Z',
    jiraKey: 'AR-11',
    status: 'ACTIVE'
  },
  {
    id: 12,
    artifactId: 'AR-12',
    name: 'ASM-Implementation-Status-Report',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: null,
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T14:46:00.000Z',
    lastModified: '2026-01-11T14:46:00.000Z',
    jiraKey: 'AR-12',
    status: 'ACTIVE'
  },
  {
    id: 13,
    artifactId: 'AR-13',
    name: 'SentinelOne-AppControl-Policy-Config',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.PS-05 Ex1', // Unauthorized software prevention control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:05:00.000Z',
    lastModified: '2026-01-11T15:05:00.000Z',
    jiraKey: 'AR-13',
    status: 'ACTIVE'
  },
  {
    id: 14,
    artifactId: 'AR-14',
    name: 'Mac-Endpoint-Inventory',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.PS-05 Ex1', // Unauthorized software prevention control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:06:00.000Z',
    lastModified: '2026-01-11T15:06:00.000Z',
    jiraKey: 'AR-14',
    status: 'ACTIVE'
  },
  {
    id: 15,
    artifactId: 'AR-15',
    name: 'SentinelOne-AppControl-Pilot-Report',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.PS-05 Ex1', // Unauthorized software prevention control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:06:00.000Z',
    lastModified: '2026-01-11T15:06:00.000Z',
    jiraKey: 'AR-15',
    status: 'ACTIVE'
  },
  {
    id: 16,
    artifactId: 'AR-16',
    name: 'SentinelOne-Policy-Violation-Alerts',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.PS-05 Ex1', // Unauthorized software prevention control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:06:00.000Z',
    lastModified: '2026-01-11T15:06:00.000Z',
    jiraKey: 'AR-16',
    status: 'ACTIVE'
  },
  {
    id: 17,
    artifactId: 'AR-17',
    name: 'MDM-Vendor-Evaluation',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.PS-05 Ex1', // Unauthorized software prevention control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:06:00.000Z',
    lastModified: '2026-01-11T15:06:00.000Z',
    jiraKey: 'AR-17',
    status: 'ACTIVE'
  },
  {
    id: 18,
    artifactId: 'AR-18',
    name: 'AWS-ALB-Configuration-Export',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:20:00.000Z',
    lastModified: '2026-01-11T15:20:00.000Z',
    jiraKey: 'AR-18',
    status: 'ACTIVE'
  },
  {
    id: 19,
    artifactId: 'AR-19',
    name: 'Auto-Scaling-Group-Config-Screenshot',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Screenshot',
    createdDate: '2026-01-11T15:20:00.000Z',
    lastModified: '2026-01-11T15:20:00.000Z',
    jiraKey: 'AR-19',
    status: 'ACTIVE'
  },
  {
    id: 20,
    artifactId: 'AR-20',
    name: 'RDS-Multi-AZ-Configuration',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:20:00.000Z',
    lastModified: '2026-01-11T15:20:00.000Z',
    jiraKey: 'AR-20',
    status: 'ACTIVE'
  },
  {
    id: 21,
    artifactId: 'AR-21',
    name: 'Kubernetes-HA-Architecture-Diagram',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Diagram',
    createdDate: '2026-01-11T15:20:00.000Z',
    lastModified: '2026-01-11T15:20:00.000Z',
    jiraKey: 'AR-21',
    status: 'ACTIVE'
  },
  {
    id: 22,
    artifactId: 'AR-22',
    name: 'CloudFront-Distribution-Config',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:20:00.000Z',
    lastModified: '2026-01-11T15:20:00.000Z',
    jiraKey: 'AR-22',
    status: 'ACTIVE'
  },
  {
    id: 23,
    artifactId: 'AR-23',
    name: 'Auto-Scaling-Event-History',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:21:00.000Z',
    lastModified: '2026-01-11T15:21:00.000Z',
    jiraKey: 'AR-23',
    status: 'ACTIVE'
  },
  {
    id: 24,
    artifactId: 'AR-24',
    name: 'RDS-Failover-Test-Results',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:21:00.000Z',
    lastModified: '2026-01-11T15:21:00.000Z',
    jiraKey: 'AR-24',
    status: 'ACTIVE'
  },
  {
    id: 25,
    artifactId: 'AR-25',
    name: 'K8s-Pod-Distribution-Report',
    description: '',
    link: '',
    complianceRequirement: null,
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control
    linkedSubcategoryIds: [],
    type: 'Document',
    createdDate: '2026-01-11T15:21:00.000Z',
    lastModified: '2026-01-11T15:21:00.000Z',
    jiraKey: 'AR-25',
    status: 'ACTIVE'
  }
];
