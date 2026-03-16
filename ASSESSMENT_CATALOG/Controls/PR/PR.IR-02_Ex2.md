# PR.IR-02_Ex2: Adequate Environmental Controls

**Subcategory:** PR.IR-02 — The organization's technology assets are protected from environmental threats

**NIST SP 800-53 Ref:** CP-02, PE-09, PE-10, PE-11, PE-12, PE-13, PE-14, PE-15, PE-17, PE-18, PE-23

## Implementation Example

> Ex2: Adequate environmental controls (e.g., temperature, humidity, power conditioning) are maintained and monitored to ensure technology assets operate within manufacturer-specified parameters.

## Alma Security Implementation

The Redwood City data center operates HVAC monitoring that tracks ambient temperature and humidity within the server environment. This monitoring is intended to ensure that servers, networking equipment, and storage arrays operate within manufacturer-recommended environmental ranges — typically 64-80 degrees F (18-27 degrees C) and 40-60% relative humidity. The HVAC system provides cooling capacity for the current equipment load, and monitoring alerts are configured to notify operations personnel when conditions approach threshold boundaries.

Power conditioning at the Redwood City facility includes uninterruptible power supply (UPS) systems that provide battery backup during utility power interruptions. The UPS systems condition incoming power to protect equipment from voltage sags, surges, and frequency variations. However, the documentation around UPS capacity planning, battery replacement schedules, and load testing is limited. It is unclear whether generator backup power is available for extended outages.

For AWS-hosted infrastructure, Amazon maintains environmental controls within their data centers as part of their responsibility under the shared responsibility model. Alma's infrastructure team does not need to manage temperature, humidity, or power conditioning for cloud workloads, but should maintain awareness of AWS service health and regional capacity. The primary gap is the lack of formalized environmental monitoring reporting — while HVAC monitoring exists, there is no evidence of periodic review of environmental trends, capacity planning for cooling as equipment density changes, or integration of environmental monitoring with the IT incident management process.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| HVAC monitoring dashboards | Building management system | 2026-02-10 |
| UPS configuration documentation | Redwood City DC facilities records | 2025-11-15 |
| Temperature/humidity alert thresholds | HVAC monitoring system | 2026-02-10 |
| AWS service health monitoring | AWS Health Dashboard | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| UPS capacity planning and testing documentation gaps | Cannot confirm adequate power backup for current load | Document UPS capacity, establish load testing schedule, verify battery replacement dates | Tigan Wang | 2026-06-30 |
| No environmental trend reporting | Gradual degradation or capacity issues not proactively identified | Implement monthly environmental monitoring reports with trend analysis | Tigan Wang | 2026-07-31 |
| Environmental monitoring not integrated with IT incident management | Environmental events may not trigger appropriate IT response | Create escalation procedures linking environmental alerts to IT incident management | Tigan Wang | 2026-05-31 |
