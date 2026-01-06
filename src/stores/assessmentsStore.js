import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput } from '../utils/sanitize';

// Default assessment for new installations
// References control IDs from DEFAULT_CONTROLS in controlsStore.js
// User ID 2 = Steve (Auditor) from default users
const DEFAULT_ASSESSMENTS = [
  {
    id: 'ASM-default-2025-alma',
    name: '2025 Alma Security CSF',
    description: 'Annual CSF 2.0 assessment for Alma Security covering all implemented controls',
    scopeType: 'controls',
    frameworkFilter: null,
    createdDate: '2025-01-01T00:00:00.000Z',
    scopeIds: [
      'GV.SC-04 Ex1', 'GV.OC-01 Ex1', 'GV.RR-02 Ex1', 'GV.OC-02 Ex1', 'GV.OV-01 Ex2',
      'GV.RM-01 Ex2', 'GV.RR-01 Ex4', 'GV.SC-01 Ex3', 'GV.SC-02 Ex7', 'GV.SC-06 Ex3',
      'GV.SC-10 Ex3', 'GV.SC-09 Ex5', 'ID.RA-07 Ex1', 'PR.AT-01 Ex2', 'PR.IR-02 Ex1',
      'RS.MI-02 Ex2', 'DE.AE-02 Ex1', 'DE.AE-06 Ex1', 'DE.CM-01 Ex1', 'ID.RA-01 Ex1',
      'PR.DS-01 Ex4', 'PR.IR-03 Ex3', 'PR.PS-01 Ex1', 'PR.PS-05 Ex1', 'RC.RP-03 Ex1',
      'RS.MI-01 Ex1', 'DE.AE-03 Ex2', 'DE.CM-03 Ex2', 'DE.CM-09 Ex1', 'ID.AM-02 Ex2',
      'ID.AM-07 Ex3', 'ID.IM-01 Ex1', 'RS.MA-03 Ex2', 'DE.AE-02 Ex3', 'DE.AE-08 Ex1',
      'ID.RA-08 Ex1', 'PR.AA-02 Ex2', 'PR.DS-10 Ex1'
    ],
    observations: {
      'GV.SC-04 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review supplier inventory in ServiceNow\n2. Verify criticality ratings against documented criteria\n3. Interview procurement team on tiering process\n4. Sample quarterly review documentation',
        linkedArtifacts: ['Third Party Risk Management Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Supplier inventory maintained with appropriate criticality ratings. Quarterly reviews documented with CISO and Procurement sign-off.', observationDate: '2025-01-10', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.OC-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review mission documentation on website\n2. Examine Board briefing materials\n3. Interview CISO on mission alignment\n4. Verify security investment ties to mission objectives',
        linkedArtifacts: ['Security Governance Charter', 'Board Briefing Materials'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 8, targetScore: 8, observations: 'Mission clearly documented and communicated. Security investments explicitly tied to mission objectives including Apple Passkey partnership.', observationDate: '2025-01-10', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.RR-02 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review Information Security Policy\n2. Examine RACI matrix\n3. Verify reporting structure\n4. Interview security team leads',
        linkedArtifacts: ['Information Security Policy', 'RACI Matrix'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Roles documented in policy and RACI. Clear reporting structure with CISO to CEO and quarterly Board reporting.', observationDate: '2025-01-11', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.OC-02 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review stakeholder identification process\n2. Examine Board meeting minutes\n3. Review customer trust survey results\n4. Verify security service catalog',
        linkedArtifacts: ['Security Service Catalog'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Stakeholder expectations captured through multiple channels. Public trust rebuilding program in place following 2022 events.', observationDate: '2025-01-11', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.OV-01 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review KPI definitions and targets\n2. Examine quarterly KPI reports\n3. Verify Board review of KPI trends\n4. Assess investment decision linkage to KPIs',
        linkedArtifacts: ['KPI Dashboard', 'Board Reports'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 8, targetScore: 8, observations: 'Five KPIs tracked quarterly with automated dashboards. TTD, TTI, TTR-CJC, TTR-C, and Public Trust Score all monitored.', observationDate: '2025-01-12', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.RM-01 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review risk management objectives\n2. Verify Board approval documentation\n3. Examine automated dashboards\n4. Assess alignment with company goals',
        linkedArtifacts: ['Risk Register', 'Board Approval Documentation'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 8, observations: 'Risk objectives established with Board approval. TTD target <4 min by Jan 2025 not yet met (currently 9 hours). ASM vendor selection in progress.', observationDate: '2025-01-12', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.RR-01 Ex4': {
        auditorId: 2,
        testProcedures: '1. Review Security Governance Charter\n2. Verify CISO reporting structure\n3. Examine coordination meeting records\n4. Assess hiring strategy progress',
        linkedArtifacts: ['Security Governance Charter'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Charter establishes authority. Hiring strategy STS1 in progress but 50% understaffing risk (R1) not yet resolved.', observationDate: '2025-01-13', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.SC-01 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review SCRM program documentation\n2. Examine vendor management policy\n3. Verify ServiceNow workflows\n4. Assess Apple Passkey vendor requirements',
        linkedArtifacts: ['Vendor Management Policy', 'SCRM Strategy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'SCRM program well documented with ServiceNow integration. Apple Passkey audit planned for Feb 2025.', observationDate: '2025-01-13', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.SC-02 Ex7': {
        auditorId: 2,
        testProcedures: '1. Review RACI for SCRM roles\n2. Verify procurement training records\n3. Examine supplier contract templates\n4. Assess RFP security clauses',
        linkedArtifacts: ['RACI Matrix', 'RFP Templates'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'SCRM roles defined and communicated. Procurement staff SCRM certified. RFP templates include mandatory security clauses.', observationDate: '2025-01-14', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.SC-06 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review ServiceNow onboarding workflows\n2. Verify security questionnaire process\n3. Examine sample vendor assessments\n4. Assess remediation tracking for Apple Passkey vendor',
        linkedArtifacts: ['Vendor Assessment Template'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Due diligence performed through ServiceNow workflows. Assessments completed before contract execution.', observationDate: '2025-01-14', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.SC-10 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review offboarding checklist\n2. Verify access termination timeframes\n3. Sample audit of terminated vendors\n4. Examine audit trail documentation',
        linkedArtifacts: ['Vendor Offboarding Checklist'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Comprehensive offboarding checklist in place. Access termination automated within 24 hours. Sample audits verified compliance.', observationDate: '2025-01-15', testingStatus: 'Complete', examine: true, interview: false, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'GV.SC-09 Ex5': {
        auditorId: 2,
        testProcedures: '1. Review hardware change verification procedures\n2. Examine AWS Config rules\n3. Verify infrastructure-as-code baselines\n4. Assess lifecycle monitoring',
        linkedArtifacts: ['Change Management Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Supply chain security integrated into ERM. Hardware changes verified through automation where possible. Some manual processes remain.', observationDate: '2025-01-15', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.RA-07 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review change management policy\n2. Examine ServiceNow change records\n3. Sample audit change compliance\n4. Verify crown jewel additional review process',
        linkedArtifacts: ['Change Management Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Change management policy in place with ServiceNow tracking. Current compliance at 85% - improvement needed.', observationDate: '2025-01-16', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.AT-01 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review training program documentation\n2. Verify Workday training records\n3. Examine phishing simulation results\n4. Assess new hire onboarding process',
        linkedArtifacts: ['Security Awareness Program'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Quarterly training delivered through Workday. Phishing simulations measure effectiveness. New hire training mandatory.', observationDate: '2025-01-16', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.IR-02 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review data center environmental controls\n2. Verify AWS multi-AZ deployment\n3. Examine threat assessments\n4. Test response procedures',
        linkedArtifacts: ['Environmental Threat Assessment'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Redwood City DC has appropriate controls. AWS multi-AZ provides cloud resilience. Response procedures documented and tested.', observationDate: '2025-01-17', testingStatus: 'Complete', examine: true, interview: false, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'RS.MI-02 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review eradication playbooks\n2. Examine incident response project status\n3. Verify escalation paths\n4. Test sample eradication scenarios',
        linkedArtifacts: ['Incident Response Playbooks'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Eradication playbooks with decision trees in place. IR Enhancement project ($150K) delivering improvements.', observationDate: '2025-01-17', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.AE-02 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review CloudTrail and GuardDuty configuration\n2. Examine detection rule tuning\n3. Verify TTD metrics\n4. Assess 24/7 monitoring gaps',
        linkedArtifacts: ['SIEM Configuration'],
        remediation: { ownerId: 5, actionPlan: 'Implement 24/7 monitoring coverage through IR Enhancement project', dueDate: '2025-06-30' },
        quarters: {
          Q1: { actualScore: 5, targetScore: 7, observations: 'CloudTrail and GuardDuty in use. TTD currently 9 hours - below target of <4 minutes. 24/7 monitoring gaps exist.', observationDate: '2025-01-18', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.AE-06 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review alert routing configuration\n2. Examine SOC procedures\n3. Verify on-call rotation\n4. Assess alert triage effectiveness',
        linkedArtifacts: ['SOC Procedures'],
        remediation: { ownerId: 6, actionPlan: 'Expand to 24/7 coverage via STS1 hiring', dueDate: '2025-08-31' },
        quarters: {
          Q1: { actualScore: 5, targetScore: 7, observations: 'Alerts routed via Slack with severity prioritization. Business hours coverage adequate, but 24/7 coverage not yet achieved.', observationDate: '2025-01-18', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.CM-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review network monitoring tools\n2. Verify CloudTrail and VPC Flow Logs\n3. Assess ASM vendor selection progress\n4. Examine SOC dashboards',
        linkedArtifacts: ['Network Monitoring Architecture'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Network monitoring via CloudTrail, VPC Flow Logs, DNS logging. ASM vendor selection will provide external perimeter monitoring.', observationDate: '2025-01-19', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.RA-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review vulnerability scanning configuration\n2. Examine weekly vulnerability reports\n3. Verify TTR-C metrics\n4. Assess prioritization process',
        linkedArtifacts: ['Vulnerability Management Program'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Automated scanning covers crown jewel systems. TTR-C at 11 days. CVSS-based prioritization in place.', observationDate: '2025-01-19', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.DS-01 Ex4': {
        auditorId: 2,
        testProcedures: '1. Review encryption policy\n2. Verify S3 bucket encryption\n3. Examine SentinelOne removable media controls\n4. Assess Data Encryption Upgrade project',
        linkedArtifacts: ['Encryption Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'AES-256 encryption required. S3 bucket encryption enforced. Data Encryption Upgrade project ($95K) enhancing coverage.', observationDate: '2025-01-20', testingStatus: 'Complete', examine: true, interview: false, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.IR-03 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review AWS multi-AZ configuration\n2. Examine Kubernetes redundancy\n3. Verify failover testing records\n4. Assess DR plan development',
        linkedArtifacts: ['DR Plan'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Multi-AZ and Kubernetes redundancy in place. DR plan development continues via Cloud Security Optimization project.', observationDate: '2025-01-20', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.PS-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review hardened baselines documentation\n2. Verify AWS Config compliance\n3. Examine deviation alerting\n4. Assess legacy Windows 2012 upgrade plan',
        linkedArtifacts: ['Hardening Standards'],
        remediation: { ownerId: 5, actionPlan: 'Upgrade legacy Windows 2012 fileserver', dueDate: '2025-09-30' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: '95% of systems on hardened baselines. Legacy Windows 2012 fileserver upgrade planned for Q3.', observationDate: '2025-01-21', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.PS-05 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review SentinelOne application control\n2. Verify app control policy\n3. Examine Kubernetes node restrictions\n4. Assess shared SSH key remediation',
        linkedArtifacts: ['Application Control Policy'],
        remediation: { ownerId: 7, actionPlan: 'Remediate shared developer SSH key', dueDate: '2025-09-30' },
        quarters: {
          Q1: { actualScore: 5, targetScore: 7, observations: 'SentinelOne app control on workstations. Shared SSH key on Kubernetes nodes identified for Q3 remediation.', observationDate: '2025-01-21', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'RC.RP-03 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review backup checksum process\n2. Verify monthly integrity validation\n3. Examine quarterly restore testing\n4. Assess S3 Bucket Security project',
        linkedArtifacts: ['Backup Procedures'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Automated checksums for S3 backups. Monthly integrity validation and quarterly restore testing in place.', observationDate: '2025-01-22', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'RS.MI-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review automated containment capabilities\n2. Examine SentinelOne quarantine logs\n3. Verify GuardDuty auto-remediation\n4. Test manual containment procedures',
        linkedArtifacts: ['Containment Playbooks'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Automated containment via SentinelOne and GuardDuty. Manual playbooks for complex incidents.', observationDate: '2025-01-22', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.AE-03 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review CloudTrail aggregation\n2. Examine GuardDuty correlation\n3. Verify custom correlation scripts\n4. Assess multi-account centralization',
        linkedArtifacts: ['Event Correlation Architecture'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Event correlation via CloudTrail and GuardDuty. Custom scripts for cross-source analysis. Enhancements planned.', observationDate: '2025-01-23', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.CM-03 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review CloudTrail IAM logging\n2. Examine SSO authentication logs\n3. Verify failed authentication alerting\n4. Assess SOC dashboard progress',
        linkedArtifacts: ['IAM Monitoring Configuration'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Personnel monitoring via CloudTrail and SSO logs. SOC dashboards 60% complete for consolidated visibility.', observationDate: '2025-01-23', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.CM-09 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review O365 ATP configuration\n2. Examine Slack monitoring\n3. Verify system monitoring policy\n4. Assess data leak detection capabilities',
        linkedArtifacts: ['System Monitoring Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'O365 ATP covers email and web. Slack monitoring in place. DLP capabilities being evaluated for expansion.', observationDate: '2025-01-24', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.AM-02 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review AWS asset tracking\n2. Examine discovery scan results\n3. Verify container and VM monitoring\n4. Assess ASM vendor alignment',
        linkedArtifacts: ['Asset Inventory'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Software inventory at 85% coverage via AWS tools. ASM vendor selection will achieve comprehensive coverage.', observationDate: '2025-01-24', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.AM-07 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review data classification schema\n2. Examine tagging implementation\n3. Verify data scanning tool deployment\n4. Assess biometric data handling',
        linkedArtifacts: ['Data Classification Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Tiered classification schema in place. Biometric data highest sensitivity per SG1. Data scanning tool scheduling underway.', observationDate: '2025-01-25', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.IM-01 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review quarterly self-assessments\n2. Examine threat-informed risk assessments\n3. Verify KPI-driven gap analysis\n4. Assess investment decision process',
        linkedArtifacts: ['Self-Assessment Reports'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Quarterly self-assessments of critical services. TTD/TTR trends inform investment decisions.', observationDate: '2025-01-25', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'RS.MA-03 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review priority matrix documentation\n2. Examine sample incident tickets\n3. Verify SOC Manager validation\n4. Assess prioritization consistency',
        linkedArtifacts: ['Incident Priority Matrix'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Priority matrix based on scope, business impact, and time-criticality. ServiceNow tickets capture justification.', observationDate: '2025-01-26', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.AE-02 Ex3': {
        auditorId: 2,
        testProcedures: '1. Review manual log review cadence\n2. Examine review documentation\n3. Verify finding templates\n4. Assess automation gap tracking',
        linkedArtifacts: ['Log Review Procedures'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'Manual review for systems without automated monitoring. Documented process with finding templates. Automation gaps tracked.', observationDate: '2025-01-26', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'DE.AE-08 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review incident declaration criteria\n2. Examine sample declarations\n3. Verify SOC Manager authority\n4. Assess lessons learned integration',
        linkedArtifacts: ['Incident Declaration Criteria'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Documented criteria with severity thresholds. SOC Manager authority established. Lessons learned feed improvement.', observationDate: '2025-01-27', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'ID.RA-08 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review disclosure policy and SLAs\n2. Verify external intake process\n3. Examine supplier vulnerability sharing\n4. Sample disclosure handling',
        linkedArtifacts: ['Vulnerability Disclosure Policy'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Disclosure policy with SLAs in place. External intake via security@almasecurity.com. Sample disclosures show SLA compliance.', observationDate: '2025-01-27', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.AA-02 Ex2': {
        auditorId: 2,
        testProcedures: '1. Review no shared accounts policy\n2. Verify SSO credential uniqueness\n3. Examine privileged access reviews\n4. Assess shared SSH key remediation plan',
        linkedArtifacts: ['Information Security Policy'],
        remediation: { ownerId: 1, actionPlan: 'Remediate shared developer SSH key in Q3', dueDate: '2025-09-30' },
        quarters: {
          Q1: { actualScore: 6, targetScore: 7, observations: 'No shared accounts policy enforced via SSO. Quarterly privileged access reviews. Shared developer SSH key identified for remediation.', observationDate: '2025-01-28', testingStatus: 'Complete', examine: true, interview: true, test: true },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      },
      'PR.DS-10 Ex1': {
        auditorId: 2,
        testProcedures: '1. Review memory handling procedures\n2. Verify data retention limits\n3. Examine source code reviews\n4. Assess biometric data handling scrutiny',
        linkedArtifacts: ['Data Handling Procedures'],
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: { actualScore: 7, targetScore: 7, observations: 'Data-in-use protection documented. Source code reviews for crown jewels. Biometric data receives enhanced scrutiny per SG1.', observationDate: '2025-01-28', testingStatus: 'Complete', examine: true, interview: true, test: false },
          Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
          Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
        }
      }
    }
  }
];

// Helper to create default quarterly data structure
const createDefaultQuarter = () => ({
  actualScore: 0,
  targetScore: 0,
  observations: '',
  observationDate: '',
  testingStatus: 'Not Started',
  examine: false,
  interview: false,
  test: false
});

const createDefaultQuarters = () => ({
  Q1: createDefaultQuarter(),
  Q2: createDefaultQuarter(),
  Q3: createDefaultQuarter(),
  Q4: createDefaultQuarter()
});

// Helper to migrate old observation format to new quarterly format
const migrateObservationToQuarterly = (oldObs) => {
  if (!oldObs) return null;

  // If already has quarters structure, return as-is
  if (oldObs.quarters) return oldObs;

  // Migrate old format to Q1
  const methods = oldObs.assessmentMethods || {};
  return {
    auditorId: oldObs.auditorId || null,
    testProcedures: oldObs.testProcedures || '',
    linkedArtifacts: oldObs.linkedArtifacts || [],
    remediation: oldObs.remediation || { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: {
        actualScore: oldObs.actualScore || 0,
        targetScore: oldObs.targetScore || 0,
        observations: oldObs.observations || '',
        observationDate: oldObs.observationDate || '',
        testingStatus: oldObs.testingStatus || 'Not Started',
        examine: methods.examine || false,
        interview: methods.interview || false,
        test: methods.test || false
      },
      Q2: createDefaultQuarter(),
      Q3: createDefaultQuarter(),
      Q4: createDefaultQuarter()
    }
  };
};

const useAssessmentsStore = create(
  persist(
    (set, get) => ({
      assessments: DEFAULT_ASSESSMENTS,
      currentAssessmentId: null,
      loading: false,
      error: null,

      // History for undo/redo
      history: [],
      historyIndex: -1,

      // Set assessments with history tracking
      setAssessments: (assessments) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(state.assessments);

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          assessments,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          loading: false,
          error: null
        });
      },

      // Get all assessments
      getAssessments: () => get().assessments,

      // Get assessment by ID
      getAssessment: (assessmentId) => {
        return get().assessments.find(a => a.id === assessmentId);
      },

      // Get current assessment
      getCurrentAssessment: () => {
        const currentId = get().currentAssessmentId;
        return currentId ? get().getAssessment(currentId) : null;
      },

      // Set current assessment
      setCurrentAssessmentId: (assessmentId) => {
        set({ currentAssessmentId: assessmentId });
      },

      // Create new assessment
      createAssessment: (assessmentData) => {
        const assessments = get().assessments;
        const newId = `ASM-${Date.now()}`;

        const newAssessment = {
          id: newId,
          name: assessmentData.name || `Assessment ${assessments.length + 1}`,
          description: assessmentData.description || '',
          scopeType: assessmentData.scopeType || 'requirements', // 'requirements' or 'controls'
          scopeIds: assessmentData.scopeIds || [], // Array of requirement IDs or control IDs
          frameworkFilter: assessmentData.frameworkFilter || null, // Optional framework filter
          status: 'Not Started', // Not Started, In Progress, Complete
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),

          // Observations keyed by scoped item ID
          observations: {}
        };

        const updatedAssessments = [...assessments, newAssessment];
        get().setAssessments(updatedAssessments);
        set({ currentAssessmentId: newId });
        return newAssessment;
      },

      // Update assessment metadata
      updateAssessment: (assessmentId, updates) => {
        const updatedAssessments = get().assessments.map(a =>
          a.id === assessmentId
            ? { ...a, ...updates, lastModified: new Date().toISOString() }
            : a
        );
        get().setAssessments(updatedAssessments);
      },

      // Delete assessment
      deleteAssessment: (assessmentId) => {
        const updatedAssessments = get().assessments.filter(a => a.id !== assessmentId);
        get().setAssessments(updatedAssessments);
        if (get().currentAssessmentId === assessmentId) {
          set({ currentAssessmentId: null });
        }
      },

      // Add item to assessment scope
      addToScope: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        if (!assessment.scopeIds.includes(itemId)) {
          get().updateAssessment(assessmentId, {
            scopeIds: [...assessment.scopeIds, itemId]
          });
        }
      },

      // Remove item from assessment scope
      removeFromScope: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        get().updateAssessment(assessmentId, {
          scopeIds: assessment.scopeIds.filter(id => id !== itemId)
        });

        // Also remove observations for this item
        const observations = { ...assessment.observations };
        delete observations[itemId];
        get().updateAssessment(assessmentId, { observations });
      },

      // Bulk add to scope
      bulkAddToScope: (assessmentId, itemIds) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const newIds = [...new Set([...assessment.scopeIds, ...itemIds])];
        get().updateAssessment(assessmentId, { scopeIds: newIds });
      },

      // Get observation for a scoped item (with quarterly structure)
      getObservation: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return null;

        const stored = assessment.observations[itemId];

        // If stored observation exists, ensure it has quarterly structure
        if (stored) {
          // Migrate if needed
          if (!stored.quarters) {
            return migrateObservationToQuarterly(stored);
          }
          return stored;
        }

        // Return default structure with quarterly data
        return {
          auditorId: null,
          testProcedures: '',
          linkedArtifacts: [],
          remediation: {
            ownerId: null,
            actionPlan: '',
            dueDate: ''
          },
          quarters: createDefaultQuarters()
        };
      },

      // Update observation for a scoped item
      // observationData can include: auditorId, testProcedures, linkedArtifacts, remediation
      // For quarterly data, use updateQuarterlyObservation instead
      updateObservation: (assessmentId, itemId, observationData) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const currentObservation = get().getObservation(assessmentId, itemId);
        const sanitizedData = {
          ...observationData,
          testProcedures: observationData.testProcedures !== undefined
            ? sanitizeInput(observationData.testProcedures)
            : currentObservation.testProcedures,
          remediation: observationData.remediation
            ? {
                ...currentObservation.remediation,
                ...observationData.remediation,
                actionPlan: observationData.remediation.actionPlan
                  ? sanitizeInput(observationData.remediation.actionPlan)
                  : currentObservation.remediation.actionPlan
              }
            : currentObservation.remediation,
          quarters: currentObservation.quarters || createDefaultQuarters()
        };

        const updatedObservations = {
          ...assessment.observations,
          [itemId]: {
            ...currentObservation,
            ...sanitizedData
          }
        };

        get().updateAssessment(assessmentId, { observations: updatedObservations });
      },

      // Update quarterly observation data for a specific quarter
      updateQuarterlyObservation: (assessmentId, itemId, quarter, quarterData) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;
        if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) return;

        const currentObservation = get().getObservation(assessmentId, itemId);
        const currentQuarter = currentObservation.quarters?.[quarter] || createDefaultQuarter();

        const sanitizedQuarterData = {
          ...currentQuarter,
          ...quarterData,
          observations: quarterData.observations !== undefined
            ? sanitizeInput(quarterData.observations)
            : currentQuarter.observations
        };

        const updatedObservations = {
          ...assessment.observations,
          [itemId]: {
            ...currentObservation,
            quarters: {
              ...currentObservation.quarters,
              [quarter]: sanitizedQuarterData
            }
          }
        };

        get().updateAssessment(assessmentId, { observations: updatedObservations });
      },

      // Get assessment progress (considers all quarters - complete if any quarter is complete)
      getAssessmentProgress: (assessmentId, quarter = null) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return { total: 0, completed: 0, percentage: 0 };

        const total = assessment.scopeIds.length;

        // Helper to get testing status considering quarterly structure
        const getTestingStatus = (obs) => {
          if (!obs) return 'Not Started';

          // New quarterly structure
          if (obs.quarters) {
            if (quarter) {
              return obs.quarters[quarter]?.testingStatus || 'Not Started';
            }
            // If no specific quarter, consider complete if any quarter is complete
            const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'Complete') return 'Complete';
            }
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'In Progress') return 'In Progress';
            }
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'Submitted') return 'Submitted';
            }
            return 'Not Started';
          }

          // Legacy structure
          return obs.testingStatus || 'Not Started';
        };

        const completed = assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return getTestingStatus(obs) === 'Complete';
        }).length;

        const inProgress = assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return getTestingStatus(obs) === 'In Progress';
        }).length;

        return {
          total,
          completed,
          inProgress,
          notStarted: total - completed - inProgress,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      },

      // Get items needing remediation
      getRemediationItems: (assessmentId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return [];

        return assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return obs && obs.remediation && (
            obs.remediation.ownerId ||
            obs.remediation.actionPlan ||
            obs.remediation.dueDate
          );
        }).map(itemId => ({
          itemId,
          ...assessment.observations[itemId]
        }));
      },

      // Undo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            assessments: state.history[newIndex],
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
            assessments: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Export assessment to CSV with quarterly columns
      exportAssessmentCSV: (assessmentId, controlsStore, requirementsStore, userStore) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const getItemName = (itemId) => {
          if (assessment.scopeType === 'controls') {
            const control = controlsStore.getState().getControl(itemId);
            return control ? control.controlId : itemId;
          } else {
            const req = requirementsStore.getState().getRequirement(itemId);
            return req ? req.id : itemId;
          }
        };

        const csvData = assessment.scopeIds.map(itemId => {
          const rawObs = assessment.observations[itemId] || {};
          const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
          const remediation = obs.remediation || {};

          const row = {
            'ID': getItemName(itemId),
            'Assessment': assessment.name,
            'Scope Type': assessment.scopeType,
            'Auditor': getUserName(obs.auditorId),
            'Test Procedure(s)': obs.testProcedures || ''
          };

          // Add quarterly columns
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            const qData = obs.quarters?.[q] || createDefaultQuarter();
            row[`${q} Actual Score`] = qData.actualScore || 0;
            row[`${q} Target Score`] = qData.targetScore || 0;
            row[`${q} Observations`] = qData.observations || '';
            row[`${q} Observation Date`] = qData.observationDate || '';
            row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
            row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
            row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
            row[`${q} Test`] = qData.test ? 'Yes' : 'No';
          });

          row['Linked Artifacts'] = (obs.linkedArtifacts || []).join('; ');
          row['Remediation Owner'] = getUserName(remediation.ownerId);
          row['Action Plan'] = remediation.actionPlan || '';
          row['Remediation Due Date'] = remediation.dueDate || '';

          return row;
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const safeName = assessment.name.replace(/[^a-z0-9]/gi, '_');

        link.setAttribute('href', url);
        link.setAttribute('download', `assessment_${safeName}_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Clone assessment (for new assessment period)
      cloneAssessment: (assessmentId, newName) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return null;

        const newAssessment = {
          ...assessment,
          id: `ASM-${Date.now()}`,
          name: newName || `${assessment.name} (Copy)`,
          status: 'Not Started',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          // Reset all observations
          observations: {}
        };

        const updatedAssessments = [...get().assessments, newAssessment];
        get().setAssessments(updatedAssessments);
        return newAssessment;
      },

      // Import assessments from CSV with quarterly columns support
      importAssessmentsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              // Group rows by assessment name
              // Carry forward assessment name from previous row if current row is blank
              const assessmentGroups = {};
              let lastAssessmentName = null;
              let lastScopeType = 'controls';

              results.data.forEach(row => {
                let assessmentName = row['Assessment'] || row['Assessment Name'] || row.assessment;

                // If assessment name is empty, use the last known assessment name
                if (!assessmentName && lastAssessmentName) {
                  assessmentName = lastAssessmentName;
                }

                if (!assessmentName) return;

                // Track for subsequent rows
                lastAssessmentName = assessmentName;

                if (!assessmentGroups[assessmentName]) {
                  const scopeType = (row['Scope Type'] || row.scopeType || lastScopeType || 'controls').toLowerCase();
                  lastScopeType = scopeType;
                  assessmentGroups[assessmentName] = {
                    name: assessmentName,
                    description: row['Description'] || row.description || '',
                    scopeType: scopeType,
                    frameworkFilter: row['Framework Filter'] || row.frameworkFilter || null,
                    rows: []
                  };
                }
                assessmentGroups[assessmentName].rows.push(row);
              });

              // Parse user string helper
              const parseUserString = (str) => {
                if (!str || !str.trim()) return null;
                str = str.trim();
                const match = str.match(/^(.+?)\s*<([^>]+)>$/);
                if (match) {
                  return { name: match[1].trim(), email: match[2].trim() };
                }
                if (str.includes('@')) {
                  const namePart = str.split('@')[0].replace(/[._]/g, ' ');
                  return { name: namePart, email: str };
                }
                return { name: str, email: null };
              };

              // Helper to convert Excel serial date to ISO date string (YYYY-MM-DD)
              const parseDate = (value) => {
                if (!value) return '';
                const str = String(value).trim();
                if (!str) return '';

                // Check if it's a number (Excel serial date)
                const num = parseFloat(str);
                if (!isNaN(num) && num > 1000 && num < 100000) {
                  // Excel serial date: days since January 1, 1900
                  // Note: Excel incorrectly treats 1900 as a leap year, so subtract 1 for dates after Feb 28, 1900
                  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 (to account for Excel's off-by-one)
                  const date = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
                  return date.toISOString().split('T')[0];
                }

                // Already a date string - return as-is
                return str;
              };

              // Helper to detect if CSV has quarterly columns
              const hasQuarterlyColumns = results.meta.fields?.some(f => f.startsWith('Q1 '));

              // Helper to parse quarter data from row
              const parseQuarterData = (row, quarter) => ({
                actualScore: parseFloat(row[`${quarter} Actual Score`]) || 0,
                targetScore: parseFloat(row[`${quarter} Target Score`]) || 0,
                observations: sanitizeInput(row[`${quarter} Observations`] || ''),
                observationDate: parseDate(row[`${quarter} Observation Date`]),
                testingStatus: row[`${quarter} Testing Status`] || 'Not Started',
                examine: (row[`${quarter} Examine`] || '').toLowerCase() === 'yes',
                interview: (row[`${quarter} Interview`] || '').toLowerCase() === 'yes',
                test: (row[`${quarter} Test`] || '').toLowerCase() === 'yes'
              });

              // Create assessments
              const newAssessments = Object.values(assessmentGroups).map(group => {
                const scopeIds = [];
                const observations = {};

                group.rows.forEach(row => {
                  const itemId = row['ID'] || row['Item ID'] || row.itemId || row.id;
                  if (!itemId) return;

                  scopeIds.push(itemId);

                  // Parse auditor
                  let auditorId = null;
                  const auditorStr = row['Auditor'] || row.auditor;
                  if (auditorStr && findOrCreateUser) {
                    const info = parseUserString(auditorStr);
                    if (info) auditorId = findOrCreateUser(info);
                  }

                  // Parse remediation owner
                  let remediationOwnerId = null;
                  const remOwnerStr = row['Remediation Owner'] || row.remediationOwner;
                  if (remOwnerStr && findOrCreateUser) {
                    const info = parseUserString(remOwnerStr);
                    if (info) remediationOwnerId = findOrCreateUser(info);
                  }

                  if (hasQuarterlyColumns) {
                    // New quarterly format
                    observations[itemId] = {
                      auditorId,
                      testProcedures: sanitizeInput(row['Test Procedure(s)'] || row['Test Procedures'] || ''),
                      linkedArtifacts: (row['Linked Artifacts'] || row.linkedArtifacts || '')
                        .split(';').map(s => s.trim()).filter(Boolean),
                      remediation: {
                        ownerId: remediationOwnerId,
                        actionPlan: sanitizeInput(row['Action Plan'] || row.actionPlan || ''),
                        dueDate: parseDate(row['Remediation Due Date'] || row['Due Date'] || row.dueDate)
                      },
                      quarters: {
                        Q1: parseQuarterData(row, 'Q1'),
                        Q2: parseQuarterData(row, 'Q2'),
                        Q3: parseQuarterData(row, 'Q3'),
                        Q4: parseQuarterData(row, 'Q4')
                      }
                    };
                  } else {
                    // Legacy single-period format - migrate to Q1
                    observations[itemId] = {
                      auditorId,
                      testProcedures: sanitizeInput(row['Test Procedure(s)'] || row['Test Procedures'] || ''),
                      linkedArtifacts: (row['Linked Artifacts'] || row.linkedArtifacts || '')
                        .split(';').map(s => s.trim()).filter(Boolean),
                      remediation: {
                        ownerId: remediationOwnerId,
                        actionPlan: sanitizeInput(row['Action Plan'] || row.actionPlan || ''),
                        dueDate: parseDate(row['Remediation Due Date'] || row['Due Date'] || row.dueDate)
                      },
                      quarters: {
                        Q1: {
                          actualScore: parseFloat(row['Actual Score'] || row.actualScore) || 0,
                          targetScore: parseFloat(row['Target Score'] || row.targetScore) || 0,
                          observations: sanitizeInput(row['Observations'] || row.observations || ''),
                          observationDate: parseDate(row['Observation Date'] || row.observationDate),
                          testingStatus: row['Testing Status'] || row.testingStatus || 'Not Started',
                          examine: (row['Examine'] || '').toLowerCase() === 'yes',
                          interview: (row['Interview'] || '').toLowerCase() === 'yes',
                          test: (row['Test'] || '').toLowerCase() === 'yes'
                        },
                        Q2: createDefaultQuarter(),
                        Q3: createDefaultQuarter(),
                        Q4: createDefaultQuarter()
                      }
                    };
                  }
                });

                return {
                  id: `ASM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: group.name,
                  description: group.description,
                  scopeType: group.scopeType,
                  scopeIds: [...new Set(scopeIds)],
                  frameworkFilter: group.frameworkFilter,
                  status: 'Not Started',
                  createdDate: new Date().toISOString(),
                  lastModified: new Date().toISOString(),
                  observations
                };
              });

              // Add to existing assessments
              const updatedAssessments = [...get().assessments, ...newAssessments];
              get().setAssessments(updatedAssessments);
              resolve(newAssessments.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Export all assessments to CSV with quarterly columns
      exportAllAssessmentsCSV: (controlsStore, requirementsStore, userStore) => {
        const assessments = get().assessments;
        if (assessments.length === 0) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const csvData = [];

        assessments.forEach(assessment => {
          const getItemName = (itemId) => {
            if (assessment.scopeType === 'controls') {
              const control = controlsStore.getState().getControl(itemId);
              return control ? control.controlId : itemId;
            } else {
              const req = requirementsStore.getState().getRequirement(itemId);
              return req ? req.id : itemId;
            }
          };

          assessment.scopeIds.forEach(itemId => {
            const rawObs = assessment.observations[itemId] || {};
            const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
            const remediation = obs.remediation || {};

            const row = {
              'ID': getItemName(itemId),
              'Assessment': assessment.name,
              'Description': assessment.description || '',
              'Scope Type': assessment.scopeType,
              'Framework Filter': assessment.frameworkFilter || '',
              'Auditor': getUserName(obs.auditorId),
              'Test Procedure(s)': obs.testProcedures || ''
            };

            // Add quarterly columns
            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
              const qData = obs.quarters?.[q] || createDefaultQuarter();
              row[`${q} Actual Score`] = qData.actualScore || 0;
              row[`${q} Target Score`] = qData.targetScore || 0;
              row[`${q} Observations`] = qData.observations || '';
              row[`${q} Observation Date`] = qData.observationDate || '';
              row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
              row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
              row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
              row[`${q} Test`] = qData.test ? 'Yes' : 'No';
            });

            row['Linked Artifacts'] = (obs.linkedArtifacts || []).join('; ');
            row['Remediation Owner'] = getUserName(remediation.ownerId);
            row['Action Plan'] = remediation.actionPlan || '';
            row['Remediation Due Date'] = remediation.dueDate || '';

            csvData.push(row);
          });
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `assessments_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }),
    {
      name: 'csf-assessments-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Version 1: Migrate observations to quarterly structure
        if (version === 0 && persistedState?.assessments) {
          const migratedAssessments = persistedState.assessments.map(assessment => {
            if (!assessment.observations) return assessment;

            const migratedObservations = {};
            Object.entries(assessment.observations).forEach(([itemId, obs]) => {
              // Only migrate if not already in quarterly format
              if (!obs.quarters) {
                migratedObservations[itemId] = migrateObservationToQuarterly(obs);
              } else {
                migratedObservations[itemId] = obs;
              }
            });

            return {
              ...assessment,
              observations: migratedObservations
            };
          });

          return {
            ...persistedState,
            assessments: migratedAssessments
          };
        }
        // Version 2: Added default assessment for new installations
        // Existing users with data keep their assessments, new users get defaults
        if (version < 2) {
          if (persistedState?.assessments?.length > 0) {
            // Existing user with data - keep their assessments
            return persistedState;
          }
          // New user or empty state - use defaults
          return { assessments: DEFAULT_ASSESSMENTS, currentAssessmentId: null };
        }
        return persistedState;
      },
      partialize: (state) => ({
        assessments: state.assessments,
        currentAssessmentId: state.currentAssessmentId
      })
    }
  )
);

export default useAssessmentsStore;
