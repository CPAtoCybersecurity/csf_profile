# PR.AA-06 Ex1: Physical Access Control Systems and Badge Management

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-8

## Implementation Example

> Implementing physical access control systems (badge readers, biometric scanners, mantraps) to manage and enforce facility access based on role, clearance level, and area sensitivity classification

## Alma Security Implementation

Alma Security's Redwood City headquarters uses an electronic badge access control system (ACS) that manages physical entry to the building, individual floors, and restricted areas. The badge system integrates with the HR onboarding workflow: when a new employee's Workday record is activated, the facilities team provisions a badge through the ACS management console with access permissions based on the employee's department and role. Standard employees receive access to the main building entrance, their assigned floor, common areas, and conference rooms. Restricted areas including the server room housing the Windows Domain Controller and the security operations area require additional badge authorization approved by the area owner.

Badge access levels are defined in a physical access matrix maintained by the facilities team. The matrix maps 8 access zones to 6 role categories, ranging from "General Employee" (building and floor access only) to "Infrastructure Admin" (all zones including server room and network closets). The server room requires badge-plus-PIN authentication, providing a physical two-factor requirement for the most sensitive on-premises infrastructure. Security cameras cover all entry points and the server room entrance, with footage retained for 90 days.

Badge deactivation is included in the employee offboarding checklist in ServiceNow. For involuntary terminations, badge deactivation is executed simultaneously with Active Directory account disablement. The Q1 2026 review identified that 4 badges remained active for employees who departed in Q4 2025, all voluntary terminations where the offboarding process completed within the required 5-business-day window but badge deactivation was delayed due to a manual handoff between IT and facilities. This finding prompted a remediation action to automate badge deactivation through the ServiceNow workflow.

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
