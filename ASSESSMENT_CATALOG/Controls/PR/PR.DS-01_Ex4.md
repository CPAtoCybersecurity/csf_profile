# PR.DS-01_Ex4: Restrict Use of Removable Media

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** MP-08 (Media Downgrading), SC-28 (Protection of Information at Rest)

## Implementation Example

> Restrict the use of removable media devices (USB drives, external hard drives, optical media) to prevent unauthorized data exfiltration and protect the confidentiality of data at rest on portable storage.

## Alma Security Implementation

Alma blocks all USB mass storage, external drives, and optical media on corporate endpoints via SentinelOne device control, enforced at the kernel level across all 300 employees. A documented exception process requires manager and IT Security approval with 72-hour time limits and mandatory encryption. SentinelOne DLP monitoring supplements device control by detecting exfiltration patterns including large file transfers and sensitive data movement, with weekly log review and 4-hour alert triage SLA.

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
