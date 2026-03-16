# PR.IR-01_Ex4: Network Access Control for Device Connectivity

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex4: Network access control (NAC) mechanisms are used to verify device identity and posture before granting connectivity to organizational networks.

## Alma Security Implementation

Alma does not operate a dedicated NAC solution. On-premises network access relies on physical badge access and Palo Alto zone-based policies with no automated device posture assessment. In the Kubernetes environment, workload connectivity is governed by network policies and Security Groups rather than traditional NAC. No mechanism exists to verify device health, patch status, or compliance before granting network access.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Palo Alto zone-based access policies | Firewall management console | 2026-01-10 |
| Kubernetes network policies | GitOps repository | 2026-02-28 |
| Physical access controls documentation | Facilities management | 2026-01-15 |
| Endpoint management inventory | IT asset management system | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No NAC solution deployed | Unmanaged or non-compliant devices can access corporate network | Evaluate and select NAC solution; include in FY2027 budget planning | Tigan Wang | 2026-09-30 |
| No device posture assessment before network access | Compromised devices not detected at connection time | Implement endpoint compliance checks as part of NAC or MDM integration | Tigan Wang | 2026-12-31 |
| No rogue device detection capability | Unauthorized devices on the network go unnoticed | Deploy rogue device detection as part of NAC rollout or standalone 802.1X | Tigan Wang | 2026-12-31 |
