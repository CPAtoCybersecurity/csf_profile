# PR.IR-02_Ex1: Protection from Environmental Threats

**Subcategory:** PR.IR-02 — The organization's technology assets are protected from environmental threats

**NIST SP 800-53 Ref:** CP-02, PE-09, PE-10, PE-11, PE-12, PE-13, PE-14, PE-15, PE-17, PE-18, PE-23

## Implementation Example

> Ex1: Technology assets are protected from environmental threats such as flooding, fire, extreme heat, and other natural or man-made hazards through physical safeguards and site selection.

## Alma Security Implementation

Alma Security protects its Redwood City on-premises data center with fire suppression and HVAC monitoring systems designed to mitigate the primary environmental threats to technology infrastructure. The fire suppression system provides automated detection and suppression capabilities to limit fire damage to servers, networking equipment, and storage arrays. HVAC monitoring tracks temperature and humidity conditions within the data center, alerting operations staff when environmental conditions deviate from acceptable thresholds.

The AWS production infrastructure benefits from Amazon's well-documented physical security and environmental controls at their data center facilities. Alma's multi-AZ deployment architecture ensures that a localized environmental event affecting a single Availability Zone (fire, flood, power failure) does not result in complete service unavailability. AWS facilities include redundant power, cooling, fire detection and suppression, and water detection systems as part of the shared responsibility model — Alma inherits these protections for cloud-hosted workloads.

On-premises gaps include the absence of documented environmental risk assessments specific to the Redwood City facility, limited visibility into the maintenance and testing cadence for fire suppression systems, and uncertainty about whether flood detection sensors are deployed given Northern California's increasing flood risk. The facility's environmental protection controls have not been independently verified or audited as part of the cybersecurity assessment program to date.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Fire suppression system documentation | Redwood City DC facilities records | 2026-01-15 |
| HVAC monitoring system configuration | Building management system | 2026-02-10 |
| AWS multi-AZ architecture documentation | Infrastructure team Confluence | 2026-02-20 |
| AWS shared responsibility model acknowledgment | Security team documentation | 2025-12-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | Approaching Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No documented environmental risk assessment for Redwood City DC | Environmental risks not formally identified and prioritized | Conduct facility environmental risk assessment | Tigan Wang | 2026-06-30 |
| Fire suppression testing/inspection records not reviewed | Cannot confirm system reliability | Obtain and review fire suppression inspection records; establish annual review | Tigan Wang | 2026-05-15 |
| Flood detection sensors not confirmed | Water intrusion may go undetected | Verify flood sensor deployment or install sensors in data center | Tigan Wang | 2026-07-31 |
