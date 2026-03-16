# PR.AA-03 Ex2: Device Authentication and Network Access Control

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-3, IA-3(1), AC-17

## Implementation Example

> Authenticating devices before granting network access using certificate-based authentication, 802.1X, or device compliance checks to ensure only authorized and healthy devices connect to organizational networks

## Alma Security Implementation

Alma Security authenticates devices on the Redwood City office network using 802.1X port-based authentication managed through the Palo Alto firewall infrastructure. Corporate laptops and workstations are domain-joined to the Windows Domain Controller and present machine certificates for wired network authentication. The Palo Alto firewall enforces network segmentation that places authenticated corporate devices on the trusted VLAN with access to internal resources, while unauthenticated or personal devices are relegated to a guest VLAN with internet-only access.

SentinelOne endpoint agents serve as a secondary device health attestation layer. The SentinelOne management console reports device compliance status including OS patch level, agent health, and threat detection status. Devices flagged as non-compliant by SentinelOne (e.g., disabled real-time protection, critical unpatched vulnerabilities) are flagged in the weekly vulnerability report reviewed by Chris Magann's team, though automated network quarantine based on SentinelOne compliance status is not yet implemented.

In the AWS environment, EC2 instances and EKS worker nodes authenticate to AWS services using IAM instance profiles and roles, providing temporary credentials that are automatically rotated. Kubernetes pods authenticate using projected service account tokens with audience and expiration constraints. The Cloud Platform team enforces that no static credentials are baked into container images, verified through CI/CD pipeline scanning. However, the on-premises to cloud connectivity through the site-to-site VPN does not perform device-level authentication beyond the VPN tunnel endpoints, creating a gap where any device on the trusted office network can traverse the VPN to AWS resources.

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
