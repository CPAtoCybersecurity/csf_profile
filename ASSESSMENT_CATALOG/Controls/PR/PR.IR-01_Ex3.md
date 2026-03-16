# PR.IR-01_Ex3: Network Integrity Monitoring

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex3: Network integrity is monitored to detect unauthorized changes, rogue devices, and anomalous traffic patterns that could indicate compromise or misconfiguration.

## Alma Security Implementation

Alma monitors network integrity through VPC Flow Logs (all traffic metadata) and DNS query logging across AWS production VPCs, feeding into the centralized logging infrastructure for investigation. The Palo Alto firewall provides IPS at the on-premises perimeter, but there is no dedicated IDS/IPS for east-west traffic within AWS. Monitoring is reactive -- logs support investigation but do not automatically block suspicious traffic, and no automated threat intelligence correlation is in place.

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
