# PR.AA-06 Ex3: Data Center Physical Security and Environmental Controls

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-9, PE-10, PE-11, PE-12, PE-13, PE-14

## Implementation Example

> Implementing enhanced physical security and environmental controls for data center and server room facilities, including multi-factor physical authentication, environmental monitoring, surveillance, and access logging commensurate with the criticality of hosted assets

## Alma Security Implementation

Alma Security's server room at the Redwood City office houses the Windows Domain Controller, network switching infrastructure, and Palo Alto firewall appliances, designated as a high-security zone with badge-plus-PIN authentication restricted to 11 authorized individuals reviewed monthly. A dedicated security camera monitors the entrance and interior rack area with 90-day tamper-evident footage retention, and the ACS logs all entry/exit events with badge ID, timestamp, and PIN verification status. Environmental monitoring covers temperature (80F/27C threshold), humidity (40-60% RH), water leak detection, and smoke detection, with a dedicated UPS (30-minute runtime) and automatic transfer to backup diesel generator. AWS data center physical security for production Kubernetes workloads is validated annually through the AWS SOC 2 Type II report review.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Server room access authorization list | Facilities > Server Room Access | 2026-03-01 |
| Server room badge-plus-PIN access logs (last 30 days) | ACS Management Console > Server Room Zone | 2026-03-10 |
| Security camera configuration and retention policy | Facilities > Camera System > Server Room | 2026-01-15 |
| Environmental monitoring configuration and alert thresholds | Facilities > Environmental Monitoring System | 2026-01-15 |
| UPS and generator test results | Facilities > Quarterly Environmental Tests > Q1 2026 | 2026-01-31 |
| AWS SOC 2 Type II report review notes | Security Team > Vendor Assessments > AWS | 2025-11-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 5 | On Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Server room camera footage not integrated with ACS badge logs | Cannot automatically correlate physical entry events with video for investigation; requires manual cross-reference | Integrate camera system timestamps with ACS badge events for automated video retrieval on access events | Chris Magann | 2026-08-31 |
| No biometric authentication for server room (badge-plus-PIN only) | PIN can be shared or observed; badge-plus-PIN provides lower assurance than badge-plus-biometric | Evaluate biometric reader (fingerprint or palm) for server room entry as part of next physical security upgrade cycle | Gerry | 2027-01-31 |
| Backup generator fuel supply not monitored remotely | Extended power outage beyond fuel capacity could cause uncontrolled server shutdown | Implement remote fuel level monitoring with automated alert at 50% and 25% capacity thresholds | Tigan Wang | 2026-06-30 |
