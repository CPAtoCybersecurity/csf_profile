# GV.SC-09 Ex4: Require Approved Supplier Personnel for Maintenance

**Subcategory:** GV.SC-09 — Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle
**NIST SP 800-53 Ref:** PM-09, PM-19, PM-28, PM-30, PM-31, RA-03, RA-07, SA-04, SA-09, SR-02, SR-03, SR-05, SR-06

## Implementation Example

> Review policies to ensure that they require approved supplier personnel to perform maintenance on the organization's systems and to log those activities.

## Alma Security Implementation

Alma Security's access management policy requires that only approved and vetted supplier personnel access Alma systems for maintenance. Vendor access is provisioned through named accounts with MFA, scoped to minimum necessary permissions, and automatically logged. All vendor maintenance sessions are recorded and reviewed. Access is time-limited through ServiceNow ticket-based provisioning with automatic expiration.

## Artifacts

- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
