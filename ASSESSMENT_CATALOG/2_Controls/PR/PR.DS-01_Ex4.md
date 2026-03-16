# PR.DS-01_Ex4: Restrict Use of Removable Media

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** MP-08 (Media Downgrading), SC-28 (Protection of Information at Rest)

## Implementation Example

> Restrict the use of removable media devices (USB drives, external hard drives, optical media) to prevent unauthorized data exfiltration and protect the confidentiality of data at rest on portable storage.

## Alma Security Implementation

Alma blocks all USB mass storage, external drives, and optical media on corporate endpoints via SentinelOne device control, enforced at the kernel level across all 300 employees. A documented exception process requires manager and IT Security approval with 72-hour time limits and mandatory encryption. SentinelOne DLP monitoring supplements device control by detecting exfiltration patterns including large file transfers and sensitive data movement, with weekly log review and 4-hour alert triage SLA.

## Artifacts

- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Acceptable Use Policy](../../5_Artifacts/Policies/POL-acceptable-use.md)
