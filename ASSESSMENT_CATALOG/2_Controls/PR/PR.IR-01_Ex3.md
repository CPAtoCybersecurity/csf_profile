# PR.IR-01_Ex3: Network Integrity Monitoring

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex3: Network integrity is monitored to detect unauthorized changes, rogue devices, and anomalous traffic patterns that could indicate compromise or misconfiguration.

## Alma Security Implementation

Alma monitors network integrity through VPC Flow Logs (all traffic metadata) and DNS query logging across AWS production VPCs, feeding into the centralized logging infrastructure for investigation. The Palo Alto firewall provides IPS at the on-premises perimeter, but there is no dedicated IDS/IPS for east-west traffic within AWS. Monitoring is reactive -- logs support investigation but do not automatically block suspicious traffic, and no automated threat intelligence correlation is in place.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
