// Default findings data for the Alma Security CSF assessment
// These findings represent gaps identified during the 2025 assessment
// Generated from assessment observations with remediation requirements

export const DEFAULT_FINDINGS = [
  {
    id: 'FND-1',
    summary: 'Change Management Enforcement Gap - 85% Compliance',
    description: 'Change management policy enforcement is inconsistent across teams. Sample audits show only 85% compliance with documented procedures. Crown jewel systems have additional review requirements but enforcement varies by team.',
    complianceRequirement: 'DE.CM-01 Ex1',
    controlId: 'DE.CM-01 Ex1', // Network monitoring control (linked from CSV)
    assessmentId: 'ASM-default-2025-alma',
    rootCause: 'Change management policy exists but lacks automated enforcement. Teams have varying levels of training and awareness. Exception documentation process established but not consistently followed.',
    remediationActionPlan: 'Implement automated change management enforcement in ServiceNow. Extend mandatory risk impact assessments to all systems (not just crown jewels). Conduct training for all teams on change documentation requirements. Target 95% compliance.',
    remediationOwner: 4, // Chris Magann
    dueDate: '2026-09-30',
    status: 'In Progress',
    priority: 'High',
    createdDate: '2025-04-17T00:00:00.000Z',
    lastModified: '2025-04-17T00:00:00.000Z',
    jiraKey: 'FND-1',
    linkedArtifacts: ['Change Management Policy']
  },
  {
    id: 'FND-2',
    summary: '24/7 SOC Monitoring Coverage Gap',
    description: 'Security Operations Center currently operates during business hours only with on-call rotation for after-hours coverage. This creates potential detection delays for incidents occurring outside normal business hours.',
    complianceRequirement: 'PR.IR-03 Ex2',
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control (linked from CSV)
    assessmentId: 'ASM-default-2025-alma',
    rootCause: 'Staffing constraints limit coverage to business hours. Current team of 3 security professionals cannot sustain 24/7 operations. STS1 hiring strategy approved but not yet implemented.',
    remediationActionPlan: 'Complete Incident Response Enhancement project deliverables for 24/7 monitoring. Add additional SIEM use cases for non-AWS systems. Implement log analysis automation to reduce manual review burden. Hire additional SOC staff per STS1 strategy.',
    remediationOwner: 3, // Nadia Khan
    dueDate: '2026-08-31',
    status: 'In Progress',
    priority: 'High',
    createdDate: '2025-04-21T00:00:00.000Z',
    lastModified: '2025-04-21T00:00:00.000Z',
    jiraKey: 'FND-2',
    linkedArtifacts: ['SIEM Configuration', 'SOC Procedures']
  },
  {
    id: 'FND-3',
    summary: 'External Attack Surface Monitoring Gap',
    description: 'External perimeter visibility is limited pending ASM (Attack Surface Management) solution deployment. Network monitoring currently relies on CloudTrail and VPC Flow Logs which do not provide comprehensive external visibility.',
    complianceRequirement: 'PR.IR-03 Ex2',
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control (linked from CSV)
    assessmentId: 'ASM-default-2025-alma',
    rootCause: 'ASM vendor selection was delayed due to budget constraints. Risk register item R2 identifies this as a known gap. DNS/BGP monitoring operational but external asset discovery limited.',
    remediationActionPlan: 'Complete ASM solution deployment and integration. Expand DNS/BGP monitoring coverage to all network segments. Deploy network service monitoring dashboards to SOC. Address R2 risk register item.',
    remediationOwner: 5, // Tigan Wang
    dueDate: '2026-08-31',
    status: 'In Progress',
    priority: 'Medium',
    createdDate: '2025-04-23T00:00:00.000Z',
    lastModified: '2025-04-23T00:00:00.000Z',
    jiraKey: 'FND-3',
    linkedArtifacts: ['Network Monitoring Architecture', 'SOC-Ticket-1004']
  },
  {
    id: 'FND-4',
    summary: 'Shared Developer SSH Key on Kubernetes Nodes',
    description: 'A shared SSH key is used by developers to access Kubernetes nodes, violating the no shared accounts policy and creating accountability gaps for privileged access.',
    complianceRequirement: 'PR.IR-03 Ex2',
    controlId: 'PR.IR-03 Ex2', // Resilience mechanisms control (linked from CSV)
    assessmentId: 'ASM-default-2025-alma',
    rootCause: 'Legacy configuration from early infrastructure setup. Individual key deployment was deprioritized during rapid growth phase. SentinelOne application control deployed on workstations but server-side controls still being expanded.',
    remediationActionPlan: 'Remediate shared developer SSH key on Kubernetes nodes - issue individual keys per developer. Expand server-side application control deployment. Complete app control policy exception review.',
    remediationOwner: 5, // Tigan Wang
    dueDate: '2026-08-15',
    status: 'Not Started',
    priority: 'High',
    createdDate: '2025-04-28T00:00:00.000Z',
    lastModified: '2025-04-28T00:00:00.000Z',
    jiraKey: 'FND-4',
    linkedArtifacts: ['Application Control Policy', 'Information Security Policy']
  }
];
