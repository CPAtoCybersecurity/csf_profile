# PR.IR-03_Ex2: Disaster Recovery Planning and Testing

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-04, CP-06, CP-07, CP-09, CP-10, IR-04

## Implementation Example

> Ex2: Disaster recovery plans are developed, maintained, and periodically tested to ensure that technology infrastructure and services can be restored within defined recovery objectives following a disruptive event.

## Alma Security Implementation

Alma's disaster recovery plan is in development as part of the Cloud Security Optimization project ($100K budget). As of Q1 2026, no formal approved DR plan exists -- RTO/RPO have not been defined, and backup alignment with recovery objectives is unverified. Multi-AZ architecture and Kubernetes redundancy provide component-level resilience, but no documented strategy covers region-level outages, ransomware, or full data center loss.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Cloud Security Optimization project charter | Project management system | 2026-03-01 |
| DR plan draft (in progress) | Infrastructure team documentation | 2026-03-10 |
| Backup configuration documentation | AWS Backup / infrastructure team | 2026-02-15 |
| Failover testing results (component-level) | Infrastructure team documentation | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 6 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No approved DR plan | Organization cannot execute coordinated recovery from major disruption | Complete DR plan development as part of Cloud Security Optimization project | Tigan Wang | 2026-07-31 |
| RTO/RPO not defined for critical systems | Recovery priorities unclear; no basis for measuring DR readiness | Define and gain business stakeholder agreement on RTO/RPO for all Tier 1 systems | Tigan Wang | 2026-06-15 |
| No DR tabletop exercise conducted | DR procedures untested at the coordination level | Conduct DR tabletop exercise after plan completion | Tigan Wang | 2026-09-30 |
| Backup alignment with RPO unverified | Backup frequency may not meet business requirements | Validate backup schedules against defined RPOs once established | Tigan Wang | 2026-08-31 |
