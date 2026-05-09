# PR.AA-01: Identity Lifecycle Management Test Procedures

**CSF Subcategory:** PR.AA-01 - Identities and credentials for authorized users, services, and hardware are managed by the organization

---

## Test Procedures

1. **Map all identity surfaces in scope**
   - Obtain a list of all systems requiring authentication (identity provider, SaaS applications, VPN, privileged access workstations, CI/CD pipelines)
   - Confirm the IAM policy explicitly covers each system
   - Flag any system with independent local user management not governed by the central IdP (Completeness assertion)

2. **Review identity management policy and procedures**
   - Obtain Identity and Access Management (IAM) policy documentation
   - Verify policy addresses onboarding, role changes, and offboarding
   - Confirm credential management requirements (complexity, rotation, expiration)

3. **Verify user onboarding process**
   - Review onboarding workflow in ticketing system (ServiceNow, Jira)
   - Confirm access requests require manager and asset owner approval
   - Verify accounts are provisioned based on role-based access control (RBAC)
   - Check that new hire access is granted within defined SLA

4. **Observe provisioning workflow execution**
   - Request a live demonstration of creating a test account through the standard provisioning workflow
   - Verify that all approval gates trigger (manager approval, asset owner approval)
   - Observe whether RBAC assignment is automatic or manual
   - Note any steps performed outside the ticketing system (Accuracy + Recurrence assertions)

5. **Examine offboarding procedures**
   - Pull sample of recent terminations from HR system
   - Verify access was revoked within required timeframe (e.g., same day for involuntary)
   - Check for account disablement vs. deletion per retention policy
   - Confirm return of physical access credentials (badges, tokens)

6. **Compute identity hygiene KPIs**
   - Calculate orphaned account rate: (orphaned accounts / total accounts) x 100 — target: < 1%
   - Calculate average time to deprovisioning after termination date (target: same day for involuntary, 24 hours for voluntary)
   - Export active accounts from identity provider (Okta, Azure AD, Active Directory) and cross-reference against current HR roster
   - Identify accounts inactive 90+ days with no documented exception
   - Calculate access review completion rate and last review date per system (Recurrence assertion)

7. **Review service account management**
   - Obtain inventory of service accounts and system accounts
   - Verify each has documented owner and business justification
   - Check credential rotation schedules for service accounts
   - Confirm service accounts follow least privilege principle

---

## Evidence Requests

- [ ] Identity and Access Management Policy
- [ ] Full inventory of all systems with independent user management (not just the primary IdP)
- [ ] User provisioning workflow documentation
- [ ] Offboarding checklist and procedures
- [ ] Sample of recent onboarding tickets (5-10 examples)
- [ ] Sample of recent termination access revocations (5-10 examples)
- [ ] Active Directory or identity provider user export with last-login timestamps
- [ ] HR active employee roster (for cross-reference)
- [ ] Access review schedule and completion records for the past 12 months
- [ ] Service account inventory with owners

---

## Notes

This test procedure validates that the organization maintains accurate identity records throughout the user lifecycle. Key indicators of maturity include automated provisioning/deprovisioning, regular orphaned account reviews, and documented service account ownership. Step 1 was added to apply the 15.6 Completeness assertion: the procedure must verify IAM coverage across ALL identity surfaces, not just the primary IdP. Step 4 adds observation of a live provisioning workflow — inspection of past tickets alone does not confirm the process works as documented. Step 6 adds analytical KPIs to compute orphaned account rate and deprovisioning timeliness rather than relying on qualitative assessment. Cross-referencing identity systems with HR data helps identify access that persists after employment ends.
