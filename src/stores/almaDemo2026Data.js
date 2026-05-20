// Alma Security 2026 Demo — flagship cohesive demo seed for new users.
//
// Story: mid-maturity B2B SaaS catching up. Board funded a 2-year GRC program
// in Q1 2025 after losing an enterprise deal due to no SOC2. GOVERN + IDENTIFY
// mature first; DETECT lags because the SOC is business-hours only with no
// SIEM yet. Q1 → Q4 shows clear improvement across all functions, with DETECT
// visibly behind.
//
// Report date for SLA / oldest-open math: 2026-05-19.
// 12 narrative beats anchored in observations + finding rootCause fields:
//   0  Lost enterprise deal (no SOC2)        2024-Q4
//   1  Board funded $2M GRC program          2025-02-14
//   2  CISO Gerry hire (Jan 20, contingent)  2025-Q1
//   3  Vanta deploy                          2025-Q2
//   4  SOC tooling gap                       persistent
//   5  SOC people gap                        persistent
//   6  ASM vendor selected                   2025-Q4
//   7  Tabletop exercise                     2025-Q3
//   8  DR drill                              2025-Q4
//   9  Crown jewel classification            2025-Q3
//   10 First board GRC dashboard             2025-Q2
//   11 KnowBe4 awareness rollout             2025-Q2

// ── Quarter / row helpers ──────────────────────────────────────────────────

const _q = (actual, target, status, observations = '', observationDate = '') => ({
  actualScore: actual,
  targetScore: target,
  observations,
  observationDate,
  testingStatus: status,
  examine: true,
  interview: true,
  test: actual >= 3.0,
});

const _row = (testProcedures, q1, q2, q3, q4) => ({
  testProcedures,
  quarters: { Q1: q1, Q2: q2, Q3: q3, Q4: q4 },
});

// ── Observations (40 IEs covering all 22 CSF categories) ────────────────────

