# PR.PS-05_Ex1: Deploy Application Control on Endpoints

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software)

## Implementation Example

> Deploy application control technology on endpoints (workstations, laptops, servers) that restricts execution to authorized software, preventing unauthorized applications from running.

## Alma Security Implementation

Alma deploys SentinelOne with application control across approximately 300 endpoints (98%+ coverage), operating in hybrid mode: known-malicious blocked, known-good allowed, unrecognized executables alerted but not blocked. The security team reviews application control alerts daily and maintains blocklist/allowlist updates. Full enforcement (block-by-default) is not enabled due to developer productivity concerns; server-side and Kubernetes node application control is limited to baseline enforcement only.

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
