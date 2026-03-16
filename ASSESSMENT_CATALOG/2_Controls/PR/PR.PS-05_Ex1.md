# PR.PS-05_Ex1: Deploy Application Control on Endpoints

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software)

## Implementation Example

> Deploy application control technology on endpoints (workstations, laptops, servers) that restricts execution to authorized software, preventing unauthorized applications from running.

## Alma Security Implementation

Alma deploys SentinelOne with application control across approximately 300 endpoints (98%+ coverage), operating in hybrid mode: known-malicious blocked, known-good allowed, unrecognized executables alerted but not blocked. The security team reviews application control alerts daily and maintains blocklist/allowlist updates. Full enforcement (block-by-default) is not enabled due to developer productivity concerns; server-side and Kubernetes node application control is limited to baseline enforcement only.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [Acceptable Use Policy](../../5_Artifacts/Policies/POL-acceptable-use.md)
