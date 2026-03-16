# DE.AE-07 Ex3: Vulnerability Disclosure Analysis

**Subcategory:** DE.AE-07 — Cyber threat intelligence and other contextual information are integrated into the analysis

**NIST SP 800-53 Ref:** PM-16, RA-03, RA-10

## Implementation Example

> Rapidly acquire and analyze vulnerability disclosures for the organization's technologies from suppliers, CERTs, ISACs, and public sources

## Alma Security Implementation

Nadia Khan's D&R team monitors CISA KEV catalog updates, AWS Security Bulletins, and SaaS-sector ISAC advisories for vulnerability disclosures affecting Alma's technology stack. Critical vulnerability disclosures trigger immediate assessment against the asset inventory to determine exposure scope. The vulnerability scan summary report is updated weekly with newly disclosed CVEs relevant to Alma's deployed software, and findings are cross-referenced with GuardDuty and SentinelOne detections for active exploitation indicators.

## Artifacts

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
