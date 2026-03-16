# GV.SC-10 Ex7: Manage Data Leakage Risks from Termination

**Subcategory:** GV.SC-10 — Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement
**NIST SP 800-53 Ref:** PM-31, RA-03, RA-05, RA-07, SA-04, SA-09, SR-02, SR-03, SR-05, SR-06

## Implementation Example

> Manage data leakage risks associated with supplier termination.

## Alma Security Implementation

Data leakage prevention during vendor termination includes: encryption key rotation for shared secrets, API credential revocation, DLP rule updates to block data flows to terminated vendor domains, and validation of data destruction certificates. The GRC team maintains a termination-specific data leakage checklist in ServiceNow. For vendors with access to customer data, the security team conducts a post-termination audit within 60 days to confirm no residual data exposure.

## Artifacts

- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
