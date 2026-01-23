import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput } from '../utils/sanitize';
<<<<<<< HEAD

// Default controls for new installations
// User IDs reference default users: 1=Gerry(CISO), 3=Jane, 4=John, 5=Chris.Magann, 6=Nadia.Khan, 7=Tigan.Wang
const DEFAULT_CONTROLS = [
  {
    controlId: 'GV.SC-04 Ex1',
    implementationDescription: `Alma Security maintains a supplier inventory in ServiceNow with criticality ratings based on three factors:
- (1) sensitivity of data processed (with biometric data suppliers rated highest),
- (2) degree of system access granted, and
- (3) importance to the continuous authentication mission. The Third Party Risk Management Policy defines tiering criteria and requires quarterly reviews with CISO and Procurement sign-off.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-04 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.OC-01 Ex1',
    implementationDescription: `Alma Security's mission "to ensure businesses can continuously authenticate their users using their whole selves" is documented on the company website and communicated through quarterly Board briefings and monthly management meetings. Security investments and risk appetite decisions are explicitly tied to mission objectives, including strategic partnerships like the Apple Passkey integration (G8).`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.OC-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.RR-02 Ex1',
    implementationDescription: `Cybersecurity roles are documented in the Information Security Policy and RACI matrix. The security team structure includes: Nadia Khan (Detection & Response Lead), Chris Magann (Vulnerability Management Lead), and Tigan Wang (Vulnerability Management). The CISO reports directly to the CEO with quarterly Board reporting. Risk management authorities are defined for each role with escalation paths.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.RR-02 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.OC-02 Ex1',
    implementationDescription: `Alma Security identifies stakeholder expectations through:
- (1) quarterly Board meetings capturing director expectations,
- (2) monthly executive meetings for officer input,
- (3) employee training feedback via Workday, and
- (4) customer trust surveys following the 2022 security events. Expectations are documented in the security service catalog and inform the public trust rebuilding program.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.OC-02 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.OV-01 Ex2',
    implementationDescription: `Alma Security tracks five KPIs quarterly: Time to Detect (TTD), Time to Investigate (TTI), Time to Remediate Crown Jewels (TTR-CJC), Time to Remediate All Systems (TTR-C), and Public Trust Score. Board and management review KPI trends to adjust strategy. Investments in detection capabilities are approved based on demonstrated KPI improvement, balancing security with operational and innovation needs.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.OV-01 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.RM-01 Ex2',
    implementationDescription: `Risk management objectives are established with Board approval and tracked via automated dashboards: TTD target <4 minutes by Jan 2025, TTR-CJC target <16 hours by Aug 2025. Objectives align with company goals G1-G8. Monthly management reviews assess progress, with ASM vendor selection addressing risk register items R2 (perimeter monitoring) and R4 (asset inventory).`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.RM-01 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.RR-01 Ex4',
    implementationDescription: `The Security Governance Charter establishes CISO authority and accountability with direct CEO reporting and quarterly Board presentations. Coordination reviews occur through weekly security-IT meetings and monthly cross-functional sessions with Legal and Product teams. The hiring strategy (STS1) to add 5 A-tier professionals addresses the 50% understaffing risk (R1).`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.RR-01 Ex4'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.SC-01 Ex3',
    implementationDescription: `Alma Security's SCRM program includes:
- (1) documented strategy aligned with the authentication mission, - (2) vendor management policy with tiered requirements,
- (3) ServiceNow workflows for vendor assessments and onboarding, and
- (4) performance metrics tracked quarterly. The Apple Passkey integration drives enhanced vendor security requirements with Feb 2025 audit planned.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-01 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.SC-02 Ex7',
    implementationDescription: `SCRM roles are defined in the RACI matrix and communicated through:
- (1) internal procurement team training via Workday,
- (2) supplier contracts with security requirements, and
- (3) RFP templates with mandatory security clauses. Procurement staff complete SCRM certification. Critical suppliers receive formal communication of their cybersecurity responsibilities.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-02 Ex7'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.SC-06 Ex3',
    implementationDescription: `Vendor due diligence is performed through ServiceNow onboarding workflows requiring:
- (1) security questionnaire completion,
- (2) risk assessment against tiered criteria,
- (3) evidence collection for critical vendors. Assessments must be completed before contract execution. Results inform contract terms including security requirements and audit rights. The Apple Passkey vendor assessment included remediation tracking.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-06 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.SC-10 Ex3',
    implementationDescription: `Supplier offboarding is managed through a comprehensive checklist integrated with the procurement workflow. Access termination is automated to complete within 24 hours of contract end. The process includes: (1) access review across all systems, (2) credential revocation in SSO, (3) removal from Slack and collaboration tools, (4) audit trail documentation. Sample audits verify compliance.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-10 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'GV.SC-09 Ex5',
    implementationDescription: `Supply chain security is integrated into the ERM program through: (1) cybersecurity policy requirements for hardware change verification, (2) change management procedures for critical infrastructure upgrades, (3) lifecycle monitoring for technology products. Hardware changes are verified against authorized baselines, with automation deployed where possible through AWS Config and infrastructure-as-code.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['GV.SC-09 Ex5'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.RA-07 Ex1',
    implementationDescription: `Change management is governed by policy requiring: (1) formal documentation of proposed changes in ServiceNow, (2) risk impact assessment for changes affecting crown jewel systems, (3) testing and approval workflows, (4) exception documentation with CISO approval. Sample audits track compliance (currently 85%). Crown jewel systems require additional security review.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.RA-07 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.AT-01 Ex2',
    implementationDescription: `Security awareness training is delivered quarterly through Workday with modules covering: (1) social engineering and phishing recognition, (2) attack reporting procedures via Slack #security-alerts, (3) acceptable use policy compliance, (4) basic cyber hygiene including password management and credential protection. Phishing simulations measure effectiveness. New hire onboarding includes mandatory security training.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.AT-01 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.IR-02 Ex1',
    implementationDescription: `Environmental protection includes:
- (1) Redwood City data center with fire suppression, HVAC monitoring, and physical access controls protecting the Windows DC serving 300 employees,
- (2) AWS infrastructure leveraging multi-AZ deployment with native resilience controls,
- (3) documented environmental threat assessments and tested response procedures.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.IR-02 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RS.MI-02 Ex2',
    implementationDescription: `Incident eradication is managed by Nadia Khan's Detection & Response team using documented playbooks with decision trees. The Incident Response Enhancement project ($150K) delivers improved eradication procedures. Incident responders select from approved eradication actions based on incident type, with escalation paths defined for complex scenarios requiring manual intervention.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['RS.MI-02 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-02 Ex1',
    implementationDescription: `Alma Security uses AWS CloudTrail and GuardDuty for SIEM-like log monitoring. Detection rules are tuned based on threat intelligence with current TTD at 9 hours. The Incident Response Enhancement project addresses 24/7 monitoring gaps. Log analysis covers malicious activity patterns across AWS accounts with expanded use cases added quarterly.`,
    ownerId: 6,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['DE.AE-02 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-06 Ex1',
    implementationDescription: `GuardDuty generates alerts routed to the security team via Slack with severity-based prioritization. SOC procedures define handoff between business hours staff and on-call rotation. Alert triage follows the priority matrix with escalation paths. Progress toward 24/7 coverage planned through STS1 hiring strategy.`,
    ownerId: 6,
    stakeholderIds: [3],
    linkedRequirementIds: ['DE.AE-06 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-01 Ex1',
    implementationDescription: `Network monitoring is performed through: (1) CloudTrail for API activity, (2) VPC Flow Logs for network traffic, (3) DNS query logging. The selected ASM vendor (addressing R2) will provide external perimeter monitoring. SOC dashboards display network service status with alerting for anomalies. Coverage expands per the implementation plan.`,
    ownerId: 7,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['DE.CM-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.RA-01 Ex1',
    implementationDescription: `Vulnerability management is led by Chris Magann and Tigan Wang using automated scanning tools. Scan configurations cover crown jewel systems with higher frequency. Vulnerability reports are reviewed weekly with TTR-C currently at 11 days. Findings are prioritized based on CVSS score and asset criticality, tracked through remediation to closure.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.RA-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.DS-01 Ex4',
    implementationDescription: `Data-at-rest protection includes: (1) encryption policy requiring AES-256 for sensitive data, (2) S3 bucket encryption enforced via bucket policies (S3 Bucket Security project), (3) removable media controls deployed through SentinelOne endpoint policy. The Data Encryption Upgrade project ($95K) enhances encryption across all data stores.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.DS-01 Ex4'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.IR-03 Ex3',
    implementationDescription: `Resilience is achieved through: (1) AWS multi-AZ deployment for production workloads, (2) Kubernetes infrastructure with pod redundancy and auto-scaling, (3) redundant storage and compute for critical systems. Failover testing validates recovery capabilities. DR plan development continues as part of the Cloud Security Optimization project ($100K).`,
    ownerId: 7,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.IR-03 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.PS-01 Ex1',
    implementationDescription: `Configuration management includes: (1) hardened baselines for Amazon Linux 2 and Ubuntu documented and enforced via automation, (2) baseline compliance monitoring through AWS Config, (3) deviation alerting and remediation tracking. Legacy Windows 2012 fileserver upgrade is planned for Q3. 95% of systems deployed to hardened baselines.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.PS-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.PS-05 Ex1',
    implementationDescription: `Unauthorized software prevention is implemented through: (1) SentinelOne application control on workstations and laptops, (2) app control policy defining permitted software, (3) Kubernetes node restrictions (shared SSH key remediation in progress). Server-side controls expand SentinelOne enforcement. Policy exceptions require CISO approval.`,
    ownerId: 7,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.PS-05 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RC.RP-03 Ex1',
    implementationDescription: `Backup integrity verification includes: (1) automated checksums for S3 backups, (2) monthly integrity validation by DR Manager, (3) quarterly restore testing to verify recoverability. The S3 Bucket Security project enhances backup protection with versioning and cross-region replication. Restoration assets are checked for IOCs before recovery use.`,
    ownerId: 6,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['RC.RP-03 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RS.MI-01 Ex1',
    implementationDescription: `Incident containment is automated through: (1) SentinelOne automatic quarantine for malware, (2) GuardDuty auto-remediation for select finding types, (3) documented playbooks for manual containment. Common threat patterns trigger automated response. Complex incidents follow manual containment procedures with defined isolation steps.`,
    ownerId: 6,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['RS.MI-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-03 Ex2',
    implementationDescription: `Event correlation uses: (1) CloudTrail aggregating API events across accounts, (2) GuardDuty correlating findings from multiple AWS sources, (3) custom scripts for cross-source analysis. Multi-account GuardDuty findings are centralized. Script updates planned to enhance correlation capabilities across additional sources.`,
    ownerId: 6,
    stakeholderIds: [3],
    linkedRequirementIds: ['DE.AE-03 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-03 Ex2',
    implementationDescription: `Personnel activity monitoring includes: (1) CloudTrail logging all IAM actions, (2) SSO authentication logs via Windows Authenticator and Palo Alto 2FA, (3) failed authentication alerting and tracking. The IAM team reviews anomalies daily. SOC dashboards (60% complete) will provide consolidated access pattern visibility.`,
    ownerId: 6,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['DE.CM-03 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.CM-09 Ex1',
    implementationDescription: `Computing environment monitoring includes: (1) O365 ATP for email and web traffic with Alma-specific threat rules, (2) Slack monitoring for policy violations, (3) system monitoring policy defining coverage scope. Data leak detection capabilities are evaluated for expansion. Collaboration service monitoring covers Outlook 365 and Slack.`,
    ownerId: 7,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['DE.CM-09 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.AM-02 Ex2',
    implementationDescription: `Software inventory is maintained through: (1) AWS native tools for cloud asset tracking (85% coverage), (2) discovery scans for on-premises systems, (3) container and VM monitoring via Kubernetes native capabilities. Asset inventory system procurement aligns with ASM vendor selection (STS4) to achieve comprehensive coverage.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.AM-02 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.AM-07 Ex3',
    implementationDescription: `Data classification uses a tiered schema with biometric data classified as highest sensitivity per SG1. Classification tags are applied through: (1) data classification policy defining categories, (2) tagging implementation in production systems, (3) data scanning tool deployment (selected, scheduling underway). Metadata inventories track designated data types.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.AM-07 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.IM-01 Ex1',
    implementationDescription: `Improvement identification uses: (1) quarterly self-assessments of critical services, (2) threat-informed risk assessments for crown jewel systems, (3) KPI-driven analysis identifying gaps. TTD/TTR metric trends inform security investment decisions. Risk assessment methodology incorporates current threat intelligence and TTPs.`,
    ownerId: 5,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.IM-01 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'RS.MA-03 Ex2',
    implementationDescription: `Incident prioritization uses a documented priority matrix based on: (1) scope of impact, (2) likely business impact, (3) time-critical nature. The SOC Manager validates prioritization decisions. Sample ticket audits verify consistent application. Incident tickets in ServiceNow capture categorization with priority justification.`,
    ownerId: 6,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['RS.MA-03 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-02 Ex3',
    implementationDescription: `Manual log review is performed for systems not covered by automated monitoring: (1) review cadence defined by system criticality, (2) documented review process with finding templates, (3) SIEM console used for manual analysis. Automation gaps are tracked and addressed through tooling investments. Findings are documented with remediation tracking.`,
    ownerId: 3,
    stakeholderIds: [4],
    linkedRequirementIds: ['DE.AE-02 Ex3'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'DE.AE-08 Ex1',
    implementationDescription: `Incident declaration follows documented criteria defining thresholds by severity level. The SOC Manager has authority to declare incidents when adverse events meet criteria. The process includes: (1) applying criteria to event characteristics, (2) documenting declaration rationale in tickets, (3) lessons learned feeding continuous improvement.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['DE.AE-08 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'ID.RA-08 Ex1',
    implementationDescription: `Vulnerability disclosure processes include: (1) disclosure policy with defined response SLAs, (2) external disclosure intake via security@almasecurity.com, (3) supplier vulnerability sharing per contract requirements. Disclosures are analyzed, prioritized, and tracked through remediation. Sample disclosures demonstrate SLA compliance.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['ID.RA-08 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.AA-02 Ex2',
    implementationDescription: `Identity management enforces credential uniqueness through: (1) no shared accounts policy in Information Security Policy, (2) individual credentials issued via SSO, (3) quarterly privileged access reviews by IAM team. The MFA Rollout project ($80K) supports the Apple Passkey partnership (G8). Shared developer SSH key is identified for Q3 remediation.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.AA-02 Ex2'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  },
  {
    controlId: 'PR.DS-10 Ex1',
    implementationDescription: `Data-in-use protection includes: (1) memory handling procedures for sensitive applications, (2) sensitive data retention limits enforced via application controls, (3) source code reviews for crown jewel systems verifying secure data handling. Application owners provide attestations. Biometric data handling receives enhanced scrutiny per SG1.`,
    ownerId: 1,
    stakeholderIds: [3, 4],
    linkedRequirementIds: ['PR.DS-10 Ex1'],
    createdDate: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z'
  }
];
=======
import { DEFAULT_CONTROLS } from './defaultControlsData';
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)

const useControlsStore = create(
  persist(
    (set, get) => ({
      controls: DEFAULT_CONTROLS,
      loading: false,
      error: null,

      // History for undo/redo
      history: [],
      historyIndex: -1,

      // Set controls data with history tracking
      setControls: (controls) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(state.controls);

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          controls,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          loading: false,
          error: null
        });
      },

      // Get all controls
      getControls: () => get().controls,

      // Get control by ID
      getControl: (controlId) => {
        return get().controls.find(c => c.controlId === controlId);
      },

      // Get controls by owner
      getControlsByOwner: (ownerId) => {
        return get().controls.filter(c => c.ownerId === ownerId);
      },

      // Get controls that link to a specific requirement
      getControlsByRequirement: (requirementId) => {
        return get().controls.filter(c =>
          c.linkedRequirementIds && c.linkedRequirementIds.includes(requirementId)
        );
      },

      // Get controls that cover requirements from a specific framework
      getControlsByFramework: (frameworkId, requirementsStore) => {
        const frameworkReqIds = requirementsStore.getState()
          .getRequirementsByFramework(frameworkId)
          .map(r => r.id);

        return get().controls.filter(c =>
          c.linkedRequirementIds &&
          c.linkedRequirementIds.some(reqId => frameworkReqIds.includes(reqId))
        );
      },

      // Create new control
      createControl: (controlData) => {
        const newControl = {
          controlId: controlData.controlId || `CTL-${String(get().controls.length + 1).padStart(3, '0')}`,
          implementationDescription: sanitizeInput(controlData.implementationDescription || ''),
          ownerId: controlData.ownerId || null,
          stakeholderIds: controlData.stakeholderIds || [],
          linkedRequirementIds: controlData.linkedRequirementIds || [],
<<<<<<< HEAD
=======
          status: controlData.status || 'Not Implemented',
          // Optional fields from migration
          artifacts: controlData.artifacts || '',
          findings: controlData.findings || '',
          controlEvaluationBackLink: controlData.controlEvaluationBackLink || '',
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };

        const updatedControls = [...get().controls, newControl];
        get().setControls(updatedControls);
        return newControl;
      },

<<<<<<< HEAD
=======
      // Get or create control for a requirement (auto-creates for CSF where controlId = requirement.id)
      getOrCreateControlForRequirement: (requirement) => {
        // For CSF, use requirement.id as control ID
        const controlId = requirement.id;
        const existingControl = get().getControl(controlId);

        if (existingControl) {
          return existingControl;
        }

        // Auto-create control linked to this requirement
        return get().createControl({
          controlId,
          linkedRequirementIds: [requirement.id],
          status: 'Not Implemented'
        });
      },

      // Bulk get or create controls for multiple requirements
      ensureControlsForRequirements: (requirements) => {
        const results = [];
        requirements.forEach(req => {
          results.push(get().getOrCreateControlForRequirement(req));
        });
        return results;
      },

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      // Update existing control
      updateControl: (controlId, updates) => {
        const sanitizedUpdates = {
          ...updates,
          implementationDescription: updates.implementationDescription
            ? sanitizeInput(updates.implementationDescription)
            : updates.implementationDescription,
          lastModified: new Date().toISOString()
        };

        const updatedControls = get().controls.map(c =>
          c.controlId === controlId ? { ...c, ...sanitizedUpdates } : c
        );
        get().setControls(updatedControls);
      },

      // Delete control
      deleteControl: (controlId) => {
        const updatedControls = get().controls.filter(c => c.controlId !== controlId);
        get().setControls(updatedControls);
      },

      // Link requirement to control
      linkRequirement: (controlId, requirementId) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const linkedRequirementIds = control.linkedRequirementIds || [];
        if (!linkedRequirementIds.includes(requirementId)) {
          get().updateControl(controlId, {
            linkedRequirementIds: [...linkedRequirementIds, requirementId]
          });
        }
      },

      // Unlink requirement from control
      unlinkRequirement: (controlId, requirementId) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const linkedRequirementIds = (control.linkedRequirementIds || [])
          .filter(id => id !== requirementId);
        get().updateControl(controlId, { linkedRequirementIds });
      },

      // Bulk link requirements to control
      bulkLinkRequirements: (controlId, requirementIds) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const existingIds = control.linkedRequirementIds || [];
        const newIds = [...new Set([...existingIds, ...requirementIds])];
        get().updateControl(controlId, { linkedRequirementIds: newIds });
      },

      // Get coverage statistics
      getCoverageStats: (frameworkId, requirementsStore) => {
        const frameworkReqs = requirementsStore.getState()
          .getRequirementsByFramework(frameworkId);
        const totalReqs = frameworkReqs.length;

        const coveredReqIds = new Set();
        get().controls.forEach(control => {
          (control.linkedRequirementIds || []).forEach(reqId => {
            if (frameworkReqs.some(r => r.id === reqId)) {
              coveredReqIds.add(reqId);
            }
          });
        });

        return {
          total: totalReqs,
          covered: coveredReqIds.size,
          percentage: totalReqs > 0 ? Math.round((coveredReqIds.size / totalReqs) * 100) : 0
        };
      },

      // Undo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            controls: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      // Redo
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          set({
            controls: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Helper to parse "name <email>" format
      parseUserString: (str) => {
        if (!str || !str.trim()) return null;
        str = str.trim();

        // Match "name <email>" format
        const match = str.match(/^(.+?)\s*<([^>]+)>$/);
        if (match) {
          return { name: match[1].trim(), email: match[2].trim() };
        }

        // Check if it's just an email
        if (str.includes('@')) {
          const namePart = str.split('@')[0].replace(/[._]/g, ' ');
          return { name: namePart, email: str };
        }

        // Just a name or ID
        return { name: str, email: null };
      },

      // Import controls from CSV
      importControlsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parseUserString = get().parseUserString;
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              const newControls = results.data.map((row) => {
                // Parse owner - try multiple column names
                let ownerId = null;
                const ownerStr = row['Control Owner ID'] || row['Control Owner'] || row.ownerId;
                if (ownerStr && findOrCreateUser) {
                  const ownerInfo = parseUserString(ownerStr);
                  if (ownerInfo) {
                    ownerId = findOrCreateUser(ownerInfo);
                  }
                }

                // Parse stakeholders - try multiple column names
                let stakeholderIds = [];
                const stakeholderStr = row['Stakeholder IDs'] || row['Stakeholders'] || row.stakeholderIds;
                if (stakeholderStr && findOrCreateUser) {
                  const stakeholders = stakeholderStr.split(';').map(s => s.trim()).filter(Boolean);
                  stakeholderIds = stakeholders.map(s => {
                    const info = parseUserString(s);
                    return info ? findOrCreateUser(info) : null;
                  }).filter(Boolean);
                }

                return {
                  controlId: row['Control ID'] || row.controlId,
                  implementationDescription: sanitizeInput(row['Control Implementation Description'] || row.implementationDescription || ''),
                  ownerId,
                  stakeholderIds,
                  linkedRequirementIds: row['Linked Requirements']
                    ? row['Linked Requirements'].split(';').map(s => s.trim()).filter(Boolean)
                    : [],
                  createdDate: row.createdDate || new Date().toISOString(),
                  lastModified: new Date().toISOString()
                };
              });

              get().setControls(newControls);
              resolve(newControls.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Export controls to CSV
      exportControlsCSV: (userStore) => {
        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const csvData = get().controls.map(c => ({
          'Control ID': c.controlId,
          'Control Implementation Description': c.implementationDescription,
          'Control Owner': getUserName(c.ownerId),
          'Control Owner ID': c.ownerId || '',
          'Stakeholder(s)': (c.stakeholderIds || []).map(id => getUserName(id)).join('; '),
          'Stakeholder IDs': (c.stakeholderIds || []).join('; '),
          'Linked Requirements': (c.linkedRequirementIds || []).join('; '),
          'Created Date': c.createdDate,
          'Last Modified': c.lastModified
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `controls_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export controls to JSON
      exportControlsJSON: (userStore) => {
        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const jsonData = {
          exportDate: new Date().toISOString(),
          dataType: 'Controls',
          controls: get().controls.map(c => ({
            controlId: c.controlId,
            implementationDescription: c.implementationDescription,
            ownerId: c.ownerId || null,
            ownerName: getUserName(c.ownerId),
            stakeholderIds: c.stakeholderIds || [],
            stakeholderNames: (c.stakeholderIds || []).map(id => getUserName(id)),
            linkedRequirementIds: c.linkedRequirementIds || [],
            createdDate: c.createdDate,
            lastModified: c.lastModified
          }))
        };

        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `controls_${date}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url)
        document.body.removeChild(link);
      },

      // Generate next control ID
      getNextControlId: () => {
        const controls = get().controls;
        const maxNum = controls.reduce((max, c) => {
          const match = c.controlId.match(/CTL-(\d+)/);
          if (match) {
            return Math.max(max, parseInt(match[1], 10));
          }
          return max;
        }, 0);
        return `CTL-${String(maxNum + 1).padStart(3, '0')}`;
<<<<<<< HEAD
=======
      },

      // ============ MIGRATION METHODS ============

      /**
       * Migrate control data from requirementsStore to controlsStore.
       * For CSF, each requirement becomes a control with the same ID.
       * This imports: implementationDescription, controlOwner, stakeholders, artifacts, findings
       *
       * @param {Object} requirementsStore - The requirements store instance
       * @param {Object} userStore - The user store instance (for finding/creating users)
       */
      migrateFromRequirements: (requirementsStore, userStore) => {
        const migrationData = requirementsStore.getState().getControlDataForMigration();

        if (migrationData.length === 0) {
          console.log('[controlsStore] No control data to migrate from requirements');
          return 0;
        }

        const parseUserString = get().parseUserString;
        const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

        let migratedCount = 0;

        migrationData.forEach(data => {
          // Skip if control already exists
          const existingControl = get().getControl(data.controlId);
          if (existingControl) {
            // Update existing control with any missing data
            const updates = {};
            if (!existingControl.implementationDescription && data.implementationDescription) {
              updates.implementationDescription = data.implementationDescription;
            }
            if (!existingControl.artifacts && data.artifacts) {
              updates.artifacts = data.artifacts;
            }
            if (!existingControl.findings && data.findings) {
              updates.findings = data.findings;
            }
            if (Object.keys(updates).length > 0) {
              get().updateControl(data.controlId, updates);
              migratedCount++;
            }
            return;
          }

          // Parse owner
          let ownerId = null;
          if (data.controlOwner && findOrCreateUser) {
            const ownerInfo = parseUserString(data.controlOwner);
            if (ownerInfo) {
              ownerId = findOrCreateUser(ownerInfo);
            }
          }

          // Parse stakeholders
          let stakeholderIds = [];
          if (data.stakeholders && findOrCreateUser) {
            const stakeholders = data.stakeholders.split(/[;,]/).map(s => s.trim()).filter(Boolean);
            stakeholderIds = stakeholders.map(s => {
              const info = parseUserString(s);
              return info ? findOrCreateUser(info) : null;
            }).filter(Boolean);
          }

          // Create new control
          get().createControl({
            controlId: data.controlId,
            implementationDescription: data.implementationDescription,
            ownerId,
            stakeholderIds,
            linkedRequirementIds: data.linkedRequirementIds,
            artifacts: data.artifacts,
            findings: data.findings,
            controlEvaluationBackLink: data.controlEvaluationBackLink,
            status: 'Not Implemented'
          });

          migratedCount++;
        });

        console.log(`[controlsStore] Migrated ${migratedCount} controls from requirements`);
        return migratedCount;
      },

      // Reset store (for testing)
      reset: () => {
        set({ controls: [], history: [], historyIndex: -1, loading: false, error: null });
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      }
    }),
    {
      name: 'csf-controls-storage',
<<<<<<< HEAD
      version: 3,
      migrate: (persistedState, version) => {
        // Version 3: Force update controls with correct stable owner IDs (1-7)
        // Previous versions may have had random user IDs that don't match userStore
        if (version < 3 && persistedState?.controls?.length > 0) {
          // Create a map of default controls for quick lookup
          const defaultControlsMap = new Map(
            DEFAULT_CONTROLS.map(c => [c.controlId, c])
          );

          // Stable user IDs from DEFAULT_USERS
          const stableUserIds = new Set([1, 2, 3, 4, 5, 6, 7]);

          // Update existing controls with proper owner IDs from defaults
          const updatedControls = persistedState.controls.map(control => {
            const defaultControl = defaultControlsMap.get(control.controlId);
            if (defaultControl) {
              // Check if current ownerId is a valid stable ID
              const hasValidOwner = control.ownerId && stableUserIds.has(control.ownerId);
              const hasValidStakeholders = control.stakeholderIds?.length > 0 &&
                control.stakeholderIds.every(id => stableUserIds.has(id));

              return {
                ...control,
                // Use default owner if current is invalid
                ownerId: hasValidOwner ? control.ownerId : defaultControl.ownerId,
                // Use default stakeholders if current are invalid
                stakeholderIds: hasValidStakeholders
                  ? control.stakeholderIds
                  : defaultControl.stakeholderIds
              };
            }
            return control;
          });

          return { controls: updatedControls };
        }
        // New user or empty state - use defaults
        return { controls: DEFAULT_CONTROLS };
=======
      version: 5,
      migrate: (persistedState, version) => {
        // Version 5: Default controls from Alma Security example data
        // Existing users with data keep their controls, new users get Alma Security examples
        if (version < 5) {
          if (persistedState?.controls?.length > 0) {
            // Existing user with data - keep their controls
            return persistedState;
          }
          // New user or empty state - use Alma Security example controls
          return { controls: DEFAULT_CONTROLS };
        }
        return persistedState;
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      },
      partialize: (state) => ({
        controls: state.controls
      })
    }
  )
);

export default useControlsStore;
