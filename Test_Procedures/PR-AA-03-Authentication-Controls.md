# PR.AA-03: Authentication Controls Test Procedures

**CSF Subcategory:** PR.AA-03 - Users, services, and hardware are authenticated

---

## Test Procedures

1. **Review authentication policy requirements**
   - Obtain authentication and password policy documentation
   - Verify MFA requirements align with data sensitivity and access level
   - Confirm policy addresses remote access, privileged access, and cloud applications

2. **Verify MFA implementation coverage**
   - Export MFA enrollment report from identity provider
   - Calculate enrollment rate (target: 100% for in-scope users)
   - Identify users with MFA exceptions and review justifications
   - Verify MFA is enforced for VPN, cloud applications, and administrative access

3. **Assess MFA configuration strength**
   - Review approved authentication methods (authenticator apps, hardware tokens, SMS)
   - Verify phishing-resistant methods are prioritized (FIDO2, hardware keys)
   - Check that SMS/voice-based MFA is restricted or being phased out
   - Confirm MFA timeout and re-authentication requirements

4. **Test password policy enforcement**
   - Review Active Directory or identity provider password settings
   - Verify minimum length, complexity, and history requirements
   - Check password expiration policy (or passwordless strategy)
   - Confirm lockout thresholds and reset procedures

5. **Review SSH key and certificate management**
   - Obtain inventory of SSH keys with associated users and systems
   - Verify key rotation schedules and enforcement
   - Check for use of certificate-based authentication where applicable
   - Confirm keys are removed upon employee departure

6. **Assess directory services security**
   - Review Active Directory group policy objects (GPOs) for authentication settings
   - Verify Kerberos and NTLM configurations align with security standards
   - Check for legacy protocol restrictions (LM, NTLMv1)
   - Confirm privileged group memberships are reviewed regularly

---

## Evidence Requests

- [ ] Authentication and password policy documentation
- [ ] MFA enrollment report (all users)
- [ ] MFA exception list with business justifications
- [ ] Identity provider authentication method configuration
- [ ] Active Directory password policy settings (screenshot or export)
- [ ] SSH key inventory with owner assignments
- [ ] Key rotation audit logs (last 12 months)
- [ ] Active Directory GPO export for authentication settings

---

## Notes

This test procedure validates that the organization enforces strong authentication across systems and applications. Phishing-resistant MFA methods (FIDO2, hardware tokens) provide stronger protection than SMS or push notifications. SSH key management is often overlooked and represents significant risk if keys persist after personnel changes.
