# PR.AA-03 Ex2: Device Authentication and Network Access Control

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-3, IA-3(1), AC-17

## Implementation Example

> Authenticating devices before granting network access using certificate-based authentication, 802.1X, or device compliance checks to ensure only authorized and healthy devices connect to organizational networks

## Alma Security Implementation

Alma Security authenticates devices on the Redwood City office network using 802.1X port-based authentication through the Palo Alto firewall, with domain-joined devices presenting machine certificates for wired access and being placed on the trusted VLAN. SentinelOne endpoint agents provide secondary device health attestation, reporting OS patch level, agent health, and threat detection status for compliance monitoring. In AWS, EC2 instances and EKS worker nodes authenticate using IAM instance profiles with temporary credentials, and Kubernetes pods use projected service account tokens with audience and expiration constraints. CI/CD pipeline scanning enforces that no static credentials are embedded in container images.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| 802.1X configuration on Palo Alto firewall | Palo Alto Panorama > Network Policies | 2026-01-20 |
| Network segmentation diagram (VLAN map) | IT > Network Documentation | 2026-02-01 |
| SentinelOne device compliance report | SentinelOne Console > Device Health | 2026-03-10 |
| AWS IAM instance profile inventory | AWS IAM > Roles > Instance Profiles | 2026-03-01 |
| CI/CD static credential scanning config | GitHub Actions > Security Workflows | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No automated network quarantine for non-compliant SentinelOne devices | Non-compliant devices remain on trusted network despite known health issues | Integrate SentinelOne compliance API with Palo Alto firewall for automated quarantine of unhealthy devices | Nadia Khan | 2026-08-31 |
| VPN tunnel does not perform per-device authentication | Any device on the trusted office network can reach AWS resources through the VPN | Implement per-device certificate authentication for VPN access to AWS; evaluate Zero Trust Network Access (ZTNA) | Tigan Wang | 2026-09-30 |
| BYOD devices on guest network not inventoried | Cannot track or manage personal devices that may access corporate SaaS apps | Implement device registration for BYOD accessing corporate applications; enforce conditional access policies | Chris Magann | 2026-07-31 |
