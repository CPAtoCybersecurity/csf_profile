# PR.AA-06 Ex1: Physical Access Control Systems and Badge Management

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-8

## Implementation Example

> Implementing physical access control systems (badge readers, biometric scanners, mantraps) to manage and enforce facility access based on role, clearance level, and area sensitivity classification

## Alma Security Implementation

Alma Security manages physical access at the Redwood City headquarters through an electronic badge access control system (ACS) integrated with the HR onboarding workflow in Workday. A physical access matrix maps 8 access zones to 6 role categories, with standard employees receiving building and floor access while restricted areas (server room, security operations) require additional zone-owner authorization. The server room enforces badge-plus-PIN two-factor authentication, and security cameras cover all entry points with 90-day footage retention. Badge deactivation is included in the ServiceNow offboarding checklist, with simultaneous execution alongside Active Directory account disablement for involuntary terminations.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Physical access control system configuration | ACS Management Console | 2026-02-15 |
| Physical access zone map and classification | Facilities > Physical Security Docs | 2026-01-20 |
| Badge access matrix (roles to zones) | Facilities > Access Matrix | 2026-01-20 |
| Offboarding badge deactivation checklist | ServiceNow > Offboarding Workflow | 2026-02-01 |
| Security camera coverage map and retention policy | Facilities > Camera System Docs | 2026-01-15 |
| Badge deactivation audit (Q4 2025 departures) | Facilities > Quarterly Badge Audit | 2026-01-31 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 4 badges remained active after employee departure (delayed deactivation) | Former employees retained physical access to the facility; potential unauthorized entry risk | Automate badge deactivation through ServiceNow offboarding workflow; eliminate manual facilities handoff | Gerry | 2026-05-31 |
| No mantrap or tailgating prevention at main building entrance | Unauthorized persons could tailgate through the main entrance behind a badge-holder | Evaluate anti-tailgating solutions (turnstiles or optical sensors) for main entrance; implement awareness training | Chris Magann | 2026-09-30 |
| Badge access logs not integrated with SIEM | Physical access anomalies (after-hours, repeated failed attempts) not correlated with logical access events | Forward ACS logs to SIEM for correlation with logical access events and anomaly alerting | Nadia Khan | 2026-07-31 |
