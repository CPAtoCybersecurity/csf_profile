# PR.PS-02_Ex6: Uninstall or Disable Unauthorized Software

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-10 (Software Usage Restrictions)

## Implementation Example

> Detect and remove or disable unauthorized, unlicensed, or unapproved software from organizational systems, including verifying complete removal of residual files and configurations.

## Alma Security Implementation

Alma uses SentinelOne application inventory on endpoints and AWS Systems Manager Inventory on servers to detect unauthorized software, with periodic reviews against the approved catalog. Unauthorized installations are remediated via IT helpdesk tickets (endpoints) or Ansible baseline enforcement (servers). Detection and removal is reactive -- SentinelOne application control operates in detection-only mode for unrecognized executables, and no automated real-time blocking is configured.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne application inventory report | SentinelOne Console | 2026-03-14 |
| Unauthorized software removal tickets (sample) | ServiceNow / IT helpdesk | 2026-03-10 |
| AWS Systems Manager Inventory compliance findings | AWS Console | 2026-03-14 |
| Ansible baseline enforcement logs showing package remediation | Ansible Tower / AWX | 2026-03-10 |
| SentinelOne application control policy configuration | SentinelOne Console | 2026-03-14 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No automated real-time blocking of unauthorized software on endpoints | Medium --- unauthorized software can persist for days before detection and removal | Transition SentinelOne application control from detection to enforcement mode for new executables | Chris Magann | Q2 2026 |
| Server-side unauthorized software detection is periodic, not real-time | Medium --- gap between installation and detection on servers | Implement real-time file integrity monitoring or package installation alerting | Tigan Wang | Q3 2026 |
| Removal process is manual with no verification of complete uninstallation | Low --- residual configurations may persist after removal | Add post-removal verification step to the unauthorized software remediation workflow | Chris Magann | Q3 2026 |
