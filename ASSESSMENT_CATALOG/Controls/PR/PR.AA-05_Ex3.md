# PR.AA-05 Ex3: Access Recertification and Periodic Review

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2(3), AC-2(4), AC-6, PS-5

## Implementation Example

> Conducting periodic access reviews and recertification campaigns to verify that user entitlements remain appropriate, removing unnecessary access and ensuring alignment with current job responsibilities

## Alma Security Implementation

Alma Security conducts quarterly access recertification campaigns through ServiceNow. The IAM team generates access review tasks assigned to managers, who must review and certify (or revoke) the access entitlements for each direct report within a 2-week completion window. The campaign covers Active Directory group memberships, SSO application assignments, and AWS IAM role mappings. The Q4 2025 campaign, the most recently completed cycle, achieved a 95% completion rate across 280 user reviews.

The recertification workflow operates in three phases. First, the IAM team extracts current entitlements from Active Directory and the SSO platform, generating a per-user access report. Second, managers receive their team's access reports in ServiceNow with approve/revoke options for each entitlement. Third, revocation decisions trigger automated deprovisioning tasks for the IT team. However, the remediation phase has proven to be the weakest link: the Q4 2025 campaign identified 43 entitlements requiring revocation, but only 31 (72%) were actually removed by the close of Q1 2026. The remaining 12 revocations are pending due to dependency concerns raised by application owners.

Privileged access receives additional scrutiny through monthly reviews conducted by Gerry's security team. The monthly review covers Domain Admin membership, AWS production role assignments, and Kubernetes cluster-admin bindings. This dual-frequency approach (monthly for privileged, quarterly for standard) reflects the higher risk associated with administrative access. Third-party and contractor access is included in the quarterly campaign, with the additional requirement that contractor access expiration dates are validated against current contract terms.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Q4 2025 access recertification campaign results | ServiceNow > Access Reviews > Q4-2025 | 2026-01-31 |
| Recertification completion rate tracking | ServiceNow > Reports > Access Certification | 2026-01-31 |
| Remediation tracking for revocation actions | ServiceNow > Tasks > Access Revocations | 2026-03-10 |
| Monthly privileged access review log | Security Team > Monthly Reviews | 2026-03-01 |
| Contractor access expiration validation | ServiceNow > Access Reviews > Contractors | 2026-01-31 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Recertification remediation rate at 72% vs. 95% target | Identified excessive access persists after management review, undermining the recertification process | Implement automated revocation with mandatory exception approval workflow; establish 5-business-day revocation SLA | Gerry | 2026-06-30 |
| Recertification does not cover AWS resource-level permissions | Managers certify role assignments but not the specific AWS permissions within each role | Extend recertification to include AWS IAM policy review for roles with broad permissions (e.g., AdministratorAccess) | Tigan Wang | 2026-08-31 |
| No recertification automation for Kubernetes RBAC | K8s role bindings not included in the recertification campaign; reviewed only in monthly privileged check | Integrate Kubernetes RBAC export into quarterly recertification workflow through ServiceNow | Nadia Khan | 2026-07-31 |
