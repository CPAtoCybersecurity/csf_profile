# PR.PS-05: Unauthorized Software Prevention - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed SentinelOne application control configuration and deployment dashboard, authorized software catalog in ServiceNow, GPO local admin restrictions, and Kubernetes admission webhook configuration |
| Interview | Yes | Interviewed Chris Magann on application control enforcement strategy, developer workstation exception policy, and SentinelOne alert review practices |
| Test | Yes | Verified SentinelOne deployment coverage (98%+); reviewed application control block/alert logs (30-day window); confirmed GPO restrictions prevent standard user software installation on Windows endpoints |

---

## Findings

### Strengths

- SentinelOne deployed on 98%+ of workstations and laptops with application control policy active
- Known malicious executables are blocked in real-time by SentinelOne behavioral AI and signature-based detection
- Security team reviews application control alerts daily during business hours
- ServiceNow maintains approved software catalog with self-service provisioning workflow
- Windows endpoints enforce Group Policy restrictions preventing standard user software installation
- Established blocklist/allowlist management process with business justification documentation

### Gaps

- SentinelOne application control operates in hybrid mode (detect-only for unrecognized applications) rather than full enforcement; unrecognized executables can run pending manual review
- 40% of users (engineering and product teams) have local admin rights on macOS devices, bypassing IT installation restrictions
- Linux server execution control relies on baseline noexec mount options only; no allowlist-level enforcement (SELinux not enabled)
- Kubernetes nodes accessible via shared SSH key on port 45001 with root access, allowing arbitrary code execution on cluster hosts and bypassing all container-level controls
- Kubernetes pod security standards only partially enforced through custom admission webhook
- Approved software catalog does not cover open-source tools, browser extensions, or developer libraries
- No automated sync between ServiceNow catalog and SentinelOne allowlist

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4.5 |
| Target Score | 6 |

---

## Evidence Reviewed

- SentinelOne deployment dashboard (98%+ endpoint coverage)
- SentinelOne application control policy configuration (hybrid enforcement mode)
- Application control alert and block logs (30-day review)
- ServiceNow approved software catalog
- Active Directory GPO local admin restriction configuration
- Jamf Pro device management configuration for macOS endpoints
- Local admin privilege audit report (40% engineering/product have admin)
- Kubernetes admission webhook configuration
- SSH access audit for Kubernetes nodes (port 45001)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Remediate shared SSH key on Kubernetes nodes; implement individual key-based access with audit logging | Critical | Tigan Wang |
| 2 | Enable SentinelOne full enforcement mode for non-developer endpoints; define developer workstation exception policy | High | Chris Magann |
| 3 | Implement just-in-time privilege elevation (Jamf Privileges.app or equivalent) to reduce persistent local admin access from 40% | High | Chris Magann |
| 4 | Deploy OPA Gatekeeper or Kyverno for comprehensive Kubernetes pod security enforcement | High | Tigan Wang |
| 5 | Evaluate SELinux or AppArmor enforcement for production Linux servers | Medium | Tigan Wang |
| 6 | Extend approved software catalog to developer toolchains; implement ServiceNow-to-SentinelOne sync | Medium | Chris Magann |
