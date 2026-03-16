// Default controls data for the Alma Security CSF assessment
// Extracted from Confluence-Requirements.csv to align with the new architecture
// where Controls hold user-editable data (owner, stakeholders, implementation description)
// and Requirements are read-only framework data.

// User ID mapping (from userStore.js):
// 1 = Gerry (CISO)
// 2 = Steve (GRC Manager)
// 3 = Jane (Product Engineer)
// 4 = John (Financial Systems Analyst)
// 5 = Chris.Magann (Security Engineer)
// 6 = Nadia.Khan (Site Reliability Engineer)
// 7 = Tigan.Wang (Vulnerability Manager)

export const DEFAULT_CONTROLS = [
  // === DETECT (DE) FUNCTION ===
  {
    controlId: 'DE.AE-02 Ex1',
    implementationDescription: 'Alma Security uses AWS CloudTrail and GuardDuty for SIEM-like log monitoring. Detection rules are tuned based on threat intelligence with current TTD at 9 hours. The Incident Response Enhancement project addresses 24/7 monitoring gaps. Log analysis covers malicious activity patterns across AWS accounts with expanded use cases added quarterly.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['DE.AE-02 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-6',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-02 Ex3',
    implementationDescription: 'Manual log review is performed for systems not covered by automated monitoring: (1) review cadence defined by system criticality, (2) documented review process with finding templates, (3) SIEM console used for manual analysis. Automation gaps are tracked and addressed through tooling investments. Findings are documented with remediation tracking.',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['DE.AE-02 Ex3'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-7',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-03 Ex2',
    implementationDescription: 'Event correlation uses: (1) CloudTrail aggregating API events across accounts, (2) GuardDuty correlating findings from multiple AWS sources, (3) custom scripts for cross-source analysis. Multi-account GuardDuty findings are centralized. Script updates planned to enhance correlation capabilities across additional sources.',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['DE.AE-03 Ex2'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-8',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-06 Ex1',
    implementationDescription: 'GuardDuty generates alerts routed to the security team via Slack with severity-based prioritization. SOC procedures define handoff between business hours staff and on-call rotation. Alert triage follows the priority matrix with escalation paths. Progress toward 24/7 coverage planned through STS1 hiring strategy.',
    ownerId: null,
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['DE.AE-06 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-9',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-08 Ex1',
    implementationDescription: 'Incident declaration follows documented criteria defining thresholds by severity level. The SOC Manager has authority to declare incidents when adverse events meet criteria. The process includes: (1) applying criteria to event characteristics, (2) documenting declaration rationale in tickets, (3) lessons learned feeding continuous improvement.',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['DE.AE-08 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-10',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-01 Ex1',
    implementationDescription: 'Network monitoring is performed through: (1) CloudTrail for API activity, (2) VPC Flow Logs for network traffic, (3) DNS query logging. The selected ASM vendor will provide external perimeter monitoring. SOC dashboards display network service status with alerting for anomalies. Coverage expands per the implementation plan.',
    ownerId: 6, // Nadia Khan
    stakeholderIds: [7], // Tigan Wang
    linkedRequirementIds: ['DE.CM-01 Ex1'],
    status: 'Partially Implemented',
    artifacts: 'AR-6; AR-7; AR-8; AR-9; AR-10; AR-11',
    findings: 'FND-1',
    controlEvaluationBackLink: 'WP-42',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-03 Ex2',
    implementationDescription: 'Personnel activity monitoring includes: (1) CloudTrail logging all IAM actions, (2) SSO authentication logs via Windows Authenticator and Palo Alto 2FA, (3) failed authentication alerting and tracking. The IAM team reviews anomalies daily. SOC dashboards (60% complete) will provide consolidated access pattern visibility.',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['DE.CM-03 Ex2'],
    status: 'Partially Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-11',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-09 Ex1',
    implementationDescription: 'Computing environment monitoring includes: (1) O365 ATP for email and web traffic with Alma-specific threat rules, (2) Slack monitoring for policy violations, (3) system monitoring policy defining coverage scope. Data leak detection capabilities are evaluated for expansion. Collaboration service monitoring covers Outlook 365 and Slack.',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['DE.CM-09 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-12',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },

  // === GOVERN (GV) FUNCTION ===
  {
    controlId: 'GV.OC-01 Ex1',
    implementationDescription: 'Alma Security\'s mission "to ensure businesses can continuously authenticate their users using their whole selves" is documented on the company website and communicated through quarterly Board briefings and monthly management meetings. Security investments and risk appetite decisions are explicitly tied to mission objectives, including strategic partnerships like the Apple Passkey integration (G8).',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: ['GV.OC-01 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-13',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.OC-02 Ex1',
    implementationDescription: 'Alma Security identifies stakeholder expectations through: (1) quarterly Board meetings capturing director expectations, (2) monthly executive meetings for officer input, (3) employee training feedback via Workday, and (4) customer trust surveys following the 2022 security events. Expectations are documented in the security service catalog and inform the public trust rebuilding program.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['GV.OC-02 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-14',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.OV-01 Ex2',
    implementationDescription: 'Alma Security tracks five KPIs quarterly: Time to Detect (TTD), Time to Investigate (TTI), Time to Remediate Crown Jewels (TTR-CJC), Time to Remediate All Systems (TTR-C), and Public Trust Score. Board and management review KPI trends to adjust strategy. Investments in detection capabilities are approved based on demonstrated KPI improvement, balancing security with operational and innovation needs.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['GV.OV-01 Ex2'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-15',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.RM-01 Ex2',
    implementationDescription: 'Risk management objectives are established with Board approval and tracked via automated dashboards: TTD target <4 minutes by Jan 2025, TTR-CJC target <16 hours by Aug 2025. Objectives align with company goals G1-G8. Monthly management reviews assess progress, with ASM vendor selection addressing risk register items R2 (perimeter monitoring) and R4 (asset inventory).',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['GV.RM-01 Ex2'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-16',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },

  // === PROTECT (PR) FUNCTION ===
  {
    controlId: 'PR.AT-01 Ex2',
    implementationDescription: 'Security awareness training is delivered quarterly through Workday with modules covering: (1) social engineering and phishing recognition, (2) attack reporting procedures via Slack #security-alerts, (3) acceptable use policy compliance, (4) basic cyber hygiene including password management and credential protection. Phishing simulations measure effectiveness. New hire onboarding includes mandatory security training.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.AT-01 Ex2'],
    status: 'Implemented',
    artifacts: 'AR-1',
    findings: '',
    controlEvaluationBackLink: 'WP-31',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.DS-01 Ex4',
    implementationDescription: 'Data-at-rest protection includes: (1) encryption policy requiring AES-256 for sensitive data, (2) S3 bucket encryption enforced via bucket policies (S3 Bucket Security project), (3) removable media controls deployed through SentinelOne endpoint policy. The Data Encryption Upgrade project ($95K) enhances encryption across all data stores.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.DS-01 Ex4'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-32',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.DS-10 Ex1',
    implementationDescription: 'Data-in-use protection includes: (1) memory handling procedures for sensitive applications, (2) sensitive data retention limits enforced via application controls, (3) source code reviews for crown jewel systems verifying secure data handling. Application owners provide attestations. Biometric data handling receives enhanced scrutiny per SG1.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.DS-10 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-33',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.IR-02 Ex1',
    implementationDescription: 'Environmental protection includes: (1) Redwood City data center with fire suppression, HVAC monitoring, and physical access controls protecting the Windows DC serving 300 employees, (2) AWS infrastructure leveraging multi-AZ deployment with native resilience controls, (3) documented environmental threat assessments and tested response procedures.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.IR-02 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-34',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.IR-03 Ex2',
    implementationDescription: 'Resilience mechanisms are implemented to achieve resilience requirements in normal and adverse situations through: (1) AWS Elastic Load Balancing (ALB) distributing traffic across multiple availability zones for the primary authentication platform, (2) Auto-scaling groups configured to add capacity during traffic spikes or instance failures, (3) Multi-AZ deployment for production Postgres databases with automated failover, (4) Kubernetes cluster spanning three availability zones with pod anti-affinity rules preventing single points of failure, (5) CloudFront CDN providing edge caching and DDoS absorption for customer-facing endpoints.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.IR-03 Ex2'],
    status: 'Implemented',
    artifacts: 'AR-18; AR-19; AR-20; AR-21; AR-22; AR-23; AR-24; AR-25',
    findings: 'FND-2; FND-3; FND-4',
    controlEvaluationBackLink: '',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.IR-03 Ex3',
    implementationDescription: 'Resilience is achieved through: (1) AWS multi-AZ deployment for production workloads, (2) Kubernetes infrastructure with pod redundancy and auto-scaling, (3) redundant storage and compute for critical systems. Failover testing validates recovery capabilities. DR plan development continues as part of the Cloud Security Optimization project ($100K).',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.IR-03 Ex3'],
    status: 'Partially Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-35',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.PS-01 Ex1',
    implementationDescription: 'Configuration management includes: (1) hardened baselines for Amazon Linux 2 and Ubuntu documented and enforced via automation, (2) baseline compliance monitoring through AWS Config, (3) deviation alerting and remediation tracking. Legacy Windows 2012 fileserver upgrade is planned for Q3. 95% of systems deployed to hardened baselines.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.PS-01 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-36',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.PS-05 Ex1',
    implementationDescription: 'Unauthorized software prevention is implemented through: (1) SentinelOne application control on workstations and laptops, (2) app control policy defining permitted software, (3) Kubernetes node restrictions (shared SSH key remediation in progress). Server-side controls expand SentinelOne enforcement. Policy exceptions require CISO approval.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['PR.PS-05 Ex1'],
    status: 'Partially Implemented',
    artifacts: 'AR-3; AR-13; AR-14; AR-15; AR-16; AR-17',
    findings: '',
    controlEvaluationBackLink: 'WP-37',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },

  // === RECOVER (RC) FUNCTION ===
  {
    controlId: 'RC.RP-03 Ex1',
    implementationDescription: 'Backup integrity verification includes: (1) automated checksums for S3 backups, (2) monthly integrity validation by DR Manager, (3) quarterly restore testing to verify recoverability. The S3 Bucket Security project enhances backup protection with versioning and cross-region replication. Restoration assets are checked for IOCs before recovery use.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['RC.RP-03 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-38',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },

  // === RESPOND (RS) FUNCTION ===
  {
    controlId: 'RS.MA-03 Ex2',
    implementationDescription: 'Incident prioritization uses a documented priority matrix based on: (1) scope of impact, (2) likely business impact, (3) time-critical nature. The SOC Manager validates prioritization decisions. Sample ticket audits verify consistent application. Incident tickets in ServiceNow capture categorization with priority justification.',
    ownerId: 2, // CPA to Cybersecurity (Steve)
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['RS.MA-03 Ex2'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-39',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RS.MI-01 Ex1',
    implementationDescription: 'Incident containment is automated through: (1) SentinelOne automatic quarantine for malware, (2) GuardDuty auto-remediation for select finding types, (3) documented playbooks for manual containment. Common threat patterns trigger automated response. Complex incidents follow manual containment procedures with defined isolation steps.',
    ownerId: null,
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['RS.MI-01 Ex1'],
    status: 'Implemented',
    artifacts: '',
    findings: '',
    controlEvaluationBackLink: 'WP-40',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RS.MI-02 Ex2',
    implementationDescription: 'Incident eradication is managed by Nadia Khan\'s Security Operations Center team using documented playbooks with decision trees, for example to re-image a host that was compromised with a malicious payload. The Incident Response Enhancement project in Q2 ($150K) delivers improved eradication procedures. Incident responders select from approved eradication actions based on incident type, with escalation paths defined in an Incident Response Plan.',
    ownerId: 6, // Nadia Khan
    stakeholderIds: [2], // Steve McMichael
    linkedRequirementIds: ['RS.MI-02 Ex2'],
    status: 'Implemented',
    artifacts: 'AR-3',
    findings: '',
    controlEvaluationBackLink: 'WP-41',
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  }
];
