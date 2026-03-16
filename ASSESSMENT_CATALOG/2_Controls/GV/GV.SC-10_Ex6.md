# GV.SC-10 Ex6: Mitigate Risks from Supplier Termination

**Subcategory:** GV.SC-10 — Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement
**NIST SP 800-53 Ref:** PM-31, RA-03, RA-05, RA-07, SA-04, SA-09, SR-02, SR-03, SR-05, SR-06

## Implementation Example

> Mitigate risks to data and systems created by supplier termination.

## Alma Security Implementation

The offboarding procedure includes risk mitigation steps: immediate access revocation, security monitoring escalation for 90 days post-termination, data migration verification, replacement control implementation, and updated risk assessment reflecting the vendor removal. The security engineering team validates that no orphaned integrations, API keys, or data flows remain after termination. Post-termination risk reviews are documented in ServiceNow.

## Artifacts

- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Service Account Inventory](../../5_Artifacts/Inventories/INV-service-accounts.md)
