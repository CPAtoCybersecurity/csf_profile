# PR.IR-02_Ex2: Adequate Environmental Controls

**Subcategory:** PR.IR-02 — The organization's technology assets are protected from environmental threats

**NIST SP 800-53 Ref:** CP-02, PE-09, PE-10, PE-11, PE-12, PE-13, PE-14, PE-15, PE-17, PE-18, PE-23

## Implementation Example

> Ex2: Adequate environmental controls (e.g., temperature, humidity, power conditioning) are maintained and monitored to ensure technology assets operate within manufacturer-specified parameters.

## Alma Security Implementation

Alma operates HVAC monitoring at the Redwood City data center tracking temperature and humidity within manufacturer-specified ranges, with UPS systems providing battery backup and power conditioning. AWS cloud workloads inherit Amazon's environmental controls under the shared responsibility model. UPS capacity planning, battery replacement schedules, and load testing documentation is limited, and environmental monitoring is not integrated with the IT incident management process.

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
