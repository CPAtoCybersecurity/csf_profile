# DE.AE-04: The Estimated Impact and Scope of Adverse Events Are Understood

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** PM-09, PM-11, PM-18, PM-28, PM-30
**Implementation Examples:** 2 (Ex1–Ex2)

## Scope & Applicability

This test procedure covers Alma Security's capability to estimate the business impact and technical scope of adverse events through:

- **Automated impact estimation:** GuardDuty severity ratings (Low/Medium/High) with affected resource identifiers; SentinelOne threat assessments with scope indicators (affected endpoints, process trees, lateral movement signals)
- **Manual impact estimation:** SOC Manager assessment factoring asset criticality, customer tenant exposure, service availability impact, regulatory notification thresholds, and reputational risk
- **Asset context sources:** AWS resource tags (environment, criticality tier), ServiceNow CMDB (asset owners, business impact ratings), SentinelOne endpoint inventory (device role, department)
- **Personnel:** Gerry (SOC Manager — impact validation authority), Nadia Khan (D&R Lead), SOC analysts (Jane, John), auditor (Steve)

Scope includes all systems in Alma's detection coverage: AWS infrastructure (production account 123456789012), SentinelOne-enrolled endpoints, and O365-protected email. Impact estimation for physical security events at the Redwood City office is out of scope for this procedure.

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Impact estimate accuracy | Post-incident review | Per incident | Initial estimate within 1 severity level of final assessment for ≥80% of incidents |
| Time from alert to impact estimate | Incident tickets | Per incident | Initial estimate documented within 15 min (automated) or 2 hours (manual) of triage start |
| Scope revision frequency | Incident tickets | Per incident | Track how often initial scope expands; increasing trend may indicate estimation methodology gaps |
| Asset criticality coverage | CMDB | Quarterly | ≥90% of production assets have criticality ratings assigned |
| Executive impact notification timeliness | Escalation records | Per SEV-1/SEV-2 | CISO notified within 1 hour per incident response playbook |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Review incident response playbook for impact estimation guidance | Playbook section defining impact categories (Negligible through Critical) with specific criteria for each level including customer data exposure, service availability, and regulatory thresholds |
| E2 | Verify GuardDuty findings include severity ratings and affected resource identification | Sample GuardDuty findings showing severity classification, affected resource ARN, and contextual enrichment data |
| E3 | Confirm SentinelOne threat assessments include scope indicators | SentinelOne console showing threat assessment with affected endpoint count, process tree visualization, and lateral movement indicators |
| E4 | Review ServiceNow CMDB for asset criticality ratings coverage | CMDB report showing percentage of production assets with assigned criticality ratings; identify assets with no criticality classification |
| E5 | Examine 3-5 recent incident tickets for impact estimation documentation | Tickets showing initial impact estimate, any revisions, final impact assessment, and rationale at each stage |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Gerry (SOC Manager) | "Walk me through how you refine an automated GuardDuty severity rating during triage. What additional factors do you consider that the automated rating doesn't capture?" — Expected: References customer tenant exposure, crown jewel system status, and business context that automated tools miss |
| I2 | Nadia Khan (D&R Lead) | "How do you estimate blast radius for an incident that spans multiple systems? What tools and data sources do you use to determine scope?" — Expected: Describes CMDB lookup, asset dependency mapping, and a systematic approach rather than ad-hoc estimation |
| I3 | SOC Analyst (Jane or John) | "Describe a recent incident where the initial scope estimate changed significantly during investigation. What caused the revision?" — Expected: Can describe a specific incident with the trigger for scope change and how the team communicated the revised estimate |
| I4 | Gerry (SOC Manager) | "At what point in an investigation do you notify executive leadership about impact? How do you quantify business impact for non-technical stakeholders?" — Expected: References specific severity thresholds from the playbook and describes translating technical scope into business terms (customers affected, revenue exposure, regulatory implications) |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Review 5 recent incident tickets; compare initial impact estimates against final post-incident assessments | ≥4 of 5 initial estimates are within 1 severity level of the final assessment; all tickets document the impact estimation rationale |
| T2 | For 3 incidents, verify scope was assessed by cross-referencing affected assets against the CMDB | All 3 tickets reference CMDB lookups or asset interdependency checks during scope assessment; affected assets are identified by name/ID, not just "multiple systems" |
| T3 | Verify that at least one recent SEV-1 or SEV-2 incident included executive notification with business impact summary within the playbook SLA | Notification occurred within 1 hour of severity assignment; notification included non-technical impact summary (customers, services, data types affected) |
| T4 | Present a hypothetical scenario (e.g., compromised service account with access to customer biometric data) and ask the on-duty SOC analyst to walk through impact estimation | Analyst applies playbook criteria correctly, references asset criticality, identifies regulatory notification thresholds (GDPR 72h), and escalates per severity definitions |

## Evidence Requirements

- [ ] Incident response playbook impact classification section
- [ ] 5 recent incident tickets showing impact estimation progression (initial → revised → final)
- [ ] GuardDuty finding examples with severity and affected resource details
- [ ] SentinelOne threat assessment examples with scope indicators and process trees
- [ ] ServiceNow CMDB asset criticality coverage report
- [ ] Escalation records for most recent SEV-1/SEV-2 showing executive notification timeline
- [ ] Post-incident review documents comparing initial vs. final impact estimates

## Pass/Fail Criteria

**Pass:** Both implementation examples are demonstrably operational:
- Automated estimation (Ex1) provides initial severity and scope via GuardDuty and SentinelOne with SOC Manager review and refinement documented in tickets
- Manual estimation (Ex2) supplements automated ratings with business context (customer exposure, service availability, regulatory thresholds) with documented rationale

**Partial Pass:** Automated severity ratings are operational but manual estimation lacks consistent methodology — impact rationale is documented in some tickets but not all, or business impact quantification is absent.

**Fail:** No documented impact estimation process exists, OR automated severity ratings are accepted without review or refinement, OR incident tickets contain no impact or scope documentation.

## Alma Security Context

As a SaaS company handling continuous authentication with biometric data, Alma's impact estimation must account for customer data sensitivity beyond typical infrastructure incidents. A compromised service with access to biometric data triggers regulatory notification obligations (GDPR 72-hour requirement) and existential reputational risk for a company whose product *is* security.

The current approach combining GuardDuty automated severity with SOC Manager manual refinement is appropriate for Alma's scale. The primary gap is the absence of a quantitative scope scoring rubric — scope estimation relies heavily on individual analyst judgment, which creates inconsistency. The ServiceNow CMDB provides asset context but lacks automated interdependency mapping that would help analysts estimate blast radius for cascading failures.

The five documented risks (R-01 through R-05) should inform impact estimation: incidents affecting detection capabilities (R-03) or customer trust (R-04) warrant elevated impact classification regardless of technical severity.

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- **Controls:** [DE.AE-04_Ex1](../../2_Controls/DE/DE.AE-04_Ex1.md), [DE.AE-04_Ex2](../../2_Controls/DE/DE.AE-04_Ex2.md)
- **Observations:** [DE.AE-04-Q1](../../4_Observations/DE/DE.AE-04-Q1.md)
