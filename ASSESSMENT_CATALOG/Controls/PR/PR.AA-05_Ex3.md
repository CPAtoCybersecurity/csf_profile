# PR.AA-05 Ex3: Access Recertification and Periodic Review

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2(3), AC-2(4), AC-6, PS-5

## Implementation Example

> Conducting periodic access reviews and recertification campaigns to verify that user entitlements remain appropriate, removing unnecessary access and ensuring alignment with current job responsibilities

## Alma Security Implementation

Alma Security conducts quarterly access recertification campaigns through ServiceNow, where managers review and certify or revoke entitlements for each direct report within a 2-week completion window covering Active Directory group memberships, SSO application assignments, and AWS IAM role mappings. The three-phase workflow extracts current entitlements, presents approve/revoke options to managers, and triggers automated deprovisioning tasks for approved revocations. Privileged access receives additional monthly reviews covering Domain Admin membership, AWS production role assignments, and Kubernetes cluster-admin bindings. Contractor access recertification includes validation of access expiration dates against current contract terms.

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
