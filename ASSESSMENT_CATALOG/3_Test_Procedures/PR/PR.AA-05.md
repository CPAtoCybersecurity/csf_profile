# PR.AA-05: Access Authorization Management Test Procedures

**CSF Subcategory:** PR.AA-05 - Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

---

## Test Procedures

1. **Review access control policy framework**
   - Obtain access management policy and supporting procedures
   - Verify policy defines role-based access control (RBAC) or attribute-based access control (ABAC)
   - Confirm least privilege and separation of duties principles are documented
   - Check that policy addresses emergency/break-glass access procedures

2. **Audit privileged access accounts**
   - Export list of users with administrator or elevated privileges
   - Verify each privileged account has documented business justification
   - Check that privileged accounts are separate from standard user accounts
   - Review privileged access management (PAM) tool configuration if applicable

3. **Verify access request and approval workflow**
   - Review access request process documentation
   - Sample 5-10 recent access requests and verify proper approvals
   - Confirm access grants align with role definitions
   - Check that access requests are logged and auditable

4. **Examine access recertification process**
   - Obtain access certification campaign schedule and results
   - Verify quarterly or semi-annual reviews are conducted
   - Sample completed certifications for evidence of manager review
   - Check that revocations from certifications are implemented timely

5. **Assess third-party and contractor access controls**
   - Obtain inventory of external users with system access
   - Verify third-party accounts have expiration dates aligned with contract terms
   - Check that vendor access is logged and monitored
   - Confirm third-party access is included in recertification campaigns

6. **Review separation of duties controls**
   - Identify critical business processes requiring SoD
   - Verify incompatible duties are enforced through technical controls
   - Sample users in sensitive roles for SoD violations
   - Check that SoD conflicts require documented exception approval

---

## Evidence Requests

- [ ] Access Management Policy and procedures
- [ ] Role definitions and entitlement matrix
- [ ] List of privileged accounts with justifications
- [ ] Sample access request tickets with approvals (5-10 examples)
- [ ] Access certification campaign results (last 2 quarters)
- [ ] Third-party/contractor access inventory
- [ ] Separation of duties matrix
- [ ] PAM tool configuration and usage reports

---

## Notes

This test procedure validates that the organization manages access permissions through formal processes with appropriate oversight. Key indicators include documented approval workflows, regular access certifications, and privileged access governance. Third-party access often presents elevated risk and should receive heightened scrutiny during assessments.
