# PR.DS-01_Ex4: Restrict Use of Removable Media

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** MP-08 (Media Downgrading), SC-28 (Protection of Information at Rest)

## Implementation Example

> Restrict the use of removable media devices (USB drives, external hard drives, optical media) to prevent unauthorized data exfiltration and protect the confidentiality of data at rest on portable storage.

## Alma Security Implementation

Alma Security has deployed comprehensive removable media controls across its endpoint fleet using SentinelOne's device control capabilities. The SentinelOne device control policy blocks all USB mass storage devices, external hard drives, and optical media by default on all corporate-managed endpoints. This policy is enforced at the kernel level, preventing device mounting regardless of user privilege level. The policy applies uniformly across the 300-person organization, with a documented exception process for approved business use cases requiring removable media.

The removable media exception process requires approval from the employee's manager and the IT Security team, with a documented business justification. Approved exceptions are time-limited (maximum 72 hours) and require that any data transferred to removable media be encrypted using the organization's approved encryption tool. SentinelOne logs all removable media connection attempts, including blocked attempts, providing visibility into attempted policy violations. These logs are reviewed weekly as part of the DLP monitoring program managed by the security operations team.

Physical removable media controls are supplemented by network-based DLP monitoring, also facilitated through SentinelOne. The DLP agent monitors for potential data exfiltration patterns including large file transfers, sensitive data pattern matching (biometric data signatures, PII patterns), and anomalous data movement. Alerts are triaged within a 4-hour SLA during business hours. This control is fully deployed and represents one of Alma's more mature data protection capabilities.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne device control policy configuration | SentinelOne Management Console | 2026-03-10 |
| Removable media block rate report (last 30 days) | SentinelOne Reports | 2026-03-10 |
| Removable media exception process documentation | IT Security Policy Wiki | 2026-02-15 |
| Approved exception log with business justifications | IT Security ticketing system | 2026-03-10 |
| DLP monitoring configuration and alert samples | SentinelOne DLP Console | 2026-03-05 |
| Weekly DLP review records | Security operations documentation | 2026-03-08 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track - controls fully deployed, exception process operational |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Exception process not yet integrated with ticketing workflow | Manual tracking increases risk of expired exceptions | Integrate removable media exceptions into ServiceNow workflow with auto-expiration | Nadia Khan | 2026-06-30 |
| DLP pattern matching not tuned for biometric data signatures | May miss exfiltration of highest-sensitivity data type | Develop custom DLP patterns for biometric data formats used by Alma | Nadia Khan | 2026-05-31 |
