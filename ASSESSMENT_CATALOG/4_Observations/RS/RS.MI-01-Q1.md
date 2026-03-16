# RS.MI-01: Incident Containment — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed SentinelOne automated containment configuration, GuardDuty auto-remediation Lambda functions, incident response playbook containment procedures, ServiceNow containment action documentation |
| Interview | Yes | Interviewed Nadia Khan on containment strategy and automated vs. manual containment decision criteria; SOC analyst on containment execution workflow and available tools |
| Test | Yes | Verified SentinelOne network isolation capability on a test endpoint; reviewed GuardDuty auto-remediation configuration for EC2 isolation; traced containment actions for 2 recent incidents |

---

## Findings

Alma Security implements incident containment through both automated and manual mechanisms. SentinelOne provides automated endpoint containment by network-isolating compromised hosts upon confirmed malicious activity detection, maintaining only agent-to-cloud communication for remote investigation. GuardDuty auto-remediation Lambda functions contain cloud-based incidents by applying restrictive security groups to compromised EC2 instances, effectively quarantining them from production networks.

Manual containment capabilities are available to Nadia Khan's D&R team through SentinelOne console, AWS security group modifications, Palo Alto firewall rule injection, and Active Directory account suspension. The incident response playbook documents available containment actions for each major incident type. The third-party DFIR retainer includes pre-authorized containment actions for incidents exceeding internal capacity.

Review of 2 recent incidents showed effective containment execution. The SentinelOne automated containment response time was under 3 minutes from detection. Manual containment actions were documented in ServiceNow with timestamps and justification. However, containment action verification (confirming the containment was effective) is performed manually with no automated validation mechanism.

### Strengths

- SentinelOne automated containment achieves sub-3-minute network isolation for endpoint threats
- GuardDuty auto-remediation provides automated cloud workload containment
- Multiple manual containment tools available with pre-authorized access for the D&R team
- Containment actions documented in ServiceNow with timestamps and responder identification
- Third-party DFIR retainer extends containment capability for major incidents

### Gaps

- No automated containment effectiveness verification mechanism
- Containment options for SaaS application compromise not defined
- Automated containment thresholds may need tuning to prevent business disruption from false positives
- VLAN-based quarantine for on-premises systems not implemented

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 6 |

---

## Evidence Reviewed

- SentinelOne automated containment configuration and response time logs
- GuardDuty auto-remediation Lambda function configuration
- Incident response playbook containment procedures
- 2 ServiceNow incident tickets with containment action documentation
- Third-party DFIR retainer containment authorization provisions
- SentinelOne test endpoint network isolation validation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Implement automated containment effectiveness verification (connectivity tests, process monitoring) post-isolation | High | Nadia Khan |
| 2 | Define containment procedures for SaaS application compromise scenarios | Medium | Nadia Khan |
| 3 | Review and tune automated containment thresholds to balance speed with false positive risk | Medium | Nadia Khan |
| 4 | Implement VLAN-based quarantine for on-premises systems as supplementary containment mechanism | Low | Nadia Khan |
