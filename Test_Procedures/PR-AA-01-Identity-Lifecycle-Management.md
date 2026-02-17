# PR.AA-01: Identity Lifecycle Management Test Procedures

**CSF Subcategory:** PR.AA-01 - Identities and credentials for authorized users, services, and hardware are managed by the organization

---

## Test Procedures

1. **Review identity management policy and procedures**
   - Obtain Identity and Access Management (IAM) policy documentation
   - Verify policy addresses onboarding, role changes, and offboarding
   - Confirm credential management requirements (complexity, rotation, expiration)

2. **Verify user onboarding process**
   - Review onboarding workflow in ticketing system (ServiceNow, Jira)
   - Confirm access requests require manager and asset owner approval
   - Verify accounts are provisioned based on role-based access control (RBAC)
   - Check that new hire access is granted within defined SLA

3. **Examine offboarding procedures**
   - Pull sample of recent terminations from HR system
   - Verify access was revoked within required timeframe (e.g., same day for involuntary)
   - Check for account disablement vs. deletion per retention policy
   - Confirm return of physical access credentials (badges, tokens)

4. **Identify orphaned and dormant accounts**
   - Export active accounts from identity provider (Okta, Azure AD, Active Directory)
   - Cross-reference against current employee roster from HR
   - Identify accounts inactive for 90+ days without justification
   - Document service accounts and their owners

5. **Review service account management**
   - Obtain inventory of service accounts and system accounts
   - Verify each has documented owner and business justification
   - Check credential rotation schedules for service accounts
   - Confirm service accounts follow least privilege principle

---

## Evidence Requests

- [ ] Identity and Access Management Policy
- [ ] User provisioning workflow documentation
- [ ] Offboarding checklist and procedures
- [ ] Sample of recent onboarding tickets (5-10 examples)
- [ ] Sample of recent termination access revocations (5-10 examples)
- [ ] Active Directory or identity provider user export
- [ ] HR active employee roster (for cross-reference)
- [ ] Service account inventory with owners

---

## Notes

This test procedure validates that the organization maintains accurate identity records throughout the user lifecycle. Key indicators of maturity include automated provisioning/deprovisioning, regular orphaned account reviews, and documented service account ownership. Cross-referencing identity systems with HR data helps identify access that persists after employment ends.
