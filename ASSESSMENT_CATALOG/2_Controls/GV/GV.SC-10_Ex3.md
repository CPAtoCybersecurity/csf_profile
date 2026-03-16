# GV.SC-10 Ex3: Verify Supplier Access Deactivation

**Subcategory:** GV.SC-10 — Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement
**NIST SP 800-53 Ref:** PM-31, RA-03, RA-05, RA-07, SA-04, SA-09, SR-02, SR-03, SR-05, SR-06

## Implementation Example

> Verify that supplier access to organization resources is deactivated promptly when it is no longer needed.

## Alma Security Implementation

Vendor access deactivation is managed through ServiceNow workflows triggered by contract termination, project completion, or personnel change notifications. The identity management team revokes all vendor access within 24 hours of termination notice, including VPN credentials, SaaS accounts, API keys, and physical access badges. Access removal is verified through automated reconciliation reports, and the access review procedure includes vendor access in quarterly certification cycles.

## Artifacts

- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Access Review Procedure](../../5_Artifacts/Procedures/PROC-access-review.md)
