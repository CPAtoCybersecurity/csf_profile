# PR.AA-06 Ex3: Data Center Physical Security and Environmental Controls

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-9, PE-10, PE-11, PE-12, PE-13, PE-14

## Implementation Example

> Implementing enhanced physical security and environmental controls for data center and server room facilities, including multi-factor physical authentication, environmental monitoring, surveillance, and access logging commensurate with the criticality of hosted assets

## Alma Security Implementation

The Redwood City office server room houses Alma Security's on-premises Windows Domain Controller, network switching infrastructure, and the Palo Alto firewall appliances that manage perimeter security and site-to-site VPN connectivity to AWS. Given the criticality of these assets to the hybrid infrastructure, the server room is designated as a high-security zone with enhanced physical controls that exceed the standard office badge-only access.

Server room entry requires badge-plus-PIN authentication at the door, and access is restricted to 11 authorized individuals: 4 infrastructure engineers, 3 network engineers, 2 security team members (Nadia Khan and one Detection and Response analyst), the IT Manager, and Gerry (CISO). Access authorizations are reviewed monthly as part of the privileged access review cycle. A dedicated security camera monitors the server room entrance and the interior rack area, with footage retained for 90 days in a tamper-evident recording system. The access control system logs all entry and exit events with badge ID, timestamp, and PIN verification status.

Environmental monitoring includes temperature sensors (alert threshold: 80F/27C), humidity sensors (alert range: 40-60% RH), water leak detection under the raised floor, and smoke detection tied to the building fire suppression system. Environmental alerts are sent to the infrastructure team's on-call rotation and the facilities manager. The server room has a dedicated UPS providing 30 minutes of battery runtime and an automatic transfer switch to the building's backup diesel generator. Quarterly environmental control tests are conducted by the facilities team, with the most recent test completed in January 2026.

AWS data center physical security for the production workloads running in Kubernetes is inherited through the shared responsibility model. Alma reviews the AWS SOC 2 Type II report annually to verify that AWS data center physical controls meet or exceed Alma's security requirements. The most recent AWS SOC 2 report review was completed in November 2025, with no concerns identified regarding physical security controls.

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
