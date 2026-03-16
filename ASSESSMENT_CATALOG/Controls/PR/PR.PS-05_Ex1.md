# PR.PS-05_Ex1: Deploy Application Control on Endpoints

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software)

## Implementation Example

> Deploy application control technology on endpoints (workstations, laptops, servers) that restricts execution to authorized software, preventing unauthorized applications from running.

## Alma Security Implementation

Alma Security has deployed SentinelOne across all workstations and laptops (approximately 300 endpoints) as its primary endpoint detection and response (EDR) platform, which includes application control capabilities. The SentinelOne agent is configured with an application control policy that maintains an inventory of known applications and alerts on execution of unrecognized executables. The policy currently operates in a hybrid mode: known malicious applications are blocked in real-time, known-good applications are allowed, and unrecognized applications trigger an alert for security team review without blocking execution.

The SentinelOne deployment achieves 98%+ coverage across the endpoint fleet, with the remaining devices being new hires in the provisioning pipeline or temporary loaner devices. The security team reviews application control alerts daily during business hours. Unrecognized applications that are determined to be unauthorized are added to the blocklist and pushed to all endpoints. Applications confirmed as legitimate are added to the allowlist with a business justification recorded in the SentinelOne console notes.

The current hybrid enforcement mode represents a deliberate balance between security and operational disruption. Full enforcement (block-by-default for unrecognized applications) has not been enabled due to concerns about impacting developer productivity, as developers frequently use command-line tools, package managers, and locally compiled binaries that would not be on the pre-approved list. The security team is working with engineering leadership to define a developer workstation policy that enables full application control while accommodating legitimate development workflows.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne deployment dashboard (98%+ coverage) | SentinelOne Console | 2026-03-14 |
| Application control policy configuration | SentinelOne Console | 2026-03-14 |
| Application control alert review logs (daily review) | SentinelOne Console | 2026-03-14 |
| Blocklist and allowlist update history | SentinelOne Console | 2026-03-10 |
| Developer workstation policy exception documentation | Confluence security team space | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Application control not in full enforcement mode (block-by-default) | Medium --- unrecognized malicious executables can run until manually reviewed | Define developer workstation exception policy and enable full enforcement for non-developer endpoints | Chris Magann | Q2 2026 |
| Server-side application control coverage limited (Linux servers use baseline enforcement only) | Medium --- unauthorized software execution on servers relies on baseline compliance | Evaluate server-side application control options (SELinux enforcement, AppArmor profiles) | Tigan Wang | Q3 2026 |
| Kubernetes nodes lack application-level execution control beyond container isolation | Medium --- compromised containers could execute unauthorized binaries on host | Implement Kubernetes admission controllers and pod security standards enforcement | Tigan Wang | Q2 2026 |
