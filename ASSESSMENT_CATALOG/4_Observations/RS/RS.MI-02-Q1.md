# RS.MI-02: Incident Eradication — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed SentinelOne remediation and rollback capabilities, incident response playbook eradication procedures, GuardDuty auto-remediation eradication actions, ServiceNow eradication action documentation |
| Interview | Yes | Interviewed Nadia Khan on eradication methodology and verification standards; SOC analyst on eradication tool usage and post-eradication validation |
| Test | Yes | Reviewed SentinelOne remediation action logs for recent threats; verified GuardDuty auto-remediation eradication configuration; traced eradication actions for 2 recent incidents including verification steps |

---

## Findings

Alma Security performs incident eradication through automated and manual mechanisms. SentinelOne provides automated eradication through threat remediation (killing malicious processes, quarantining files) and rollback capabilities that reverse unauthorized system changes. GuardDuty auto-remediation Lambda functions perform eradication actions including revoking compromised IAM credentials, terminating unauthorized EC2 instances, and removing malicious security group rules.

Manual eradication procedures in the incident response playbook cover system reimaging, credential rotation, malware removal, and persistence mechanism elimination. The D&R team maintains documented runbooks for common eradication scenarios. The third-party DFIR retainer includes eradication capabilities for advanced threats exceeding internal expertise.

Review of 2 recent incidents showed effective eradication with documented actions. SentinelOne remediation was successful in both cases. However, post-eradication verification is inconsistent -- the phishing incident included thorough verification scanning, while the second incident's verification was limited to confirming the SentinelOne remediation completed without validating the absence of additional persistence mechanisms.

### Strengths

- SentinelOne automated remediation and rollback provide rapid eradication capability
- GuardDuty auto-remediation handles cloud-level eradication for common threat patterns
- Manual eradication runbooks documented for common incident scenarios
- Third-party DFIR retainer available for advanced threat eradication
- Eradication actions documented in ServiceNow with outcome recording

### Gaps

- Post-eradication verification inconsistent; no standardized verification checklist
- Eradication of advanced persistent threats may require capabilities beyond current tooling
- No automated re-scan or validation after eradication to confirm complete threat removal
- Gold image inventory for system reimaging not regularly validated

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- SentinelOne remediation and rollback action logs
- GuardDuty auto-remediation eradication configuration
- Incident response playbook eradication procedures
- Eradication runbooks in ServiceNow knowledge base
- 2 ServiceNow incident tickets with eradication documentation
- Third-party DFIR retainer eradication provisions
- Post-eradication verification records

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Develop standardized post-eradication verification checklist including automated re-scan requirement | High | Nadia Khan |
| 2 | Implement automated post-eradication validation scan triggered after manual eradication actions | High | Nadia Khan |
| 3 | Validate gold image inventory and reimaging procedures quarterly | Medium | Nadia Khan |
| 4 | Assess advanced persistent threat eradication capability gaps and identify tooling enhancements | Low | Nadia Khan |
