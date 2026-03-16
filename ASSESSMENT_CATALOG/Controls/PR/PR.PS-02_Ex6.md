# PR.PS-02_Ex6: Uninstall or Disable Unauthorized Software

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-10 (Software Usage Restrictions)

## Implementation Example

> Detect and remove or disable unauthorized, unlicensed, or unapproved software from organizational systems, including verifying complete removal of residual files and configurations.

## Alma Security Implementation

Alma Security relies on SentinelOne's endpoint detection and response (EDR) capabilities to identify unauthorized software on workstations and laptops. SentinelOne's application inventory feature provides visibility into installed applications, and the security team periodically reviews the inventory against the approved software catalog to identify unauthorized installations. When unauthorized software is identified, the IT helpdesk creates a ticket to contact the user, explain the policy violation, and arrange for removal.

On server infrastructure, unauthorized software detection is handled through AWS Systems Manager Inventory, which collects installed package data and compares it against the hardened baseline's expected software list. Packages not in the approved list generate compliance findings that are reviewed during the weekly infrastructure team meeting. The Ansible baseline enforcement can remediate unauthorized packages during the next scheduled compliance run, but this is reactive rather than preventive.

The unauthorized software removal process is primarily reactive and manual. There is no automated mechanism to immediately block or quarantine unauthorized software upon detection on endpoints. The reliance on periodic review cycles means unauthorized software can exist in the environment for days to weeks before detection. The SentinelOne application control feature provides real-time blocking capabilities on workstations, but enforcement policies are not yet configured to automatically block unrecognized applications --- they currently operate in detection mode for newly observed executables.

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
