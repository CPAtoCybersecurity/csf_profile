# PR.AA-04 Ex3: Federation Trust and Cross-Domain Assertion Verification

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-8(1), IA-8(2), IA-9

## Implementation Example

> Establishing and managing trust relationships for federated identity assertions across organizational boundaries and cloud environments, ensuring relying parties verify assertions before granting access

## Alma Security Implementation

Alma Security maintains federated identity trust relationships across on-premises Active Directory, the Windows Authenticator SSO platform, AWS (4 accounts via SAML), and approximately 35 SaaS applications, each configured with explicit trust anchors and scoped audience restrictions. AWS federation uses IAM SAML identity provider trust with conditions restricting audience, issuer, and attribute values, and cross-account access uses role assumption with external ID conditions to prevent confused deputy attacks. SaaS federation trust relationships are tracked in a federation inventory documenting assertion attributes and certificate rotation dates. The security team manages certificate lifecycle for all federation trusts, with annual signing certificate rotation at the SSO platform.

## Artifacts

- [Third-Party Risk Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
