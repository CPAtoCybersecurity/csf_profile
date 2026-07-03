# PR.AA-02

Description: Identities are proofed and bound to credentials based on the context of interactions
Category: Identity Management, Authentication, and Access Control (../categories/Identity%20Management,%20Authentication,%20and%20Access%20Co%206112f77a070b03b7d33aa4cd50902c11.md)
Function: PR (../functions/PR%2098c54861453ab3bbd429d0b4b9e9883a.md)
Score: 5
Target Score: 5
In Scope?: Yes
Owner: gerry <gerry@almasecurity.com>
Auditor: steve <steve@almasecurity.com>
NIST 800-53 Control Ref: IA-12

## Implementation Examples

- **Ex1:** Verify a person's claimed identity at enrollment time using government-issued identity credentials (e.g., passport, visa, driver's license)

  IA-12
- **Ex2:** Issue a different credential for each person (i.e., no credential sharing)

  Identity management enforces credential uniqueness through: (1) no shared accounts policy in Information Security Policy, (2) individual credentials issued via SSO, (3) quarterly privileged access reviews by IAM team. The MFA Rollout project ($80K) supports the Apple Passkey partnership (G8). Shared developer SSH key is identified for Q3 remediation.
