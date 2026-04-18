# DE.AE-08: Incidents Are Declared When Adverse Events Meet the Defined Incident Criteria

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** IR-04, IR-08
**Implementation Examples:** 2 (Ex1–Ex2)

## Scope & Applicability

This test procedure covers Alma Security's process for declaring security incidents based on defined criteria:

- **Incident declaration criteria:** Severity-based thresholds defined in the incident response playbook — SEV-1 Critical (customer data exposure, production compromise, active ransomware), SEV-2 High (lateral movement, credential theft), SEV-3 Medium (policy violations, suspicious patterns), SEV-4 Low (reconnaissance, failed attacks)
- **Declaration authority:** SOC Manager (Gerry) has primary declaration authority; on-call SOC analyst has after-hours declaration authority for SEV-1/SEV-2
- **Automated declaration:** GuardDuty High-severity findings auto-generate ServiceNow incident tickets, effectively auto-declaring as incidents
- **False positive management:** Documented false positive registry with suppression rules, business justifications, monthly SOC Manager review, quarterly re-validation
- **Personnel:** Gerry (SOC Manager — declaration authority and FP registry owner), Nadia Khan (D&R Lead), SOC analysts (Jane, John — triage and criteria application), auditor (Steve)

Out of scope: post-declaration incident response activities (containment, eradication, recovery), which are assessed under RS.AN and RS.MA.

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Time from alert to incident declaration | Incident tickets | Per incident | <15 min for auto-declared (High/Critical); <2 hours for manual declaration |
| False positive rate | Ticketing system | Monthly | Track trend; increasing rate indicates criteria or suppression rule drift |
| Missed incident rate | Post-incident reviews | Quarterly | 0 confirmed incidents that were not declared when criteria were met |
| Suppression rule count | False positive registry | Monthly | Trend analysis; growing count without corresponding review may indicate drift |
| Declaration criteria review cadence | Policy records | Annual minimum | Criteria reviewed and updated at least annually |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Review incident response playbook incident criteria section | Playbook defining severity levels (SEV-1 through SEV-4) with specific thresholds for each; criteria address customer data exposure, service availability, credential compromise, and regulatory notification triggers |
| E2 | Verify criteria are specific enough for consistent application | Criteria include objective indicators (e.g., "confirmed lateral movement" not "suspicious activity") that reduce reliance on individual analyst interpretation for common scenarios |
| E3 | Review the false positive registry | Documented suppression rules for GuardDuty finding types, SentinelOne exclusions, and O365 ATP overrides; each rule has business justification, approval record, creation date, and last review date |
| E4 | Confirm monthly SOC Manager review of false positive registry | Review records showing Gerry's monthly assessment of suppression rules; evidence that at least one rule was modified or removed based on review |
| E5 | Verify quarterly re-validation of suppression rules | Quarterly review records confirming all active suppressions were assessed for continued validity; documentation of any rules that were removed because the underlying condition changed |
| E6 | Review ServiceNow auto-declaration configuration for GuardDuty High-severity findings | ServiceNow workflow or Lambda configuration showing automatic incident ticket creation for qualifying GuardDuty findings with severity mapping |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Gerry (SOC Manager) | "Walk me through how you decide to declare an incident for a medium-severity event that's ambiguous — it could be a legitimate policy violation or it could be the early stage of an attack. What criteria do you apply?" — Expected: References specific playbook criteria, describes how asset criticality and context influence the decision, acknowledges that borderline cases require judgment and explains the conservative approach taken |
| I2 | SOC Analyst (Jane or John) | "You receive a GuardDuty Medium finding for unusual API activity from an IAM role. It doesn't trigger auto-declaration. Walk me through your triage and declaration decision." — Expected: Describes applying playbook criteria to the finding characteristics, checking the false positive registry for known patterns, referencing asset context, and documenting the decision rationale in the ticket |
| I3 | Gerry (SOC Manager) | "How do you manage the false positive registry? When was the last time you removed or modified a suppression rule, and what prompted it?" — Expected: Describes the monthly review process, names a specific rule change, and explains how the registry prevents both alert fatigue and missed detections |
| I4 | Nadia Khan (D&R Lead) | "Has there been a case where an event was initially classified as a false positive but later turned out to be a real incident? How did that inform your criteria or suppression rules?" — Expected: Either describes a specific case with lessons learned, or explains the controls in place to prevent this scenario (quarterly re-validation, conservative suppression approach) |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Pull 8 recent security events (mix of auto-declared incidents, manually-declared incidents, and events not declared as incidents); trace the declaration decision for each | All auto-declared events met the severity threshold for automatic declaration; all manually-declared events have documented rationale referencing playbook criteria; all non-declared events have documented triage disposition explaining why criteria were not met |
| T2 | From the 8 events, identify any that should have been declared as incidents but were not (missed declarations) | Zero missed declarations; if any are found, document the failure point (criteria gap, analyst error, false positive suppression) |
| T3 | Review the false positive registry; select 3 active suppression rules and verify each has current business justification and was reviewed within the last quarter | All 3 rules have documented justification, approval, and a review date within the last 90 days; no rule suppresses High-severity finding types without explicit risk acceptance |
| T4 | Measure time from initial alert to incident declaration for the 3 most recent declared incidents | Auto-declared incidents: tickets created within 15 minutes of finding generation; manually-declared incidents: declaration documented within 2 hours of initial triage; after-hours incidents: on-call analyst exercised declaration authority per playbook delegation |

