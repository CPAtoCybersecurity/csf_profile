# PR.IR-01_Ex4: Network Access Control for Device Connectivity

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex4: Network access control (NAC) mechanisms are used to verify device identity and posture before granting connectivity to organizational networks.

## Alma Security Implementation

Alma Security does not currently operate a dedicated Network Access Control (NAC) solution for pre-admission device posture assessment on the corporate network. Device connectivity to the Redwood City on-premises network relies on physical access controls (badge access to the office and data center) and the Palo Alto firewall's zone-based policies, but there is no automated mechanism to verify device health, patch status, or compliance posture before granting network access.

In the AWS Kubernetes environment, access control for workload connectivity is managed through Kubernetes network policies and AWS Security Groups rather than traditional NAC. Pod-to-pod communication is governed by namespace-level policies, and external access to the cluster passes through defined ingress controllers. Service mesh capabilities, if implemented, would provide mutual TLS authentication between services, but this has not been confirmed as part of the current architecture.

The lack of NAC on the corporate network means that a compromised or non-compliant device could connect and access internal resources without posture verification. This is a particularly relevant gap given the Windows Server 2012 R2 fileserver that remains on the network — older systems increase the risk surface for devices sharing the same network segment. For a 300-person SaaS company, the absence of NAC represents a moderate risk that increases as the organization grows and device diversity expands.

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
