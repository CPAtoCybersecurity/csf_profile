// Updated assessment observations data extracted from CSV
// This file contains the quarterly observation data for the 38 controls in scope
// Generated from yyyy-mm-dd_CSF_Profile.csv

export const UPDATED_OBSERVATIONS = {
  'GV.SC-04 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review supplier inventory in ServiceNow\n2. Verify criticality ratings against documented criteria\n3. Interview procurement team on tiering process\n4. Sample quarterly review documentation',
    linkedArtifacts: ['Third Party Risk Management Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'The IT Manager explained that GRC verified that:\nSupplier risk tiers documented in Third Party Risk Management Policy. No PO No Pay policy, and all suppliers paid were identified and ranked by data sensitivity, system access level, and mission importance.', observationDate: '2025-01-10', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Criticality framework operationalized with ServiceNow integration. Automated supplier risk scoring deployed. Quarterly reviews of supplier criticality ratings conducted with stakeholder sign-off.', observationDate: '2025-04-05', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-01', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.OC-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review mission documentation on website\n2. Examine Board briefing materials\n3. Interview CISO on mission alignment\n4. Verify security investment ties to mission objectives',
    linkedArtifacts: ['Security Governance Charter', 'Board Briefing Materials'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Mission "Ensure businesses can continuously authenticate users using their whole selves" documented and communicated organization-wide. Mission directly informs risk appetite and security investment decisions.', observationDate: '2025-01-11', testingStatus: 'Complete', examine: true, interview: false, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Mission-aligned risk management fully operational. Board receives quarterly security posture updates tied to mission objectives. Apple Passkey partnership risk assessment completed supporting G8 goal.', observationDate: '2025-04-06', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-02', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RR-02 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review Information Security Policy\n2. Examine RACI matrix\n3. Verify reporting structure\n4. Interview security team leads',
    linkedArtifacts: ['Information Security Policy', 'RACI Matrix'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'RACI matrix completed and communicated. Security team roles clearly defined: Nadia Khan (D&R Lead), Chris Magann (VM Lead), Tigan Wang (VM). Risk management authorities documented in policy.', observationDate: '2025-01-12', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Roles enforced through formal governance process. Team expanded per STS1 hiring strategy. Cross-functional coordination meetings established with IT, Legal, and Product teams.', observationDate: '2025-04-07', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-03', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.OC-02 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review stakeholder identification process\n2. Examine Board meeting minutes\n3. Review customer trust survey results\n4. Verify security service catalog',
    linkedArtifacts: ['Security Service Catalog'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'The IT Manager explained that:\n- Internal and external stakeholder mapping completed. \n- Customer expectations for biometric data security documented. \nInspected executive presentations, minutes and Risk Committee charter. No exceptions noted.', observationDate: '2025-01-13', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Stakeholder expectations integrated into security service catalog. Public trust rebuilding program (addressing 2022 events) showing measurable progress. Regular stakeholder feedback mechanisms operational.', observationDate: '2025-04-08', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-04', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.OV-01 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review KPI definitions and targets\n2. Examine quarterly KPI reports\n3. Verify Board review of KPI trends\n4. Assess investment decision linkage to KPIs',
    linkedArtifacts: ['KPI Dashboard', 'Board Reports'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Comprehensive KPI framework operational: TTD=9hrs (down from 81hrs), TTI=14hrs, TTR-CJC=8 days, TTR-C=12 days. Board reviews strategy outcomes quarterly. Risk strategies balanced against operational needs.', observationDate: '2025-01-14', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Strategy outcomes drive resource allocation. TTR-CJC now under 6 days (Mar 2024). Detection capability investments approved based on KPI trends. Innovation-enabling approach adopted.', observationDate: '2025-04-09', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-05', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RM-01 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review risk management objectives\n2. Verify Board approval documentation\n3. Examine automated dashboards\n4. Assess alignment with company goals',
    linkedArtifacts: ['Risk Register', 'Board Approval Documentation'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Measurable risk management objectives established with Board approval: TTD <4min by Jan 2025, TTR-CJC <16hrs by Aug 2025. Objectives aligned with company goals G1-G8.', observationDate: '2025-01-15', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Objectives tracked with automated dashboards. Significant progress: TTD reduced 89% from baseline. ASM vendor selected to address R2/R4 risks. Monthly management reviews of objective progress.', observationDate: '2025-04-10', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-06', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RR-01 Ex4': {
    auditorId: 2,
    testProcedures: '1. Review Security Governance Charter\n2. Verify CISO reporting structure\n3. Examine coordination meeting records\n4. Assess hiring strategy progress',
    linkedArtifacts: ['Security Governance Charter'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Security governance charter approved. CISO reports directly to CEO with Board visibility. Authority reviews completed. Coordination protocols established despite staffing constraints.', observationDate: '2025-01-16', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Leadership accountability demonstrated through quarterly Board presentations. Hiring authority approved for 5 additional A-tier professionals (STS1). Cross-functional coordination meetings formalized.', observationDate: '2025-04-11', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-07', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-01 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review SCRM program documentation\n2. Examine vendor management policy\n3. Verify ServiceNow workflows\n4. Assess Apple Passkey vendor requirements',
    linkedArtifacts: ['Vendor Management Policy', 'SCRM Strategy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'SCRM program established with documented strategy, objectives, and policies. Vendor management policy approved. ServiceNow assessment workflows deployed for critical vendors.', observationDate: '2025-01-17', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Program processes fully operational. Apple Passkey integration (G8) vendor requirements defined and enforced. Program performance metrics tracked. Feb 2025 audit scope finalized.', observationDate: '2025-04-12', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-08', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-02 Ex7': {
    auditorId: 2,
    testProcedures: '1. Review RACI for SCRM roles\n2. Verify procurement training records\n3. Examine supplier contract templates\n4. Assess RFP security clauses',
    linkedArtifacts: ['RACI Matrix', 'RFP Templates'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Supplier cybersecurity roles documented internally. RACI for third-party risk management completed. Procurement team trained on SCRM responsibilities.', observationDate: '2025-01-18', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Roles communicated externally to all critical suppliers via updated contracts. Procurement staff certified on SCRM. Supplier security requirements included in RFP templates.', observationDate: '2025-04-13', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-09', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-06 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review ServiceNow onboarding workflows\n2. Verify security questionnaire process\n3. Examine sample vendor assessments\n4. Assess remediation tracking for Apple Passkey vendor',
    linkedArtifacts: ['Vendor Assessment Template'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Vendor risk assessment criteria standardized. ServiceNow onboarding workflow operational. Due diligence requirements documented for all vendor tiers.', observationDate: '2025-01-19', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Risk assessments mandatory before contract execution. Apple Passkey vendor assessment completed with remediation tracking. Assessment results inform contract terms.', observationDate: '2025-04-14', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '2025-06-10', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-10 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review offboarding checklist\n2. Verify access termination timeframes\n3. Sample audit of terminated vendors\n4. Examine audit trail documentation',
    linkedArtifacts: ['Vendor Offboarding Checklist'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Comprehensive offboarding checklist implemented. Supplier access termination procedures documented. Access reviews conducted upon contract termination.', observationDate: '2025-01-20', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Automated access deactivation within 24 hours for terminated suppliers. Sample audits confirm compliance. Offboarding process integrated with procurement workflow.', observationDate: '2025-04-15', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-11', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-09 Ex5': {
    auditorId: 2,
    testProcedures: '1. Review hardware change verification procedures\n2. Examine AWS Config rules\n3. Verify infrastructure-as-code baselines\n4. Assess lifecycle monitoring',
    linkedArtifacts: ['Change Management Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Supply chain security practices documented in cybersecurity policy. Critical hardware change verification procedures established. Integration with ERM program initiated.', observationDate: '2025-01-21', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Full ERM integration achieved. Hardware change verification automated where possible. Lifecycle monitoring operational for critical technology products.', observationDate: '2025-04-16', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-12', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-07 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review change management policy\n2. Examine ServiceNow change records\n3. Sample audit change compliance\n4. Verify crown jewel additional review process',
    linkedArtifacts: ['Change Management Policy'],
    remediation: { ownerId: null, actionPlan: 'Implement automated change management enforcement in ServiceNow. Extend mandatory risk impact assessments to all systems (not just crown jewels). Conduct training for all teams on change documentation requirements. Target 95% compliance.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 1, targetScore: 5, observations: 'Change management policy exists. Exception documentation process established but enforcement inconsistent across teams.', observationDate: '2025-01-22', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Change requests formally documented and tracked. Risk impact assessments required for crown jewel systems. Sample audits show 85% compliance with documented procedures.', observationDate: '2025-04-17', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '2025-06-13', testingStatus: 'In Progress', examine: false, interview: true, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.AT-01 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review training program documentation\n2. Verify Workday training records\n3. Examine phishing simulation results\n4. Assess new hire onboarding process',
    linkedArtifacts: ['Security Awareness Program'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 4, targetScore: 5, observations: 'Security awareness program operational with quarterly training. Social engineering and phishing modules deployed. Training records maintained in Workday with 90% completion rate.', observationDate: '2025-01-23', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Training program achieving target completion rates. Phishing simulation click rates improved 40% from baseline. Cyber hygiene training integrated into new hire onboarding.', observationDate: '2025-04-18', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-14', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.IR-02 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review data center environmental controls\n2. Verify AWS multi-AZ deployment\n3. Examine threat assessments\n4. Test response procedures',
    linkedArtifacts: ['Environmental Threat Assessment'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 1, targetScore: 5, observations: 'Redwood City data center environmental controls documented. Windows DC hosting 300 employees protected. AWS infrastructure leverages native resilience controls.', observationDate: '2025-01-24', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Environmental threat protection verified and documented. AWS multi-AZ deployment operational. On-prem DC controls tested and certified. Fire suppression and HVAC monitoring active.', observationDate: '2025-04-19', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-15', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MI-02 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review eradication playbooks\n2. Examine incident response project status\n3. Verify escalation paths\n4. Test sample eradication scenarios',
    linkedArtifacts: ['Incident Response Playbooks'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Eradication procedures documented with defined escalation paths. TTI at 14 hours. Nadia Khan leads D&R with documented playbooks for common incident types.', observationDate: '2025-01-25', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Eradication capabilities mature. Incident Response Enhancement project ($150K) delivering improved playbooks. Manual eradication options well-documented with decision trees.', observationDate: '2025-04-20', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '2025-06-16', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-02 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review CloudTrail and GuardDuty configuration\n2. Examine detection rule tuning\n3. Verify TTD metrics\n4. Assess 24/7 monitoring gaps',
    linkedArtifacts: ['SIEM Configuration'],
    remediation: { ownerId: null, actionPlan: 'Complete Incident Response Enhancement project deliverables for 24/7 monitoring. Add additional SIEM use cases for non-AWS systems. Implement log analysis automation to reduce manual review burden.', dueDate: '2026-08-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'CloudTrail and GuardDuty provide SIEM-like functionality. TTD at 9 hours. Malicious activity detection rules tuned based on threat intelligence.', observationDate: '2025-01-26', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'SIEM monitoring expanded with additional use cases. Log analysis frequency increased. Incident Response Enhancement project addressing 24/7 monitoring gap.', observationDate: '2025-04-21', testingStatus: 'Complete', examine: false, interview: true, test: false },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '2025-06-17', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-06 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review alert routing configuration\n2. Examine SOC procedures\n3. Verify on-call rotation\n4. Assess alert triage effectiveness',
    linkedArtifacts: ['SOC Procedures'],
    remediation: { ownerId: null, actionPlan: 'Hire additional SOC staff per STS1 strategy to enable 24/7 coverage. Complete SOC handoff procedure documentation. Implement automated alert escalation for critical severity findings.', dueDate: '2026-10-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'GuardDuty alerts configured and routed to security team. Alert prioritization matrix implemented. Business hours coverage with on-call rotation.', observationDate: '2025-01-27', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'Alert routing enhanced with severity-based escalation. SOC handoff procedures documented. Progress toward 24/7 coverage with planned staffing increase.', observationDate: '2025-04-22', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-18', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review network monitoring tools\n2. Verify CloudTrail and VPC Flow Logs\n3. Assess ASM vendor selection progress\n4. Examine SOC dashboards',
    linkedArtifacts: ['Network Monitoring Architecture', 'SOC-Ticket-1004'],
    remediation: { ownerId: null, actionPlan: 'Complete ASM solution deployment and integration. Expand DNS/BGP monitoring coverage to all network segments. Deploy network service monitoring dashboards to SOC. Address R2 risk register item.', dueDate: '2026-08-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Network monitoring via CloudTrail and VPC Flow Logs. DNS monitoring configured. External perimeter visibility limited pending ASM deployment.', observationDate: '2025-01-28', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'ASM vendor selected (addressing R2). DNS/BGP monitoring operational. Network service monitoring dashboards deployed. Coverage expanding per implementation plan.', observationDate: '2025-04-23', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 4, targetScore: 5, observations: '', observationDate: '2025-06-19', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 4, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review vulnerability scanning configuration\n2. Examine weekly vulnerability reports\n3. Verify TTR-C metrics\n4. Assess prioritization process',
    linkedArtifacts: ['Vulnerability Management Program'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Vulnerability scanning operational with Chris Magann and Tigan Wang leading VM program. Scan configs documented. Regular scanning of crown jewel systems.', observationDate: '2025-01-29', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 5, targetScore: 5, observations: 'VM program mature with TTR-C at 11 days (Apr 2024). Vulnerability reports reviewed weekly. Crown jewel systems prioritized. Automated scanning and reporting operational.', observationDate: '2025-04-24', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '2025-06-20', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.DS-01 Ex4': {
    auditorId: 2,
    testProcedures: '1. Review encryption policy\n2. Verify S3 bucket encryption\n3. Examine SentinelOne removable media controls\n4. Assess Data Encryption Upgrade project',
    linkedArtifacts: ['Encryption Policy'],
    remediation: { ownerId: null, actionPlan: 'Execute Data Encryption Upgrade project ($95K). Extend removable media controls to all managed endpoints including servers. Verify S3 bucket encryption enforcement across all buckets.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Encryption policy documented and approved. S3 bucket security project in progress. Removable media restrictions planned for endpoint deployment.', observationDate: '2025-01-30', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 4, targetScore: 5, observations: 'Data encryption upgrade project approved ($95K). Removable media controls deployed on managed endpoints. S3 bucket encryption enforced.', observationDate: '2025-04-25', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-21', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.IR-03 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review AWS multi-AZ configuration\n2. Examine Kubernetes redundancy\n3. Verify failover testing records\n4. Assess DR plan development',
    linkedArtifacts: ['DR Plan'],
    remediation: { ownerId: null, actionPlan: 'Complete DR plan development under Cloud Security Optimization project. Conduct additional failover testing scenarios. Document and test recovery procedures for all critical workloads.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'AWS provides multi-AZ redundancy. Kubernetes infrastructure configured for resilience. HA components deployed for critical workloads.', observationDate: '2025-01-31', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'Resilience mechanisms documented and tested. Failover testing completed successfully. DR plan development progressing as part of cloud security optimization project.', observationDate: '2025-04-26', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 4, targetScore: 5, observations: '', observationDate: '2025-06-22', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 4, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.PS-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review hardened baselines documentation\n2. Verify AWS Config compliance\n3. Examine deviation alerting\n4. Assess legacy Windows 2012 upgrade plan',
    linkedArtifacts: ['Hardening Standards'],
    remediation: { ownerId: null, actionPlan: 'Complete Windows 2012 fileserver upgrade to supported OS version. Extend hardened baseline deployment to remaining 5% of systems. Implement automated baseline compliance remediation.', dueDate: '2026-08-31' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Configuration baselines established for Amazon Linux 2 and Ubuntu. Windows 2012 fileserver remediation planned. Baseline compliance monitored.', observationDate: '2025-02-01', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'Config management policy enforced. Hardened baselines deployed to 95% of systems. Legacy Windows 2012 upgrade project initiated with Q3 completion target.', observationDate: '2025-04-27', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '2025-06-23', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.PS-05 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review SentinelOne application control\n2. Verify app control policy\n3. Examine Kubernetes node restrictions\n4. Assess shared SSH key remediation',
    linkedArtifacts: ['Application Control Policy'],
    remediation: { ownerId: null, actionPlan: 'Remediate shared developer SSH key on Kubernetes nodes - issue individual keys per developer. Expand server-side application control deployment. Complete app control policy exception review.', dueDate: '2026-08-15' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'SentinelOne deployed on workstations/laptops with application control. Server-side controls being evaluated.', observationDate: '2025-02-02', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 4, targetScore: 5, observations: 'App control policy approved and deployed. SentinelOne enforcement expanded. Kubernetes node SSH access remediation in progress (shared key to be replaced).', observationDate: '2025-04-28', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 7, targetScore: 5, observations: '', observationDate: '2025-06-24', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 7, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RC.RP-03 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review backup checksum process\n2. Verify monthly integrity validation\n3. Examine quarterly restore testing\n4. Assess S3 Bucket Security project',
    linkedArtifacts: ['Backup Procedures'],
    remediation: { ownerId: null, actionPlan: 'Implement automated IOC scanning for backup restoration assets. Expand quarterly restore testing to cover all critical systems. Complete S3 bucket security project backup protection enhancements.', dueDate: '2026-10-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Backup verification procedures documented. DR Manager validates backup integrity monthly. Manual integrity checks performed.', observationDate: '2025-02-03', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Backup integrity verification improved with automated checksums. Restore testing scheduled quarterly. S3 bucket security project enhances backup protection.', observationDate: '2025-04-29', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '2025-06-25', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MI-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review automated containment capabilities\n2. Examine SentinelOne quarantine logs\n3. Verify GuardDuty auto-remediation\n4. Test manual containment procedures',
    linkedArtifacts: ['Containment Playbooks'],
    remediation: { ownerId: null, actionPlan: 'Expand GuardDuty auto-remediation to additional finding types. Develop automated containment playbooks for top 10 incident types. Integrate containment actions with SOAR capabilities.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'SentinelOne provides automated containment for malware. GuardDuty auto-remediation configured for select findings. Incident response playbooks documented.', observationDate: '2025-02-04', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Containment capabilities expanded. Automated response for common threat patterns. Manual containment procedures well-documented for complex scenarios.', observationDate: '2025-04-30', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 4, targetScore: 5, observations: '', observationDate: '2025-06-26', testingStatus: 'Submitted', examine: false, interview: true, test: false },
      Q4: { actualScore: 4, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-03 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review CloudTrail aggregation\n2. Examine GuardDuty correlation\n3. Verify custom correlation scripts\n4. Assess multi-account centralization',
    linkedArtifacts: ['Event Correlation Architecture'],
    remediation: { ownerId: null, actionPlan: 'Complete correlation script updates for enhanced cross-source analysis. Integrate additional log sources beyond AWS into correlation engine. Deploy centralized SIEM dashboard for multi-source visibility.', dueDate: '2026-10-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'CloudTrail and GuardDuty provide event correlation. Multiple AWS sources integrated. SIEM-style correlation limited to AWS-native tools.', observationDate: '2025-02-05', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Event correlation improving with additional source integration. GuardDuty findings correlated across accounts. Script updates planned for enhanced correlation.', observationDate: '2025-05-01', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-03 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review CloudTrail IAM logging\n2. Examine SSO authentication logs\n3. Verify failed authentication alerting\n4. Assess SOC dashboard progress',
    linkedArtifacts: ['IAM Monitoring Configuration', 'SOC-Ticket-1005'],
    remediation: { ownerId: null, actionPlan: 'Complete SOC dashboard development (currently 60%). Implement automated alerting for anomalous access patterns. Expand failed authentication monitoring to all authentication systems.', dueDate: '2026-08-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Logical access monitoring via CloudTrail. SSO with Windows Authenticator and Palo Alto 2FA provides authentication logging. IAM team reviews anomalies.', observationDate: '2025-02-06', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Access pattern monitoring enhanced. Failed authentication tracking and alerting operational. SOC dashboard development 60% complete.', observationDate: '2025-05-02', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-09 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review O365 ATP configuration\n2. Examine Slack monitoring\n3. Verify system monitoring policy\n4. Assess data leak detection capabilities',
    linkedArtifacts: ['System Monitoring Policy'],
    remediation: { ownerId: null, actionPlan: 'Deploy data leak detection capabilities. Expand collaboration service monitoring to cover all sanctioned applications. Tune O365 ATP rules based on false positive analysis.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'O365 ATP monitors email/web traffic. Slack communications monitored for policy violations. Data leak detection capabilities being evaluated.', observationDate: '2025-02-07', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'System monitoring policy documented and approved. O365 ATP tuned for Alma-specific threats. Collaboration service monitoring scope expanded.', observationDate: '2025-05-03', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.AM-02 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review AWS asset tracking\n2. Examine discovery scan results\n3. Verify container and VM monitoring\n4. Assess ASM vendor alignment',
    linkedArtifacts: ['Asset Inventory'],
    remediation: { ownerId: null, actionPlan: 'Complete asset inventory system procurement aligned with ASM vendor (STS4). Achieve 95% software inventory coverage. Implement continuous monitoring for container and VM inventory changes.', dueDate: '2026-10-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Software inventory 70% complete. AWS assets tracked via native tools. Asset inventory system requirements documented (STS4).', observationDate: '2025-02-08', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Inventory improving with 85% coverage. Cloud assets continuously tracked. Asset inventory system procurement aligned with ASM vendor selection.', observationDate: '2025-05-04', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.AM-07 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review data classification schema\n2. Examine tagging implementation\n3. Verify data scanning tool deployment\n4. Assess biometric data handling',
    linkedArtifacts: ['Data Classification Policy'],
    remediation: { ownerId: null, actionPlan: 'Complete data scanning tool deployment. Extend classification tagging to all production data stores. Implement automated classification for new data assets. Address biometric data inventory gaps.', dueDate: '2026-09-30' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Data classification policy approved. Biometric data classified as highest sensitivity (SG1). Tagging implementation in pilot phase.', observationDate: '2025-02-09', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Classification schema operationalized. Sensitive data types tagged in production systems. Data scanning tool selected and deployment scheduled.', observationDate: '2025-05-05', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.IM-01 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review quarterly self-assessments\n2. Examine threat-informed risk assessments\n3. Verify KPI-driven gap analysis\n4. Assess investment decision process',
    linkedArtifacts: ['Self-Assessment Reports'],
    remediation: { ownerId: null, actionPlan: 'Formalize self-assessment program with documented schedule. Expand threat-informed assessments beyond crown jewels. Implement improvement tracking dashboard linked to KPI trends.', dueDate: '2026-10-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Self-assessment program established. Risk assessment methodology documented. Threat-informed assessments conducted for crown jewel systems.', observationDate: '2025-02-10', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Structured risk assessments completed quarterly. KPI-driven improvement identification operational. TTD/TTR trends inform security investments.', observationDate: '2025-05-06', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MA-03 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review priority matrix documentation\n2. Examine sample incident tickets\n3. Verify SOC Manager validation\n4. Assess prioritization consistency',
    linkedArtifacts: ['Incident Priority Matrix'],
    remediation: { ownerId: null, actionPlan: 'Implement automated incident categorization based on detection signatures. Enhance priority matrix with additional impact criteria. Conduct SOC team training on prioritization consistency.', dueDate: '2026-08-31' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Incident priority matrix approved. Scope and impact-based prioritization implemented. Time-critical incident handling procedures documented.', observationDate: '2025-02-11', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 3, targetScore: 5, observations: 'Prioritization process consistently applied. Sample tickets demonstrate proper categorization. SOC Manager reviews validate prioritization decisions.', observationDate: '2025-05-07', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 3, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-02 Ex3': {
    auditorId: 2,
    testProcedures: '1. Review manual log review cadence\n2. Examine review documentation\n3. Verify finding templates\n4. Assess automation gap tracking',
    linkedArtifacts: ['Log Review Procedures', 'SIEM console screenshots'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Manual log review process established. Technologies requiring manual review identified. Review cadence defined based on system criticality.', observationDate: '2025-02-12', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Manual review process mature with documented findings. SIEM console monitoring enhanced. Automation gaps being addressed through tooling investments.', observationDate: '2025-05-08', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-08 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review incident declaration criteria\n2. Examine sample declarations\n3. Verify SOC Manager authority\n4. Assess lessons learned integration',
    linkedArtifacts: ['Incident Declaration Criteria', 'SOC-Ticket-1001'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 2, targetScore: 5, observations: 'Incident criteria documented and approved. Declaration thresholds defined by severity level. SOC Manager authorized to declare incidents.', observationDate: '2025-02-13', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Criteria consistently applied across all incident types. Sample tickets demonstrate proper declaration process. Continuous improvement through lessons learned.', observationDate: '2025-05-09', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-08 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review disclosure policy and SLAs\n2. Verify external intake process\n3. Examine supplier vulnerability sharing\n4. Sample disclosure handling',
    linkedArtifacts: ['Vulnerability Disclosure Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Vulnerability disclosure policy documented. External disclosure handling process established. Supplier disclosure requirements included in contracts.', observationDate: '2025-02-14', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 6, targetScore: 5, observations: 'Disclosure program mature with defined response SLAs. Supplier vulnerability sharing operational per contract terms. Sample disclosures processed within SLA.', observationDate: '2025-05-10', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 6, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.AA-02 Ex2': {
    auditorId: 2,
    testProcedures: '1. Review no shared accounts policy\n2. Verify SSO credential uniqueness\n3. Examine privileged access reviews\n4. Assess shared SSH key remediation plan',
    linkedArtifacts: ['Information Security Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Individual credentials issued to all personnel. No shared accounts policy enforced. MFA rollout project initiated ($80K) supporting G8 partnership requirements.', observationDate: '2025-02-15', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Credential uniqueness enforced enterprise-wide. Privileged access reviews completed quarterly. Shared developer SSH key identified for remediation in Q3.', observationDate: '2025-05-11', testingStatus: 'Complete', examine: false, interview: true, test: true },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.DS-10 Ex1': {
    auditorId: 2,
    testProcedures: '1. Review memory handling procedures\n2. Verify data retention limits\n3. Examine source code reviews\n4. Assess biometric data handling scrutiny',
    linkedArtifacts: ['Data Handling Procedures'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Data-in-use protection requirements documented. Memory handling procedures established. Source code review process initiated for sensitive applications.', observationDate: '2025-02-16', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 5, targetScore: 5, observations: 'Data handling procedures enforced. Sensitive data retention limits implemented. Application owner attestations collected. Source code reviews completed for crown jewels.', observationDate: '2025-05-12', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q3: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'In Progress', examine: false, interview: false, test: false },
      Q4: { actualScore: 5, targetScore: 5, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  }
};


// Alma Security Internal Audit Report - Q1 2025 Assessment
// Source: Internal Audit Report IA-2025-003, NIST CSF 2.0 Assessment
// Original scores on CMMI 0-5 scale, converted to app 1-10 scale (x2)
export const ALMA_AUDIT_OBSERVATIONS = {
  'GV.OC-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Review mission alignment documentation\n2. Interview CISO on mission-risk linkage\n3. Examine strategic planning artifacts\n4. Cross-reference with non-security leadership',
    linkedArtifacts: ['Security Governance Charter', 'Board Briefing Materials'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.OC-02 Ex1': {
    auditorId: null,
    testProcedures: '1. Review stakeholder identification documentation\n2. Validate customer-facing security expectations\n3. Interview Gerry on stakeholder engagement\n4. Review investor and Board expectations',
    linkedArtifacts: ['Security Service Catalog'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.OV-01 Ex2': {
    auditorId: null,
    testProcedures: '1. Review Board reporting on strategy outcomes\n2. Examine KPI dashboard and trend analysis\n3. Interview CISO on strategy adjustment process\n4. Validate that outcomes inform investment decisions',
    linkedArtifacts: ['KPI Dashboard', 'Board Reports'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Comprehensive KPI framework operational with Board quarterly review', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RM-01 Ex2': {
    auditorId: null,
    testProcedures: '1. Document review: Risk register\n2. Interview: CISO on risk management objectives\n3. Interview: non-security stakeholder\n4. Board/committee reporting review',
    linkedArtifacts: ['Risk Register', 'Board Approval Documentation'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Risk management objectives documented with Board approval', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RR-01 Ex4': {
    auditorId: null,
    testProcedures: '1. Review leadership accountability documentation\n2. Examine security culture initiatives\n3. Validate ethical security practices\n4. Interview CEO or Board member on cybersecurity governance',
    linkedArtifacts: ['Security Governance Charter'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.RR-02 Ex1': {
    auditorId: null,
    testProcedures: '1. Review documented roles and responsibilities\n2. Validate job descriptions include security responsibilities\n3. Examine responsibility communication\n4. Interview team leads on role clarity',
    linkedArtifacts: ['Information Security Policy', 'RACI Matrix'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-01 Ex3': {
    auditorId: null,
    testProcedures: '1. Review SCRM program documentation\n2. Validate program maturity against objectives\n3. Examine stakeholder agreement\n4. Interview Gerry on C-SCRM program execution',
    linkedArtifacts: ['Vendor Management Policy', 'SCRM Strategy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-02 Ex7': {
    auditorId: null,
    testProcedures: '1. Review C-SCRM role assignments\n2. Validate supplier and partner role communication\n3. Examine internal C-SCRM role communication\n4. Interview procurement and security personnel',
    linkedArtifacts: ['RACI Matrix', 'RFP Templates'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-04 Ex1': {
    auditorId: null,
    testProcedures: '1. Review supplier inventory in ServiceNow\n2. Verify criticality ratings against documented criteria\n3. Interview procurement team on tiering process\n4. Sample quarterly review documentation',
    linkedArtifacts: ['Third Party Risk Management Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-06 Ex3': {
    auditorId: null,
    testProcedures: '1. Review due diligence process documentation\n2. Validate supplier risk assessment execution\n3. Examine product and technology assessment\n4. Interview procurement team on due diligence practices',
    linkedArtifacts: ['Vendor Assessment Template'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-09 Ex5': {
    auditorId: null,
    testProcedures: '1. Review supply chain security integration in policies\n2. Validate provenance and integrity practices\n3. Examine risk reporting on supply chain security\n4. Interview Chris Magann on supply chain vulnerability management',
    linkedArtifacts: ['Change Management Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'GV.SC-10 Ex3': {
    auditorId: null,
    testProcedures: '1. Review supplier termination procedures\n2. Validate access deactivation practices\n3. Examine end-of-life and obsolescence planning\n4. Interview Gerry on supplier offboarding process',
    linkedArtifacts: ['Vendor Offboarding Checklist'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Policy foundations, organizational structures, and Board oversight meet or exceed targets', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.AM-02 Ex2': {
    auditorId: null,
    testProcedures: '1. Obtain software inventory records\n2. Validate inventory completeness\n3. Sample verification\n4. Assess container and cloud service coverage\n5. Review update processes',
    linkedArtifacts: ['Asset Inventory'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Software inventory only 70% complete', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.AM-07 Ex3': {
    auditorId: null,
    testProcedures: '1. Review data classification policy\n2. Validate data discovery results\n3. Assess metadata and tagging\n4. Review data inventory completeness\n5. Assess ongoing discovery process',
    linkedArtifacts: ['Data Classification Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Data classification policy approved but not applied across all data stores', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.IM-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Review self-assessment program\n2. Validate improvement identification\n3. Assess automated compliance monitoring\n4. Review third-party assessment history\n5. Evaluate assessment cadence and coverage',
    linkedArtifacts: ['Self-Assessment Reports'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Self-assessment program exists but not producing actionable improvement plans', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Review vulnerability scanning program\n2. Validate scanning coverage\n3. Assess triage and remediation process\n4. Review vulnerability recording\n5. Assess non-technical vulnerability identification',
    linkedArtifacts: ['Vulnerability Management Program'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Asset vulnerability identification partially operational', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-07 Ex1': {
    auditorId: null,
    testProcedures: '1. Review change management process\n2. Validate change risk assessment\n3. Assess change compliance\n4. Review exception management\n5. Evaluate change tracking and reporting',
    linkedArtifacts: ['Change Management Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Change management risk assessment process not enforced; 15% non-compliance', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'ID.RA-08 Ex1': {
    auditorId: null,
    testProcedures: '1. Review disclosure intake process\n2. Validate disclosure handling\n3. Assess supplier vulnerability sharing\n4. Review disclosure response\n5. Evaluate program maturity',
    linkedArtifacts: ['Vulnerability Disclosure Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Vulnerability disclosure management partially implemented', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.AA-02 Ex2': {
    auditorId: null,
    testProcedures: '1. Review identity proofing policy and standards\n2. Examine employee onboarding identity verification\n3. Assess credential uniqueness and binding controls\n4. Evaluate remote identity proofing procedures\n5. Test credential lifecycle binding integrity',
    linkedArtifacts: ['Information Security Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'MFA rollout ongoing but not yet full coverage', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.AT-01 Ex2': {
    auditorId: null,
    testProcedures: '1. Review training program documentation\n2. Verify Workday training records\n3. Examine phishing simulation results\n4. Assess new hire onboarding process',
    linkedArtifacts: ['Security Awareness Program'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Quarterly security awareness training delivered; phishing simulations conducted', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.DS-01 Ex4': {
    auditorId: null,
    testProcedures: '1. Review data-at-rest encryption policy and standards\n2. Assess encryption implementation across storage systems\n3. Evaluate data integrity controls\n4. Test access restrictions on data-at-rest\n5. Examine removable media controls\n6. Validate secure storage infrastructure',
    linkedArtifacts: ['Encryption Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Encryption upgrade project in progress', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.DS-10 Ex1': {
    auditorId: null,
    testProcedures: '1. Review data-in-use protection policies and standards\n2. Assess memory handling for sensitive data\n3. Evaluate process isolation controls\n4. Test unauthorized data-in-use access prevention',
    linkedArtifacts: ['Data Handling Procedures'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Data-in-use protections exist but have coverage gaps', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.IR-02 Ex1': {
    auditorId: null,
    testProcedures: '1. Review physical environmental protection controls at Redwood City data center\n2. Assess AWS infrastructure environmental resilience\n3. Evaluate environmental monitoring and alerting\n4. Examine environmental controls maintenance program',
    linkedArtifacts: ['Environmental Threat Assessment'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Physical environmental controls documented but not independently validated', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.IR-03 Ex3': {
    auditorId: null,
    testProcedures: '1. Review redundancy and failover architecture\n2. Assess disaster recovery planning and testing\n3. Evaluate high-availability component implementation\n4. Test failover capabilities\n5. Review resilience monitoring and incident response integration',
    linkedArtifacts: ['DR Plan'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 4, targetScore: 5, observations: 'Multi-AZ AWS deployment; DR exercises not conducted for on-premises', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.PS-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Review configuration management policy and standards\n2. Examine hardened baseline documentation and enforcement\n3. Validate automated configuration compliance monitoring\n4. Test configuration drift detection and remediation\n5. Assess lifecycle management of baseline configurations',
    linkedArtifacts: ['Hardening Standards'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'Hardening standards documented but inconsistently applied', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'PR.PS-05 Ex1': {
    auditorId: null,
    testProcedures: '1. Review application control policy and standards\n2. Examine application control deployment and coverage\n3. Validate the authorized software inventory\n4. Test application control enforcement effectiveness\n5. Assess administrative privilege restrictions for software installation',
    linkedArtifacts: ['Application Control Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 7, targetScore: 5, observations: 'SentinelOne provides endpoint application control; server-side incomplete', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-02 Ex1': {
    auditorId: null,
    testProcedures: '1. Review CloudTrail and GuardDuty configuration\n2. Examine detection rule tuning\n3. Verify TTD metrics\n4. Assess 24/7 monitoring gaps',
    linkedArtifacts: ['SIEM Configuration'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-02 Ex3': {
    auditorId: null,
    testProcedures: '1. Review CloudTrail and GuardDuty configuration\n2. Examine detection rule tuning\n3. Verify TTD metrics\n4. Assess 24/7 monitoring gaps',
    linkedArtifacts: ['Log Review Procedures', 'SIEM console screenshots'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-03 Ex2': {
    auditorId: null,
    testProcedures: '1. Assess log aggregation architecture\n2. Evaluate event correlation capabilities\n3. Test threat intelligence integration in correlation\n4. Review correlation effectiveness',
    linkedArtifacts: ['Event Correlation Architecture'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-06 Ex1': {
    auditorId: null,
    testProcedures: '1. Verify automated alert routing\n2. Assess on-demand access to security findings\n3. Review automated ticket creation workflow\n4. Evaluate manual reporting and escalation',
    linkedArtifacts: ['SOC Procedures'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.AE-08 Ex1': {
    auditorId: null,
    testProcedures: '1. Review incident declaration criteria\n2. Evaluate false positive management\n3. Test incident declaration accuracy\n4. Assess declaration timeliness',
    linkedArtifacts: ['Incident Declaration Criteria', 'SOC-Ticket-1001'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 6, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Verify network traffic monitoring coverage\n2. Evaluate network anomaly detection\n3. Test unauthorized endpoint detection\n4. Assess rogue wireless monitoring',
    linkedArtifacts: ['Network Monitoring Architecture', 'SOC-Ticket-1004'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 4, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-03 Ex2': {
    auditorId: null,
    testProcedures: '1. Assess user behavior analytics capabilities\n2. Verify logical access monitoring\n3. Evaluate technology usage monitoring\n4. Assess deception technology posture',
    linkedArtifacts: ['IAM Monitoring Configuration', 'SOC-Ticket-1005'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'DE.CM-09 Ex1': {
    auditorId: null,
    testProcedures: '1. Verify common attack vector monitoring\n2. Assess authentication attack detection\n3. Evaluate configuration drift monitoring\n4. Test endpoint health and integrity monitoring',
    linkedArtifacts: ['System Monitoring Policy'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'All DETECT controls at Initial maturity; 9-hour TTD, no 24/7 monitoring', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MA-03 Ex2': {
    auditorId: null,
    testProcedures: '1. Review categorization and prioritization framework\n2. Examine categorization and prioritization for recent incidents\n3. Validate prioritization decision-making\n4. Test categorization consistency',
    linkedArtifacts: ['Incident Priority Matrix'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Incident containment relies on automated tools; manual capability immature', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MI-01 Ex1': {
    auditorId: null,
    testProcedures: '1. Review containment procedures and capabilities\n2. Examine automated containment capabilities\n3. Validate manual containment procedures for complex scenarios\n4. Test containment effectiveness through recent incidents',
    linkedArtifacts: ['Containment Playbooks'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 4, targetScore: 5, observations: 'Incident containment relies on automated tools; manual capability immature', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.MI-02 Ex2': {
    auditorId: null,
    testProcedures: '1. Review eradication procedures and capabilities\n2. Examine automated eradication capabilities\n3. Validate manual eradication procedures for complex scenarios\n4. Test eradication effectiveness through recent incidents',
    linkedArtifacts: ['Incident Response Playbooks'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Incident containment relies on automated tools; manual capability immature', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RC.RP-03 Ex1': {
    auditorId: null,
    testProcedures: '1. Review automated backup verification procedures\n2. Evaluate backup integrity testing during quarterly restore tests\n3. Assess backup security controls\n4. Test restoration asset inventory and currency',
    linkedArtifacts: ['Backup Procedures'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 5, targetScore: 5, observations: 'Backup verification procedures documented but DR exercises not conducted', observationDate: '2025-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RS.AN-03 Ex2': {
    auditorId: null,
    testProcedures: '1. Review incident analysis methodology and procedures\n2. Examine completed incident analysis reports\n3. Validate analysis tooling and capabilities\n4. Test analyst competency and process adherence',
    linkedArtifacts: ['Incident Response Playbooks', 'SOC-Ticket-1001'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Incident analysis procedures documented but root cause analysis inconsistently performed; SOC relies on SentinelOne telemetry with limited cross-source correlation', observationDate: '2026-03-31', testingStatus: 'Complete', examine: true, interview: true, test: false },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  },
  'RC.RP-05 Ex1': {
    auditorId: null,
    testProcedures: '1. Review restored asset integrity verification procedures\n2. Evaluate restoration correctness validation\n3. Assess normal operating status confirmation\n4. Test post-restoration security validation',
    linkedArtifacts: ['Backup Procedures', 'DR Plan'],
    remediation: { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: { actualScore: 3, targetScore: 5, observations: 'Quarterly restore tests conducted but post-restoration IOC scanning not performed; functional testing limited to basic health checks without full security validation', observationDate: '2026-03-31', testingStatus: 'Complete', examine: true, interview: true, test: true },
      Q2: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q3: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false },
      Q4: { actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false }
    }
  }
};
