# PR.IR-01_Ex3: Network Integrity Monitoring

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex3: Network integrity is monitored to detect unauthorized changes, rogue devices, and anomalous traffic patterns that could indicate compromise or misconfiguration.

## Alma Security Implementation

Alma Security has deployed two primary network monitoring capabilities: VPC Flow Logs across AWS production VPCs and DNS query logging for cloud-hosted services. VPC Flow Logs capture metadata for all network traffic (accepted and rejected) flowing through VPC network interfaces, providing visibility into communication patterns, anomalous traffic volumes, and rejected connection attempts. DNS query logging captures resolution requests, which can indicate command-and-control communication, data exfiltration via DNS tunneling, or connections to known malicious domains.

These logging capabilities feed into the centralized logging infrastructure where the Detection and Response team can investigate network anomalies. However, the current implementation is primarily detective rather than preventive — the logs support investigation and forensics but do not automatically block or quarantine suspicious traffic in real time. Network-based intrusion detection capabilities are limited to what the Palo Alto firewall provides at the on-premises perimeter; there is no dedicated network IDS/IPS for east-west traffic within the AWS environment.

The absence of a WAF further limits the organization's ability to monitor and filter application-layer network traffic for integrity violations. While the existing logging provides a foundation for network visibility, the monitoring is reactive and lacks automated correlation of network events with threat intelligence feeds.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| VPC Flow Log configuration | AWS CloudWatch Logs | 2026-02-20 |
| DNS query logging configuration | AWS Route 53 / CloudWatch | 2026-02-20 |
| Palo Alto IPS configuration | Firewall management console | 2026-01-10 |
| Network monitoring alert rules | SIEM / centralized logging platform | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Approaching Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No network IDS/IPS for AWS east-west traffic | Lateral movement within VPC may go undetected | Evaluate AWS-native or third-party network detection for VPC traffic | Nadia Khan | 2026-07-31 |
| No automated threat intelligence correlation with network logs | Known malicious IPs/domains not automatically flagged | Integrate threat intelligence feeds with VPC Flow Log and DNS log analysis | Nadia Khan | 2026-06-30 |
| Limited real-time response to network anomalies | Detection is reactive; no automated containment for network events | Define automated response playbooks for high-confidence network indicators | Nadia Khan | 2026-08-31 |
