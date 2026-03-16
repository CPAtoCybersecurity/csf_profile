# DE.CM-01: Network and Network Services Monitoring — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed VPC Flow Log configuration across all AWS accounts, GuardDuty network monitoring findings, Palo Alto firewall logging and alerting rules, DNS query log integration |
| Interview | Yes | Interviewed Nadia Khan on network monitoring strategy and coverage assessment; network engineer on VPC Flow Log and firewall monitoring configuration |
| Test | Yes | Verified VPC Flow Logs enabled on all production VPCs; tested GuardDuty network-based detection by simulating unauthorized port scan; validated Palo Alto logging captures east-west traffic |

---

## Findings

Alma Security monitors networks through VPC Flow Logs enabled across all production AWS VPCs, GuardDuty network-based threat detection, Palo Alto firewall logging for on-premises and hybrid network segments, and DNS query log analysis. GuardDuty monitors VPC Flow Logs and DNS logs to detect network anomalies including port scanning, unusual data transfer volumes, and communication with known malicious infrastructure.

VPC Flow Logs are centralized to a single S3 bucket and retained for 90 days. Palo Alto firewall logs capture north-south and east-west traffic with application-level visibility. Testing confirmed that VPC Flow Logs are enabled on all 12 production VPCs and that GuardDuty correctly detected a simulated port scan within 15 minutes. However, monitoring of non-production VPCs (development, staging) is inconsistent, with Flow Logs disabled on 3 of 5 non-production VPCs. Network baseline comparison is not automated; deviation detection relies on GuardDuty's anomaly models rather than organization-specific baselines.

### Strengths

- VPC Flow Logs enabled and centralized across all 12 production VPCs
- GuardDuty provides automated network anomaly detection with DNS and Flow Log analysis
- Palo Alto firewall provides application-layer visibility for on-premises network segments
- Network-based threat detection validated through simulated port scan (15-minute detection)

### Gaps

- VPC Flow Logs disabled on 3 of 5 non-production VPCs, creating blind spots for pre-production attacks
- No organization-specific network baselines for deviation comparison
- Wireless network monitoring limited to corporate office; no rogue AP detection capability
- No automated network flow baseline comparison beyond GuardDuty anomaly models

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- VPC Flow Log enablement status across all AWS accounts
- GuardDuty network monitoring configuration and recent findings
- Palo Alto firewall logging configuration and sample logs
- DNS query log integration settings
- Simulated port scan detection test results
- Non-production VPC Flow Log gap documentation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Enable VPC Flow Logs on all non-production VPCs to eliminate monitoring blind spots | High | Nadia Khan |
| 2 | Implement network flow baselining to detect deviations specific to Alma's traffic patterns | Medium | Nadia Khan |
| 3 | Deploy wireless intrusion detection or rogue AP scanning for corporate office network | Medium | Nadia Khan |
| 4 | Extend VPC Flow Log retention to 365 days to support long-duration investigation needs | Low | Nadia Khan |
