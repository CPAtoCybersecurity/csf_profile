# PR.AA-01: Identity and Credential Management — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-12

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Identity Management Policy, ServiceNow onboarding/offboarding workflows, Active Directory user and service account exports, Workday-ServiceNow integration configuration |
| Interview | Yes | Interviewed Gerry (CISO) on identity governance strategy; Nadia Khan on credential monitoring and anomaly detection; IT Manager on provisioning/deprovisioning SLAs |
| Test | Yes | Cross-referenced AD active user list against Workday employee roster; tested offboarding automation by tracing 8 Q4 2025 terminations through the revocation workflow; verified service account inventory against running services |

---

## Findings

Alma Security maintains identity and credential management through a Workday-to-ServiceNow integration pipeline backed by Active Directory on the on-premises Windows Domain Controller. The provisioning workflow is operational for standard employee roles, with automated AD account creation, group membership assignment, and Windows Authenticator SSO enrollment. The offboarding workflow triggers account disablement within the required SLA for involuntary terminations (same-day) and voluntary departures (next business day). Testing of 8 recent terminations confirmed that 7 were processed within SLA; 1 voluntary termination experienced a 3-day delay attributed to a ServiceNow workflow error that has since been resolved.

The service account inventory in ServiceNow CMDB tracks 45 service accounts with documented owners. However, cross-referencing against running services on the Windows Domain Controller and AWS identified 3 service accounts not present in the inventory, all created during emergency change windows and never reconciled into the formal inventory. The quarterly access recertification process covers service accounts, but the 3 undocumented accounts were excluded from the Q4 2025 review cycle.

The shared developer SSH key on port 45001 remains the most significant identity management gap. Eight developers share a single RSA-4096 key for production database access, eliminating individual accountability. The key has never been rotated. Remediation is planned for Q3 2026 via HashiCorp Vault SSH certificate authority, but no interim compensating controls exist beyond Palo Alto firewall session logging on port 45001.

### Strengths

- Workday-ServiceNow integration provides automated identity lifecycle for standard employee roles
- Offboarding SLA adherence at 87.5% (7 of 8 tested) for access revocation timing
- Service account ownership documented for 93% of known accounts (42 of 45)
- Monthly privileged account reviews conducted by Gerry's security team with documented outcomes
- MFA Rollout project ($80K) actively strengthening credential management

### Gaps

- Shared developer SSH key on port 45001 violates credential uniqueness and individual accountability principles
- 3 service accounts created during emergency changes not in CMDB inventory
- AWS IAM and Kubernetes deprovisioning requires manual intervention (24-48 hour gap after termination)
- Role-change workflow not fully automated; access creep identified at 12% of AD group memberships
- Credential recovery relies on knowledge-based identity verification, susceptible to social engineering

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- Identity and Access Management Policy (ALMA-POL-2024-001)
- ServiceNow onboarding and offboarding workflow configurations
- Active Directory user export (March 2026)
- Workday active employee roster (March 2026)
- Service account inventory from ServiceNow CMDB
- Q4 2025 access recertification campaign results
- 8 termination case files from Q4 2025 (access revocation timing)
- Shared SSH key risk register entry (R-SSH-001)
- MFA Rollout project status report

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Remediate shared developer SSH key by deploying HashiCorp Vault SSH CA; implement interim session monitoring | Critical | Chris Magann |
| 2 | Reconcile 3 undocumented service accounts into CMDB; implement emergency change reconciliation process | High | Tigan Wang |
| 3 | Automate AWS IAM and Kubernetes deprovisioning through ServiceNow webhook-triggered Lambda function | High | Nadia Khan |
| 4 | Implement automated role-change detection to remove prior entitlements on department/title changes | Medium | Chris Magann |
| 5 | Migrate credential recovery from knowledge-based to video-based identity verification for privileged accounts | Medium | Gerry |
| 6 | Enable MFA on AWS root account using hardware security key | Critical | Gerry |