## Evidence Requirements

- [ ] Incident response playbook with incident declaration criteria (SEV-1 through SEV-4 definitions)
- [ ] False positive registry with suppression rules, justifications, and review dates
- [ ] Monthly SOC Manager review records for the false positive registry (last 3 months)
- [ ] Quarterly re-validation records for suppression rules (most recent)
- [ ] ServiceNow auto-declaration workflow configuration for GuardDuty
- [ ] 8 recent security event tickets showing declaration or non-declaration decisions with rationale
- [ ] SOC on-call rotation and after-hours declaration authority documentation
- [ ] Post-incident review records referencing criteria effectiveness (if available)

## Pass/Fail Criteria

**Pass:** Both implementation examples are demonstrably operational:
- Incident criteria application (Ex1) is documented in the playbook with specific severity thresholds, consistently applied across auto-declared and manually-triaged events, and exercised by SOC analysts who can demonstrate criteria application during interview
- False positive management (Ex2) includes a documented registry with business justifications, monthly SOC Manager review, quarterly re-validation, and no evidence of legitimate threats suppressed by active rules

**Partial Pass:** Criteria exist and are applied for auto-declared events, but manual triage decisions show inconsistent criteria application (e.g., 2 of 8 events lack documented declaration rationale), OR false positive registry exists but review cadence is not consistently maintained.

**Fail:** No documented incident criteria exist, OR declaration decisions are made ad-hoc without reference to criteria, OR the false positive registry has not been reviewed in >6 months, OR a missed declaration is identified with no corrective action.

## Alma Security Context

Alma's incident declaration process benefits from the automatic declaration path for GuardDuty High-severity findings — this removes human latency from the most critical events. The SOC Manager as declaration authority with on-call analyst delegation for after-hours events is appropriate for Alma's team size, though the business-hours SOC model means after-hours declaration for medium-severity events may be delayed until the next business day.

The primary gap identified in the Q1 2026 observation is the absence of compound event analysis criteria. Alma's current criteria evaluate individual events against severity thresholds but do not address scenarios where multiple low-severity findings collectively indicate a coordinated attack (e.g., reconnaissance from multiple IPs followed by credential stuffing attempts). For a company in the authentication sector, multi-stage attack detection is particularly relevant.

The false positive registry with monthly review and quarterly re-validation is a mature practice that demonstrates awareness of the tension between alert fatigue and missed detections. Maintaining this discipline as the detection environment grows (more GuardDuty finding types, more SentinelOne exclusions) will be important.

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
- **Controls:** [DE.AE-08_Ex1](../../2_Controls/DE/DE.AE-08_Ex1.md), [DE.AE-08_Ex2](../../2_Controls/DE/DE.AE-08_Ex2.md)
- **Observations:** [DE.AE-08-Q1](../../4_Observations/DE/DE.AE-08-Q1.md)
