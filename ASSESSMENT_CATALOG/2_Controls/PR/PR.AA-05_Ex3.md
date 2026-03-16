# PR.AA-05 Ex3: Access Recertification and Periodic Review

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2(3), AC-2(4), AC-6, PS-5

## Implementation Example

> Conducting periodic access reviews and recertification campaigns to verify that user entitlements remain appropriate, removing unnecessary access and ensuring alignment with current job responsibilities

## Alma Security Implementation

Alma Security conducts quarterly access recertification campaigns through ServiceNow, where managers review and certify or revoke entitlements for each direct report within a 2-week completion window covering Active Directory group memberships, SSO application assignments, and AWS IAM role mappings. The three-phase workflow extracts current entitlements, presents approve/revoke options to managers, and triggers automated deprovisioning tasks for approved revocations. Privileged access receives additional monthly reviews covering Domain Admin membership, AWS production role assignments, and Kubernetes cluster-admin bindings. Contractor access recertification includes validation of access expiration dates against current contract terms.

## Artifacts

- [Access Review Procedure](../../5_Artifacts/Procedures/PROC-access-review.md)
- [Access Certification Report Q4](../../5_Artifacts/Reports/RPT-access-certification-q4.md)
- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
