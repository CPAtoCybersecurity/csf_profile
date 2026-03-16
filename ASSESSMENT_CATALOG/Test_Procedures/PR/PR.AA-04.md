# PR.AA-04: Identity Assertion Protection Test Procedures

**CSF Subcategory:** PR.AA-04 - Identity assertions are protected, conveyed, and verified

---

## Test Procedures

1. **Review identity assertion architecture and standards**
   - Obtain documentation of identity assertion mechanisms (SAML, OAuth 2.0, OIDC, Kerberos)
   - Verify that assertion protocols are documented with supported versions and configurations
   - Confirm that deprecated or insecure assertion methods are prohibited (e.g., SAML 1.x, unsigned tokens)
   - Check that assertion standards align with NIST SP 800-63C federation assurance levels

2. **Examine SSO token and assertion configuration**
   - Review Windows Authenticator SSO configuration for assertion signing and encryption
   - Verify SAML assertions are digitally signed and optionally encrypted in transit
   - Confirm OAuth/OIDC tokens use appropriate algorithms (RS256 or ES256, not HS256 for public clients)
   - Check token expiration settings and refresh token policies across integrated applications
   - Verify assertion audience restrictions are configured to prevent token reuse across services

3. **Test assertion transport security**
   - Verify all assertion exchanges occur over TLS 1.2 or higher
   - Confirm that assertions are not exposed in URL parameters or browser history
   - Check that redirect URIs are validated and restricted to authorized endpoints
   - Test for assertion replay protection mechanisms (nonce, timestamp validation)

4. **Assess federation and cross-domain assertion trust**
   - Review federated identity trust relationships with external partners or cloud services
   - Verify that AWS IAM role assumption uses properly scoped trust policies
   - Confirm Kubernetes service account tokens are bound to specific pods and namespaces
   - Check that cross-account AWS access uses external ID conditions to prevent confused deputy attacks

5. **Evaluate assertion verification at relying parties**
   - Sample 3-5 critical applications and verify they validate assertion signatures
   - Confirm relying parties check assertion expiration and issuer claims
   - Test that invalid or expired assertions are rejected (not silently accepted)
   - Verify that assertion verification failures generate security logs

---

## Evidence Requests

- [ ] Identity assertion architecture diagram (SSO flow, federation relationships)
- [ ] SSO configuration export showing assertion signing and encryption settings
- [ ] OAuth/OIDC client configurations for critical applications
- [ ] Token expiration and refresh token policy documentation
- [ ] TLS configuration for identity provider endpoints
- [ ] AWS IAM trust policies for cross-account roles
- [ ] Kubernetes RBAC and service account token configuration
- [ ] Federation trust relationship inventory with external parties
- [ ] Sample assertion validation logs from relying parties

---

## Notes

This test procedure validates that identity assertions (tokens, tickets, SAML assertions) are cryptographically protected, securely transmitted, and properly verified by relying parties. Key maturity indicators include signed and encrypted assertions, short-lived tokens with refresh mechanisms, and logged assertion verification failures. At Alma Security, the Windows Authenticator SSO serves as the primary identity provider for on-premises and SaaS applications, while AWS IAM manages cloud identity assertions. The Kubernetes environment introduces service-to-service assertion requirements that must be evaluated alongside user-facing assertions. Weak assertion protection can enable session hijacking, token forgery, and lateral movement across the hybrid infrastructure.
