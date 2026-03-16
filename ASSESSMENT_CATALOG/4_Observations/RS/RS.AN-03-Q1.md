# RS.AN-03: Incident Root Cause Analysis — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook root cause analysis procedures, ServiceNow incident tickets with root cause documentation, SentinelOne forensic timeline exports, CloudTrail event history for investigated incidents |
| Interview | Yes | Interviewed Nadia Khan on root cause analysis methodology and post-incident review process; SOC analyst on forensic data collection and timeline reconstruction |
| Test | Yes | Reviewed 3 closed incident tickets for completeness of root cause analysis documentation; validated forensic data preservation for 1 recent incident; traced event sequence reconstruction across SentinelOne and CloudTrail |

---

## Findings

Alma Security performs incident root cause analysis using a combination of SentinelOne endpoint forensic telemetry, CloudTrail API event history, and GuardDuty findings to reconstruct incident timelines and identify attack vectors. The incident response playbook defines root cause analysis as a required step before incident closure, with documentation in the ServiceNow incident ticket. Nadia Khan's D&R team leads root cause investigations, with each incident assigned a lead analyst responsible for timeline reconstruction and vulnerability identification.

Review of 3 closed incident tickets showed that all included root cause documentation, though the depth and rigor varied. The phishing incident (TKT-SOC-1001) included comprehensive root cause analysis tracing the attack vector through email delivery, credential compromise, and lateral movement. Two lower-severity incidents had root cause documented as a single paragraph without detailed event sequencing. The playbook does not define minimum root cause documentation standards or require formal root cause analysis techniques (such as 5-Whys or fault tree analysis).

### Strengths

- Root cause analysis required as a mandatory step before incident closure per playbook
- SentinelOne provides detailed endpoint forensic telemetry for timeline reconstruction
- CloudTrail and GuardDuty provide cloud-level event history for attack vector identification
- Lead analyst assigned for each incident responsible for root cause determination

### Gaps

- Root cause documentation depth inconsistent across incidents; no minimum standard defined
- No formal root cause analysis methodology (5-Whys, fault tree, Ishikawa) required
- Systemic root cause identification (beyond immediate technical cause) not consistently performed
- Root cause findings not systematically fed back into detection rule tuning or control improvements

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook root cause analysis section
- ServiceNow incident ticket TKT-SOC-1001 (phishing) root cause documentation
- 2 additional closed incident tickets with root cause analysis
- SentinelOne forensic timeline export for recent incident
- CloudTrail event history correlated to incident investigation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Define minimum root cause documentation standards with required sections (event timeline, attack vector, vulnerability exploited, systemic factors) | High | Nadia Khan |
| 2 | Require formal root cause analysis technique (5-Whys or equivalent) for incidents above medium severity | Medium | Nadia Khan |
| 3 | Establish feedback loop from root cause findings to detection rule tuning and control improvement backlog | Medium | Nadia Khan |
| 4 | Conduct quarterly root cause trend analysis to identify systemic security weaknesses | Low | Nadia Khan |