const OBSERVATIONS = {
  // GOVERN — 9 IEs, Q1 avg 2.78, Q4 avg 3.61 (climbing — board funding + CISO + Vanta land here first)
  'GV.OC-01 Ex1': _row(
    'Review organizational context, mission statement, and board minutes for Q1 ratification.',
    _q(2.5, 4.5, 'Complete', 'Mission statement and risk appetite drafted late 2024 in response to lost enterprise deal (Beat 0). Awaiting Feb 14 board ratification.', '2025-03-18'),
    _q(3.0, 4.5, 'Complete', 'Board ratified mission + risk appetite Feb 14, 2025 ($2M GRC funding approved, Beat 1).', '2025-06-10'),
    _q(3.0, 4.5, 'Complete', '', '2025-09-15'),
    _q(3.5, 4.5, 'Complete', 'Risk appetite refreshed at Q4 board meeting. Tied to top-3 enterprise deals in pipeline — context-to-revenue linkage now documented.', '2025-12-08'),
  ),
  'GV.OC-02 Ex1': _row(
    'Inventory internal + external stakeholders; verify communication cadence.',
    _q(2.5, 4.5, 'Complete', 'Stakeholder list partial; missing Tier-2 vendors. Board, customers, auditors documented.', '2025-03-22'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Tier-2 vendor stakeholder map closed via Vanta supplier inventory (Beat 3).', '2025-12-10'),
  ),
  'GV.OV-01 Ex2': _row(
    'Review board-level cybersecurity performance reporting cadence and content.',
    _q(2.5, 4.5, 'Complete', 'No board-level cyber dashboard yet. CISO reports verbally each quarter.', '2025-03-19'),
    _q(3.0, 4.5, 'Complete', 'First board GRC dashboard delivered June 2025 (Beat 10) — 6 KRIs across program maturity, control health, incident velocity.', '2025-06-25'),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', 'Board GRC dashboard now monthly; KRI trend lines reviewed pre-board with CFO + GC.', '2025-12-15'),
  ),
  'GV.PO-01 Ex1': _row(
    'Verify cybersecurity policy exists, is approved, and is communicated.',
    _q(2.5, 4.5, 'Complete', 'Pre-existing policy from 2023; not refreshed since CISO hire (Beat 2).', '2025-03-12'),
    _q(3.5, 4.5, 'Complete', 'Policy refreshed and re-ratified by board; aligned to CSF 2.0. Vanta deploy (Beat 3) automating evidence collection on policy compliance.', '2025-06-20'),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', 'Policy-attestation completion rate 96%; KnowBe4 (Beat 11) reinforces.', '2025-12-05'),
  ),
  'GV.PO-02 Ex1': _row(
    'Sample 5 policy reviews; verify update cadence.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Annual review calendar operational. Owner per-policy mapped.', '2025-12-12'),
  ),
  'GV.RM-01 Ex2': _row(
    'Review risk management strategy and tolerance statements.',
    _q(3.0, 4.5, 'Complete', 'Risk register migrated from Excel to ServiceNow. Tolerance statements drafted post Beat 1 funding.', '2025-03-25'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', 'Quantitative cyber risk (Hubbard/Seiersen-style histograms) reported to board Q4 — pilot on top-5 risks.', '2025-12-18'),
  ),
  'GV.RR-01 Ex4': _row(
    'Verify CISO authority, reporting line, and budget control.',
    _q(3.0, 4.5, 'Complete', 'CISO Gerry hired 2025-01-20 contingent on Feb 14 board funding vote (Beat 2). Reporting to CEO confirmed.', '2025-03-15'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'CISO 1:1 with CEO weekly; budget control independent of Engineering. Board exec session quarterly.', '2025-12-10'),
  ),
  'GV.RR-02 Ex1': _row(
    'Review roles + responsibilities matrix; sample 5 control owners.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'RACI for cyber controls signed off by department heads. SOC Lead role (Priya.Iyer) added to org chart.', '2025-09-20'),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
  'GV.SC-04 Ex1': _row(
    'Sample 5 supplier due-diligence files for Tier 1 vendors.',
    _q(2.5, 4.5, 'Complete', 'Pre-Vanta: supplier inventory in shared spreadsheet, due diligence inconsistent.', '2025-03-28'),
    _q(3.0, 4.5, 'Complete', 'Vanta supplier inventory operational (Beat 3); Tier-1 due diligence centralized.', '2025-06-30'),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', 'Supplier criticality tiering refreshed; quarterly review cadence in flight.', '2025-12-14'),
  ),

  // IDENTIFY — 6 IEs, Q1 avg 2.83, Q4 avg 3.58 (Beat 3 Vanta + Beat 9 Crown Jewels are here)
  'ID.AM-02 Ex2': _row(
    'Review asset inventory completeness; sample crown jewel systems for tagging.',
    _q(3.0, 4.5, 'Complete', 'AWS asset inventory via Control Tower + CMDB. Tagging coverage 78% — gap on legacy EC2.', '2025-03-20'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Crown jewel classification policy operationalized 2025-09-22 (Beat 9). 12 crown jewel datasets identified + tagged with data-class metadata.', '2025-09-25'),
    _q(4.0, 4.5, 'Complete', 'Tagging coverage 94%. CMDB ↔ AWS inventory reconciliation automated.', '2025-12-16'),
  ),
  'ID.AM-07 Ex3': _row(
    'Verify hardware + software inventories tied to ownership.',
    _q(2.5, 4.5, 'Complete', 'Software BOM partial; SaaS sprawl visible across 3 procurement channels.', '2025-03-22'),
    _q(3.0, 4.5, 'Complete', 'Vanta SaaS-discovery (Beat 3) surfaced 47 previously-unmanaged SaaS apps.', '2025-06-28'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
  'ID.IM-01 Ex1': _row(
    'Review improvement tracking; sample 5 closed improvement items.',
    _q(2.5, 4.5, 'Complete', 'Improvement log in Confluence; no SLA on closure.', '2025-03-30'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Improvement items now tracked in Jira FND project; ServiceLevel applied; quarterly review with CISO.', '2025-12-11'),
  ),
  'ID.RA-01 Ex1': _row(
    'Sample 5 risk assessments for completeness and freshness.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Top-5 risks now quantified (LEC + range estimates). Annual refresh + ad-hoc on architecture changes.', '2025-12-13'),
  ),
  'ID.RA-07 Ex1': _row(
    'Review change-impact risk assessment for major changes.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', 'Change Advisory Board reviews high-risk changes weekly. Risk score gates production deploy.', '2025-12-09'),
  ),
  'ID.RA-08 Ex1': _row(
    'Verify third-party / supplier risk assessment process.',
    _q(3.0, 4.5, 'Complete', 'Vanta-pulled vendor risk scores reviewed monthly.', '2025-03-29'),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(4.0, 4.5, 'Complete', '', ''),
  ),

  // PROTECT — 8 IEs, Q1 avg 2.75, Q4 avg 3.375 (Beat 11 KnowBe4, IAM uplift)
  'PR.AA-02 Ex2': _row(
    'Sample 10 access reviews for completeness; verify privilege creep controls.',
    _q(2.5, 4.5, 'Complete', 'Quarterly access reviews in flight; privilege creep observed on legacy admin roles.', '2025-03-15'),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'In Progress', 'IAM modernization mid-flight; SSO + MFA deployed; legacy LDAP retirement targeted Q1 2026.', '2025-12-10'),
  ),
  'PR.AT-01 Ex2': _row(
    'Verify security awareness training program completion rates.',
    _q(2.5, 4.5, 'Complete', 'Annual training via legacy LMS; completion 71%.', '2025-03-25'),
    _q(3.0, 4.5, 'Complete', 'KnowBe4 rolled out April 2025 (Beat 11) replacing legacy LMS. Phishing-simulation baseline at 19% click-rate.', '2025-06-18'),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'KnowBe4 completion 94%; phish click-rate down to 7%. Eng-specific track piloting.', '2025-12-06'),
  ),
  'PR.DS-01 Ex4': _row(
    'Verify data classification, encryption at rest, and key management.',
    _q(3.0, 4.5, 'Complete', 'S3 default encryption on; KMS keys rotated annually.', '2025-03-21'),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Crown jewel datasets (Beat 9) now have customer-managed keys + access audit trail.', '2025-09-28'),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
  'PR.DS-10 Ex1': _row(
    'Review data-in-transit protections; sample 5 critical data flows.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'TLS 1.3 minimum enforced via AWS ALB policy. mTLS on service-to-service in 60% of services.', '2025-12-12'),
  ),
  'PR.IR-02 Ex1': _row(
    'Verify resilience mechanisms for crown jewel systems.',
    _q(2.5, 4.5, 'Complete', 'Auto-scaling configured; DR scenarios under-exercised.', '2025-03-19'),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'In Progress', '', ''),
    _q(3.5, 4.5, 'Complete', 'DR drill 2025-11-04 (Beat 8) validated 4-hour RTO for crown jewel systems. Findings tracked.', '2025-12-04'),
  ),
  'PR.IR-03 Ex3': _row(
    'Sample 5 production access events; verify approval + audit trail.',
    _q(2.5, 4.5, 'Complete', 'Shared developer SSH key in use on K8s nodes — violates no-shared-accounts policy.', '2025-03-26'),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'In Progress', 'Individual SSH keys issued to dev team; legacy shared key in flight to retirement Q1 2026.', '2025-12-15'),
  ),
  'PR.PS-01 Ex1': _row(
    'Verify configuration baselines; sample 5 production hosts.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'CIS-aligned baselines enforced via SSM Patch Manager; drift alerts to SOC.', '2025-12-08'),
  ),
  'PR.PS-05 Ex1': _row(
    'Review installation media + supply-chain integrity checks.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),

  // DETECT — 6 IEs, Q1 avg 2.0, Q4 avg 2.5 (THE WEAKEST — story carrier)
  'DE.AE-02 Ex1': _row(
    'Review SIEM / log analysis platform; sample 5 alerts for triage timeline.',
    _q(1.5, 4.5, 'Complete', 'No SIEM deployed. Detection relies on CloudTrail + VPC Flow Logs reviewed manually by SOC (Beat 4 — tooling gap).', '2025-03-30'),
    _q(2.0, 4.5, 'In Progress', 'SIEM RFP issued. Splunk + Sentinel under evaluation.', '2025-06-30'),
    _q(2.0, 4.5, 'In Progress', '', ''),
    _q(2.0, 4.5, 'In Progress', 'SIEM vendor selection still pending; budget approved but contract not signed. Detection coverage remains the headline weakness.', '2025-12-20'),
  ),
  'DE.AE-03 Ex2': _row(
    'Verify event correlation / aggregation across data sources.',
    _q(1.5, 4.5, 'Complete', 'Event correlation manual; relies on SOC engineer pattern-matching in 3 separate consoles (Beat 4).', '2025-03-31'),
    _q(2.0, 4.5, 'In Progress', '', ''),
    _q(2.0, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', 'Pilot SOAR runbooks reduce correlation toil for top-5 alert types. Full SIEM-driven correlation deferred to 2026.', '2025-12-18'),
  ),
  'DE.AE-06 Ex1': _row(
    'Sample 5 detected events; verify analysis quality + decision-to-respond timeline.',
    _q(2.0, 4.5, 'Complete', 'Analyst notes inconsistent; no formal runbook per alert class.', '2025-03-28'),
    _q(2.0, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', 'Tabletop 2025-08-15 (Beat 7) surfaced 8 runbook gaps; closure in flight.', '2025-09-20'),
    _q(2.5, 4.5, 'In Progress', '', ''),
  ),
  'DE.CM-01 Ex1': _row(
    'Verify network monitoring coverage and alerting cadence.',
    _q(2.0, 4.5, 'Complete', 'Network monitoring on CloudTrail + VPC Flow Logs only. No ASM coverage (Beat 4). SOC operates business-hours only (Beat 5).', '2025-03-29'),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'In Progress', 'ASM vendor selected 2025-12-08 (Beat 6); deployment phase 1 Q1 2026. SOC staffing RFP for 24/7 issued.', '2025-12-22'),
  ),
  'DE.CM-03 Ex2': _row(
    'Sample 5 endpoint detections; verify response timeline.',
    _q(2.0, 4.5, 'Complete', 'SentinelOne on workstations; gaps on server-side (Beat 4 — tooling).', '2025-03-30'),
    _q(2.0, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'In Progress', 'Server-side EDR rollout 78% complete. Crown jewel hosts (Beat 9) fully covered.', '2025-12-14'),
  ),
  'DE.CM-09 Ex1': _row(
    'Verify computing + software monitoring on critical systems.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(2.5, 4.5, 'In Progress', 'Application performance monitoring deployed on top-10 services. Security telemetry feed in flight.', '2025-12-16'),
  ),

  // RESPOND — 7 IEs, Q1 avg 2.57, Q4 avg 3.21 (Beat 7 tabletop + Beat 5 SOC people)
  'RS.AN-03 Ex2': _row(
    'Review incident analysis quality; sample 3 declared incidents.',
    _q(2.0, 4.5, 'Complete', 'Manual incident analysis; no formal taxonomy (Beat 5 — SOC people).', '2025-03-27'),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'Complete', 'Tabletop 2025-08-15 (Beat 7) validated incident analysis playbook; 8 gaps surfaced and closed.', '2025-08-20'),
    _q(3.0, 4.5, 'Complete', 'Post-tabletop analysis taxonomy operational. SOAR pilot reducing analyst toil.', '2025-12-19'),
  ),
  'RS.AN-06 Ex1': _row(
    'Verify root-cause analysis is performed and documented per incident.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
  ),
  'RS.CO-02 Ex1': _row(
    'Review incident communications + stakeholder notifications.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Tabletop (Beat 7) included GC + Comms; notification timeline rehearsed for breach scenario.', '2025-08-22'),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
  'RS.CO-03 Ex1': _row(
    'Verify regulatory + customer notification process.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Breach-notification SOP signed by GC; customer-notification template approved.', '2025-12-11'),
  ),
  'RS.MA-03 Ex2': _row(
    'Review mitigation tracking; sample 5 mitigations to closure.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
  'RS.MI-01 Ex1': _row(
    'Verify containment procedures; sample 3 contained incidents.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Containment automation: SentinelOne isolate + AWS SG quarantine playbook validated.', '2025-12-13'),
  ),
  'RS.MI-02 Ex2': _row(
    'Sample 3 incidents; verify eradication thoroughness.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
  ),

  // RECOVER — 4 IEs, Q1 avg 2.625, Q4 avg 3.25 (Beat 8 DR drill anchors)
  'RC.CO-03 Ex1': _row(
    'Verify recovery communications cadence + stakeholder mapping.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(2.5, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'Complete', 'Tabletop (Beat 7) + DR drill (Beat 8) rehearsed recovery comms.', '2025-11-12'),
    _q(3.0, 4.5, 'Complete', '', ''),
  ),
  'RC.CO-04 Ex1': _row(
    'Verify public communications process for major outages.',
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(2.5, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Status page (StatusGator) + customer-comms SOP. PR firm on retainer for severity-1 events.', '2025-12-10'),
  ),
  'RC.RP-03 Ex1': _row(
    'Verify backup integrity + recovery time objective.',
    _q(2.5, 4.5, 'Complete', 'Backups documented; DR exercises not yet conducted.', '2025-03-30'),
    _q(3.0, 4.5, 'In Progress', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'Full DR drill executed 2025-11-04 (Beat 8); 4-hour RTO validated for crown jewel systems (Beat 9 datasets).', '2025-12-05'),
  ),
  'RC.RP-05 Ex1': _row(
    'Verify recovery validation + return-to-service criteria.',
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.0, 4.5, 'Complete', '', ''),
    _q(3.5, 4.5, 'Complete', 'DR drill (Beat 8) validated return-to-service criteria for crown jewel apps.', '2025-11-08'),
    _q(3.5, 4.5, 'Complete', '', ''),
  ),
};

const SCOPE_IDS = Object.keys(OBSERVATIONS);

// ── Assessment ──────────────────────────────────────────────────────────────

export const ALMA_DEMO_2026_ASSESSMENT = {
  id: 'ASM-2026-demo-alma',
  name: 'Alma Security 2026 Demo',
  description: 'Flagship demo — mid-maturity B2B SaaS catching up. Board-funded 2-year GRC program in 2025 after losing an enterprise deal; GOVERN + IDENTIFY mature first, DETECT lags (SOC business-hours only, no SIEM yet).',
  scopeType: 'requirements',
  frameworkFilter: null,
  createdDate: '2025-01-15T00:00:00.000Z',
  scopeIds: SCOPE_IDS,
  observations: OBSERVATIONS,
};

// ── Findings (30) ───────────────────────────────────────────────────────────
// Distribution:
//   Priority: 3 Critical (2 DE + 1 ID Resolved), 11 High, 12 Medium, 4 Low
//   Status:   7 Resolved, 14 In Progress (1 stalled), 9 Not Started
//   Owners:   spread across all 8 users; Priya.Iyer (8) owns most DE
//   Anchored: every Critical + High references a beat in rootCause

const _f = (n, opts) => ({
  id: `FND-DEMO-${n}`,
  summary: opts.summary,
  description: opts.description,
  complianceRequirement: opts.controlId,
  controlId: opts.controlId,
  assessmentId: 'ASM-2026-demo-alma',
  rootCause: opts.rootCause,
  remediationActionPlan: opts.plan,
  remediationOwner: opts.owner,
  dueDate: opts.dueDate,
  status: opts.status,
  priority: opts.priority,
  createdDate: opts.created,
  lastModified: opts.modified || opts.created,
  jiraKey: `FND-DEMO-${n}`,
  linkedArtifacts: opts.artifacts || [],
});

export const ALMA_DEMO_2026_FINDINGS = [
  // ── DETECT findings (concentrated — the story headline) ──────────────────
  _f(1, {
    summary: 'No SIEM deployed; detection limited to manual log review',
    description: 'Security event aggregation depends on three separate consoles (CloudTrail, VPC Flow Logs, SentinelOne). No unified correlation; analyst toil high; mean time to detect averaging 38 hours on the 4 declared incidents this year. Awaiting SIEM contract execution; budget approved Q3 but vendor selection slipped twice. Note from analyst: "SOAR pilot helps but cannot substitute for the SIEM platform itself — PIyer 2026-04-08."',
    controlId: 'DE.AE-02 Ex1',
    rootCause: 'SOC tooling gap (Beat 4) — pre-funding posture was CloudTrail + manual review. SIEM RFP issued late and contract negotiations dragged through Q4 2025.',
    plan: 'Execute SIEM contract Q1 2026; phase 1 cloud-log ingestion; phase 2 endpoint + SaaS correlation; phase 3 SOAR full-runbook coverage.',
    owner: 8, dueDate: '2026-09-30', status: 'In Progress', priority: 'Critical',
    created: '2025-11-13T00:00:00.000Z', modified: '2026-04-08T00:00:00.000Z',
    artifacts: ['SIEM RFP', 'SOC Tooling Roadmap'],
  }),
  _f(2, {
    summary: 'SOC operates business-hours only; no 24/7 coverage',
    description: 'Three SOC engineers cover Monday–Friday 8am-6pm Eastern. After-hours coverage via PagerDuty rotation but no active triage. Tabletop (Beat 7) confirmed median after-hours detection delay of 11 hours. Hire plan for two additional SOC analysts approved with the SIEM contract — onboarding Q2 2026.',
    controlId: 'DE.CM-01 Ex1',
    rootCause: 'SOC people gap (Beat 5) — staffing constraints limit coverage. Pre-Beat-1 funding did not support 24/7 model.',
    plan: 'Hire SOC analyst II + SOC analyst III Q2 2026; introduce follow-the-sun model with third-party MSSP for overnight coverage during ramp.',
    owner: 8, dueDate: '2026-08-31', status: 'In Progress', priority: 'Critical',
    created: '2025-11-13T00:00:00.000Z',
    artifacts: ['SOC Coverage RFP', 'PagerDuty Rotation'],
  }),
  _f(3, {
    summary: 'External attack surface monitoring not deployed (ASM gap)',
    description: 'No attack-surface-management tooling in production. DNS + BGP monitoring operational but external asset discovery limited. Risk register item R2 identifies this as a known gap. ASM vendor (Censys) selected 2025-12-08 (Beat 6); contract executed; deployment phase 1 in flight Q1 2026.',
    controlId: 'DE.CM-01 Ex1',
    rootCause: 'SOC tooling gap (Beat 4) — ASM was deprioritized during early growth. R2 has been a known risk since pre-Beat-1.',
    plan: 'Deploy Censys ASM platform; integrate findings into SOC ticketing; SLA on net-new external asset triage = 24h.',
    owner: 7, dueDate: '2026-06-30', status: 'In Progress', priority: 'High',
    created: '2026-04-10T00:00:00.000Z',
    artifacts: ['ASM Vendor Contract', 'Risk Register R2'],
  }),
  _f(4, {
    summary: 'Event correlation manual across 3 consoles',
    description: 'Analyst pattern-matching across CloudTrail, VPC Flow Logs, and SentinelOne consoles is the only correlation path today. Tabletop (Beat 7) showed a 6-hour delay on a simulated lateral-movement scenario because the correlation was not visible from any single pane.',
    controlId: 'DE.AE-03 Ex2',
    rootCause: 'SOC tooling gap (Beat 4) — correlation is a SIEM responsibility; SIEM not yet deployed.',
    plan: 'Deferred to SIEM rollout (FND-DEMO-1). Interim: SOAR runbooks cover top-5 alert correlations.',
    owner: 8, dueDate: '2026-09-30', status: 'In Progress', priority: 'High',
    created: '2026-03-25T00:00:00.000Z',
    artifacts: ['Tabletop 2025-08-15 Report'],
  }),
  _f(5, {
    summary: 'Server-side EDR rollout incomplete',
    description: 'SentinelOne deployed across all workstations but server coverage at 78%. Legacy EC2 instances on Amazon Linux 1 cannot run the current agent; migration to AL2023 in flight.',
    controlId: 'DE.CM-03 Ex2',
    rootCause: 'SOC tooling gap (Beat 4) — server-side deployment was deprioritized during workstation push.',
    plan: 'Complete server-side EDR by Q3 2026. Legacy AL1 hosts retired or quarantined.',
    owner: 7, dueDate: '2026-09-30', status: 'In Progress', priority: 'High',
    created: '2026-04-01T00:00:00.000Z',
    artifacts: ['EDR Rollout Plan'],
  }),
  _f(6, {
    summary: 'Alert triage runbooks inconsistent',
    description: 'Analyst notes vary in quality and structure. Tabletop (Beat 7) surfaced 8 runbook gaps; 5 closed, 3 still open. Free-text analyst-comment "Closed 5/8 — remaining 3 need SIEM-side context that we do not have today. PIyer 2026-03-22."',
    controlId: 'DE.AE-06 Ex1',
    rootCause: 'SOC people gap (Beat 5) — small team, varying tenure, no formalized runbook program until 2025 mid-year.',
    plan: 'Close remaining 3 runbook gaps as SIEM data lands; runbook-as-code in GitHub.',
    owner: 8, dueDate: '2026-07-15', status: 'In Progress', priority: 'Medium',
    created: '2026-03-22T00:00:00.000Z', modified: '2026-04-08T00:00:00.000Z',
    artifacts: ['Tabletop 2025-08-15 Report', 'SOC Runbook Repo'],
  }),
  _f(7, {
    summary: 'Critical asset telemetry coverage gap (security feed)',
    description: 'APM deployed on top-10 services but security telemetry feed (process trees, syscall events) not yet wired to SOC.',
    controlId: 'DE.CM-09 Ex1',
    rootCause: 'SOC tooling gap (Beat 4) — APM and security telemetry treated as separate workstreams; not converged.',
    plan: 'Pilot Falco on crown-jewel services; converge with SIEM ingestion.',
    owner: 8, dueDate: '2026-10-30', status: 'Not Started', priority: 'Medium',
    created: '2026-04-22T00:00:00.000Z',
    artifacts: [],
  }),

  // ── IDENTIFY findings ────────────────────────────────────────────────────
  _f(8, {
    summary: 'Crown jewel data classification complete and tagged',
    description: 'Full inventory of customer-PII, financial, and IP datasets completed Q3 2025; 12 crown jewel datasets identified and tagged with data-class metadata in CMDB. Customer-managed keys (CMK) provisioned in KMS. RESOLVED.',
    controlId: 'ID.AM-02 Ex2',
    rootCause: 'Crown jewel classification (Beat 9) — historically gap until policy operationalized 2025-09-22. Resolved as a Critical because the absence created unbounded blast-radius across all customer data.',
    plan: 'Closed: policy operational; classification reviewed quarterly; CMK rotation annual.',
    owner: 3, dueDate: '2025-10-31', status: 'Resolved', priority: 'Critical',
    created: '2025-04-12T00:00:00.000Z', modified: '2025-10-22T00:00:00.000Z',
    artifacts: ['Data Classification Policy', 'CMDB Tagging Export', 'KMS CMK Inventory'],
  }),
  _f(9, {
    summary: 'SaaS sprawl: 47 previously-unmanaged SaaS apps discovered',
    description: 'Vanta SaaS-discovery (Beat 3) surfaced 47 SaaS apps not in approved-vendor list. 31 since brought under SSO; 12 sunsetted; 4 remain in legal review.',
    controlId: 'ID.AM-07 Ex3',
    rootCause: 'Vanta deploy (Beat 3) made visible what was always there — pre-Beat-3 there was no central SaaS discovery.',
    plan: 'Close remaining 4 in legal review by Q2 2026; SaaS-approval gate in procurement effective Q3 2025.',
    owner: 2, dueDate: '2026-06-15', status: 'In Progress', priority: 'High',
    created: '2026-04-05T00:00:00.000Z',
    artifacts: ['Vanta SaaS Discovery Report', 'Approved Vendor List'],
  }),
  _f(10, {
    summary: 'Top-5 risks quantified using LEC + range estimates',
    description: 'Quantitative cyber risk (Hubbard/Seiersen-style) operationalized for top-5 risks; histograms reported to board Q4 2025 (Beat 10 dashboard).',
    controlId: 'ID.RA-01 Ex1',
    rootCause: 'Pre-Beat-10 board reporting was qualitative; CFO required quantitative articulation to defend cyber budget.',
    plan: 'Closed: methodology documented; quarterly refresh; expand to top-10 in 2026.',
    owner: 2, dueDate: '2025-12-15', status: 'Resolved', priority: 'Medium',
    created: '2025-07-08T00:00:00.000Z', modified: '2025-12-18T00:00:00.000Z',
    artifacts: ['Quantitative Risk Methodology', 'Board GRC Dashboard Q4'],
  }),
  _f(11, {
    summary: 'Software BOM coverage incomplete for in-house services',
    description: 'SBOM generation operational for top-15 services; remaining 22 services pending. CI/CD integration partially complete (Buildkite + Syft).',
    controlId: 'ID.AM-07 Ex3',
    rootCause: 'Vanta deploy (Beat 3) prioritized SaaS first; in-house SBOM scoped for Q1 2026.',
    plan: 'Complete SBOM coverage across all services by Q2 2026; vulnerability correlation via Dependency-Track.',
    owner: 3, dueDate: '2026-06-30', status: 'Not Started', priority: 'Medium',
    created: '2026-03-30T00:00:00.000Z',
    artifacts: ['SBOM Pipeline Spec'],
  }),

  // ── GOVERN findings ──────────────────────────────────────────────────────
  _f(12, {
    summary: 'Cybersecurity policy refreshed and re-ratified',
    description: 'Legacy 2023 policy refreshed in Q2 2025; re-ratified by board; aligned to CSF 2.0. Attestation completion 96%. RESOLVED.',
    controlId: 'GV.PO-01 Ex1',
    rootCause: 'CISO hire (Beat 2) prioritized policy refresh as first 90-day deliverable.',
    plan: 'Closed: annual review calendar operational; owner per-policy mapped.',
    owner: 1, dueDate: '2025-06-30', status: 'Resolved', priority: 'High',
    created: '2025-02-10T00:00:00.000Z', modified: '2025-06-25T00:00:00.000Z',
    artifacts: ['Cybersecurity Policy v2.0', 'Board Ratification Minutes 2025-06-12'],
  }),
  _f(13, {
    summary: 'Risk register migrated from Excel to ServiceNow',
    description: 'Risk register operational in ServiceNow; tolerance statements drafted post Beat 1 funding. Quantitative LEC methodology (FND-DEMO-10) folded in for top-5 risks.',
    controlId: 'GV.RM-01 Ex2',
    rootCause: 'Board funding (Beat 1) enabled ServiceNow GRC module; pre-funding the register lived in a shared Excel file.',
    plan: 'Closed: ServiceNow operational; risk owner assignments mapped.',
    owner: 2, dueDate: '2025-09-30', status: 'Resolved', priority: 'High',
    created: '2025-03-15T00:00:00.000Z', modified: '2025-09-25T00:00:00.000Z',
    artifacts: ['ServiceNow GRC Configuration', 'Top-5 Risk LEC Report'],
  }),
  _f(14, {
    summary: 'Board GRC dashboard delivered monthly',
    description: 'First board GRC dashboard delivered June 2025 (Beat 10); now monthly. 6 KRIs across program maturity, control health, incident velocity, vendor risk, training, audit findings. RESOLVED.',
    controlId: 'GV.OV-01 Ex2',
    rootCause: 'Pre-Beat-10 board reporting was verbal-only; CFO + board chair requested visualized KRIs.',
    plan: 'Closed: dashboard automated via Vanta + ServiceNow exports.',
    owner: 1, dueDate: '2025-09-30', status: 'Resolved', priority: 'Medium',
    created: '2025-04-20T00:00:00.000Z', modified: '2025-06-25T00:00:00.000Z',
    artifacts: ['Board GRC Dashboard Template'],
  }),
  _f(15, {
    summary: 'Tier-2 supplier inventory completion',
    description: 'Vanta supplier-inventory operational for Tier-1; Tier-2 coverage 64%. Smaller vendors with limited cyber attestations harder to capture.',
    controlId: 'GV.SC-04 Ex1',
    rootCause: 'Vanta deploy (Beat 3) prioritized Tier-1; Tier-2 in flight.',
    plan: 'Close Tier-2 coverage by Q2 2026; procurement gate enforces inventory on new vendor onboarding.',
    owner: 2, dueDate: '2026-06-30', status: 'In Progress', priority: 'Medium',
    created: '2026-04-12T00:00:00.000Z',
    artifacts: ['Vanta Supplier Inventory Export'],
  }),
  _f(16, {
    summary: 'Financial-systems risk owner mapping pending',
    description: 'SOX-adjacent financial systems (NetSuite + Salesforce-CPQ) need cyber risk-owner assignment distinct from business-owner. CFO + CISO alignment in flight.',
    controlId: 'GV.OC-02 Ex1',
    rootCause: 'Pre-CISO (Beat 2) risk ownership was bundled with business ownership; segregation requires CISO + CFO joint sign-off.',
    plan: 'Finalize risk-owner-vs-business-owner matrix by Q2 2026.',
    owner: 4, dueDate: '2026-05-31', status: 'Not Started', priority: 'Low',
    created: '2026-04-08T00:00:00.000Z',
    artifacts: [],
  }),

  // ── PROTECT findings ─────────────────────────────────────────────────────
  _f(17, {
    summary: 'Shared developer SSH key on Kubernetes nodes',
    description: 'Single shared SSH key used by developers to access K8s nodes — violates no-shared-accounts policy and creates accountability gap for privileged access. Individual keys issued Q3 2025; legacy shared key still active for 8 nodes pending CI rollout.',
    controlId: 'PR.IR-03 Ex3',
    rootCause: 'Legacy infra configuration; pre-CISO (Beat 2) the no-shared-accounts policy was unenforced for K8s admin paths.',
    plan: 'Cut over to per-developer keys via Teleport SSH proxy; retire shared key Q1 2026.',
    owner: 5, dueDate: '2026-03-31', status: 'In Progress', priority: 'High',
    created: '2026-04-15T00:00:00.000Z',
    artifacts: ['App Control Policy', 'K8s Admin Key Inventory'],
  }),
  _f(18, {
    summary: 'KnowBe4 rollout complete; phishing simulation operational',
    description: 'KnowBe4 deployed Q2 2025 (Beat 11); completion rate 94%; phish-simulation click-rate down from 19% baseline to 7%. RESOLVED.',
    controlId: 'PR.AT-01 Ex2',
    rootCause: 'Legacy LMS had poor engagement; CISO (Beat 2) prioritized replacement as first-90-day deliverable.',
    plan: 'Closed: KnowBe4 operational; engineering-specific track piloting Q1 2026.',
    owner: 3, dueDate: '2025-08-31', status: 'Resolved', priority: 'High',
    created: '2025-04-04T00:00:00.000Z', modified: '2025-08-28T00:00:00.000Z',
    artifacts: ['KnowBe4 Configuration', 'Phish Simulation Q2-Q4 Results'],
  }),
  _f(19, {
    summary: 'Legacy LDAP retirement pending',
    description: 'SSO + MFA deployed on Okta; 14 legacy services still authenticating via LDAP. Migration tracked weekly.',
    controlId: 'PR.AA-02 Ex2',
    rootCause: 'IAM modernization mid-flight; pre-Beat-2 the LDAP was the only directory.',
    plan: 'Complete LDAP retirement by Q1 2026; legacy-only services either migrated or sunsetted.',
    owner: 5, dueDate: '2026-03-31', status: 'In Progress', priority: 'High',
    created: '2026-04-02T00:00:00.000Z',
    artifacts: ['IAM Modernization Plan', 'LDAP Service Inventory'],
  }),
  _f(20, {
    summary: 'mTLS coverage 60% on service-to-service',
    description: 'TLS 1.3 enforced at ALB; service-to-service mTLS at 60% (Istio service-mesh rollout). Remaining 40% on critical-path services targeted Q2 2026.',
    controlId: 'PR.DS-10 Ex1',
    rootCause: 'Istio rollout phased to avoid prod incidents during the SOC-staffing-constrained period (Beat 5).',
    plan: 'Complete mTLS rollout by Q2 2026; deprecate non-mTLS service-to-service paths.',
    owner: 6, dueDate: '2026-06-30', status: 'Not Started', priority: 'Medium',
    created: '2026-03-28T00:00:00.000Z',
    artifacts: ['Istio Rollout Plan'],
  }),
  _f(21, {
    summary: 'Quarterly access review automation incomplete',
    description: 'Access reviews are manual via Okta exports; reviewer fatigue evident on the 800-row spreadsheets. Vanta access-review module piloting Q1 2026.',
    controlId: 'PR.AA-02 Ex2',
    rootCause: 'Pre-Vanta (Beat 3) tooling did not support workflow; CISO (Beat 2) prioritized identity hygiene as 2026 H1 goal.',
    plan: 'Vanta access-review module to production Q2 2026; reviewer SLA 5 business days.',
    owner: 5, dueDate: '2026-06-30', status: 'In Progress', priority: 'Medium',
    created: '2026-04-15T00:00:00.000Z',
    artifacts: ['Access Review Q3 2025 Export'],
  }),
  _f(22, {
    summary: 'Engineering-specific security training track pending',
    description: 'KnowBe4 generic track is operational (FND-DEMO-18); engineering-specific track (secure code review, threat modeling) scoped but not yet delivered.',
    controlId: 'PR.AT-01 Ex2',
    rootCause: 'KnowBe4 rollout (Beat 11) prioritized broad coverage first; deep-dive track scoped for 2026.',
    plan: 'Author + roll out engineering-track in 4 modules through Q2 2026.',
    owner: 3, dueDate: '2026-06-30', status: 'Not Started', priority: 'Low',
    created: '2026-01-08T00:00:00.000Z',
    artifacts: [],
  }),
  _f(23, {
    summary: 'Configuration drift alerting noisy',
    description: 'SSM Patch Manager + drift detection operational but false-positive rate high; SOC tuning rules. Crown jewel hosts cleanly monitored.',
    controlId: 'PR.PS-01 Ex1',
    rootCause: 'Tooling new; baseline tuning incomplete.',
    plan: 'Tune detection rules; reduce false-positive rate from 41% to <10% by Q2 2026.',
    owner: 7, dueDate: '2026-05-31', status: 'Not Started', priority: 'Low',
    created: '2026-03-02T00:00:00.000Z',
    artifacts: [],
  }),

  // ── RESPOND findings ─────────────────────────────────────────────────────
  _f(24, {
    summary: 'Tabletop exercise — 8 playbook gaps surfaced',
    description: 'Ransomware tabletop conducted 2025-08-15 (Beat 7). 8 playbook gaps identified across analysis, comms, and mitigation. 5 closed; 3 deferred to SIEM-data dependent (FND-DEMO-6).',
    controlId: 'RS.AN-03 Ex2',
    rootCause: 'Tabletop (Beat 7) was first formal IR exercise post-CISO hire; pre-Beat-2 the IR plan was untested.',
    plan: 'Closed: 5 gaps remediated; 3 tracked under FND-DEMO-6 (SIEM dependent).',
    owner: 6, dueDate: '2025-10-15', status: 'Resolved', priority: 'High',
    created: '2025-08-18T00:00:00.000Z', modified: '2025-10-12T00:00:00.000Z',
    artifacts: ['Tabletop 2025-08-15 After-Action Report'],
  }),
  _f(25, {
    summary: 'Breach-notification SOP signed and rehearsed',
    description: 'Breach-notification SOP signed by GC; customer-notification template approved; tabletop (Beat 7) rehearsed regulator + customer notification timeline. RESOLVED.',
    controlId: 'RS.CO-03 Ex1',
    rootCause: 'Pre-CISO (Beat 2) no formal SOP existed; GC + CISO co-authored Q3 2025.',
    plan: 'Closed: SOP operational; annual review.',
    owner: 1, dueDate: '2025-11-30', status: 'Resolved', priority: 'Medium',
    created: '2026-03-28T00:00:00.000Z', modified: '2025-11-15T00:00:00.000Z',
    artifacts: ['Breach Notification SOP v1.0', 'Customer Comms Template'],
  }),
  _f(26, {
    summary: 'Customer-facing incident comms automation pending',
    description: 'StatusGator manual; customer-comms still authored ad-hoc. Templating in flight to reduce time-to-first-update.',
    controlId: 'RS.CO-02 Ex1',
    rootCause: 'Post-tabletop (Beat 7) improvement; identified as gap but tooling effort underway.',
    plan: 'Template library + auto-fill from incident-ticket metadata by Q2 2026.',
    owner: 6, dueDate: '2026-06-30', status: 'Not Started', priority: 'Medium',
    created: '2026-03-08T00:00:00.000Z',
    artifacts: [],
  }),
  _f(27, {
    summary: 'Containment automation playbook coverage 60%',
    description: 'SentinelOne isolate + AWS SG quarantine validated for endpoint + cloud scenarios. SaaS containment (revoke OAuth, suspend IdP) not yet automated.',
    controlId: 'RS.MI-01 Ex1',
    rootCause: 'SOC people gap (Beat 5) — automation work parallelized; SaaS-revoke runbooks scoped for 2026.',
    plan: 'Build SaaS-revoke runbooks via Okta API + Vanta integrations by Q3 2026.',
    owner: 6, dueDate: '2026-09-30', status: 'Not Started', priority: 'Medium',
    created: '2026-03-30T00:00:00.000Z',
    artifacts: ['Containment Playbook v1.0'],
  }),
  _f(28, {
    summary: 'Root-cause-analysis quality variance',
    description: 'Post-incident RCA quality varies by analyst tenure. Senior-led RCAs include systemic findings; junior-led RCAs sometimes stop at proximate cause. STALLED: queued behind SIEM rollout for the structured-data path.',
    controlId: 'RS.AN-06 Ex1',
    rootCause: 'SOC people gap (Beat 5) — tenure spread + no formal RCA template until Q4 2025.',
    plan: 'RCA template + peer-review process; junior analysts pair with senior on first 3 RCAs. Stalled awaiting SIEM data to anchor evidence chains.',
    owner: 8, dueDate: '2026-08-15', status: 'In Progress', priority: 'Medium',
    created: '2025-11-13T00:00:00.000Z',
    artifacts: ['RCA Template Draft'],
  }),

  // ── RECOVER findings ─────────────────────────────────────────────────────
  _f(29, {
    summary: 'DR drill validated 4-hour RTO for crown jewels',
    description: 'Full DR drill executed 2025-11-04 (Beat 8); RTO of 4 hours validated for crown jewel datasets (Beat 9). Backup integrity + return-to-service criteria exercised end-to-end. RESOLVED.',
    controlId: 'RC.RP-03 Ex1',
    rootCause: 'Pre-Beat-8 backups were documented but DR exercises had not been conducted; first drill since CISO hire (Beat 2).',
    plan: 'Closed: drill cadence semi-annual; full-failover annual.',
    owner: 6, dueDate: '2025-12-15', status: 'Resolved', priority: 'High',
    created: '2025-07-20T00:00:00.000Z', modified: '2025-11-15T00:00:00.000Z',
    artifacts: ['DR Drill After-Action Report 2025-11-04', 'RTO Validation Spreadsheet'],
  }),
  _f(30, {
    summary: 'Public status communications PR firm on retainer',
    description: 'Status page (StatusGator) + customer-comms SOP operational; PR firm retained for severity-1 events. Tabletop (Beat 7) + DR drill (Beat 8) rehearsed end-to-end.',
    controlId: 'RC.CO-04 Ex1',
    rootCause: 'Pre-Beat-1 funding no PR retainer; CFO approved post-board-funding.',
    plan: 'Quarterly retainer review; annual PR-firm exercise.',
    owner: 1, dueDate: '2026-03-31', status: 'Not Started', priority: 'Low',
    created: '2026-02-10T00:00:00.000Z',
    artifacts: ['PR Retainer Agreement'],
  }),
];
