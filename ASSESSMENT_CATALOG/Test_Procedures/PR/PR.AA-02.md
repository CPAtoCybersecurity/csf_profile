# PR.AA-02: Identity Proofing and Credential Binding Test Procedures

**CSF Subcategory:** PR.AA-02 - Identities are proofed and bound to credentials based on the context of interactions

---

## Test Procedures

1. **Review identity proofing policy and standards**
   - Obtain the identity proofing policy or relevant sections of the Information Security Policy
   - Verify policy defines assurance levels for identity proofing based on risk (e.g., NIST SP 800-63A levels)
   - Confirm policy addresses both employee and contractor identity verification requirements
   - Check that credential binding procedures specify how verified identities are linked to issued credentials

2. **Examine employee onboarding identity verification**
   - Review the HR and IT onboarding workflow for identity proofing steps
   - Verify that government-issued identification is collected and validated before credential issuance
   - Confirm that identity verification occurs before SSO account creation and MFA enrollment
   - Sample 5-10 recent onboarding records for evidence of identity proofing completion

3. **Assess credential uniqueness and binding controls**
   - Verify that each individual receives unique credentials (no shared accounts)
   - Confirm SSO enforces one-to-one mapping between verified identity and credential set
   - Check that privileged accounts maintain separate credential binding from standard accounts
   - Review policy enforcement for shared credential prohibition (e.g., shared SSH keys, shared service accounts)

4. **Evaluate remote identity proofing procedures**
   - Review procedures for verifying identity of remote employees and contractors
   - Confirm video or in-person verification is required for high-assurance access
   - Check that remote identity proofing meets equivalent assurance to in-person verification
   - Verify that identity proofing records are retained per policy

5. **Test credential lifecycle binding integrity**
   - Verify that credential resets require identity re-verification (e.g., help desk identity challenge)
   - Confirm that MFA device replacement requires identity proofing before new device enrollment
   - Check that credential recovery processes maintain binding integrity
   - Review self-service password reset for identity verification requirements

---

## Evidence Requests

- [ ] Identity proofing policy or Information Security Policy (relevant sections)
- [ ] Employee onboarding workflow with identity verification steps
- [ ] Sample onboarding records showing identity proofing completion (5-10 examples)
- [ ] SSO configuration showing unique credential enforcement
- [ ] Shared account exception list with justifications (if any)
- [ ] Remote identity proofing procedure documentation
- [ ] Help desk identity verification scripts/procedures
- [ ] MFA device replacement procedures
- [ ] Credential recovery workflow documentation

---

## Notes

This test procedure validates that identities are verified before credentials are issued and that the binding between identity and credential is maintained throughout the lifecycle. Key maturity indicators include risk-based identity proofing assurance levels, prohibition of shared credentials with technical enforcement, and identity re-verification requirements for credential recovery. At Alma Security, the shared developer SSH key on port 45001 represents a known binding gap where multiple identities share a single credential, undermining individual accountability. The MFA Rollout project ($80K) and Apple Passkey partnership (G8) are expected to strengthen credential binding through phishing-resistant authentication factors.
