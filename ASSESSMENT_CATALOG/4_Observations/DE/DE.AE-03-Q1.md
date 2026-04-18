# DE.AE-03: Information Correlation from Multiple Sources — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed GuardDuty multi-source correlation configuration, CloudTrail and VPC Flow Log integration settings, SentinelOne telemetry export to centralized logging |
| Interview | Yes | Interviewed Nadia Khan on cross-source correlation workflows and detection engineering; SOC analyst on daily correlation review process |
| Test | Yes | Traced a simulated lateral movement event across CloudTrail, VPC Flow Logs, and SentinelOne to verify correlation linkage; validated GuardDuty multi-signal finding generation |

---

## Findings

Alma Security correlates information from multiple detection sources through AWS GuardDuty, which natively ingests CloudTrail management events, VPC Flow Logs, and DNS query logs to generate correlated findings. SentinelOne endpoint telemetry provides host-level correlation of process execution, file system changes, and network connections. However, correlation between cloud-native sources (GuardDuty) and endpoint sources (SentinelOne) remains manual -- the SOC team must pivot between consoles to link related events. There is no unified SIEM platform that aggregates all sources into a single correlation engine.

During testing, a simulated lateral movement scenario was detectable across individual sources but required manual analyst effort to correlate the CloudTrail API calls with corresponding VPC Flow Log entries and SentinelOne process telemetry. The lack of automated cross-platform correlation increases mean time to investigate for complex incidents.

### Strengths

- GuardDuty provides automated multi-signal correlation across CloudTrail, VPC Flow Logs, and DNS
- SentinelOne correlates endpoint-level events (process, file, network) within its own telemetry
- CloudTrail centralized to a single S3 bucket across all AWS accounts enabling organization-wide visibility
- SOC analysts trained on manual cross-platform pivot techniques

### Gaps

- No unified SIEM to correlate cloud-native and endpoint telemetry in a single platform
- Cross-source correlation is manual and analyst-dependent, increasing investigation time
- Threat intelligence feed integration limited to GuardDuty built-in threat lists
- No automated correlation with physical access or identity management event sources

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |
| Previous Quarter | N/A |
| Trend | N/A (first assessment of this subcategory) |

**Scoring rationale:** Score of 4 (Some Security) reflects that within-platform correlation is automated and effective (GuardDuty multi-signal, SentinelOne Deep Visibility), but cross-platform correlation between cloud-native and endpoint sources is entirely manual and analyst-dependent. The absence of a unified SIEM or automated cross-source correlation prevents consistent, timely correlation for multi-vector incidents. Score will improve toward the target of 6 when the custom correlation scripts are deployed and cross-platform correlation becomes semi-automated.

---

## Evidence Reviewed

- GuardDuty multi-source finding configuration
- CloudTrail centralized logging S3 bucket configuration
- VPC Flow Log enablement across all VPCs
- SentinelOne telemetry export settings
- Simulated lateral movement correlation trace documentation
- SOC analyst cross-platform investigation runbook

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Deploy a unified SIEM platform to aggregate and auto-correlate GuardDuty findings, CloudTrail, VPC Flow Logs, and SentinelOne telemetry | High | Nadia Khan |
| 2 | Integrate third-party threat intelligence feeds beyond GuardDuty built-in lists | Medium | Nadia Khan |
| 3 | Develop automated correlation rules for common multi-source attack patterns | Medium | Nadia Khan |
| 4 | Establish normalized event taxonomy across all detection sources to enable consistent correlation | Low | Nadia Khan |

## Related

- **Test Procedure:** [DE.AE-03 Test Procedures](../../3_Test_Procedures/DE/DE.AE-03.md)
- **Controls:** [DE.AE-03_Ex1](../../2_Controls/DE/DE.AE-03_Ex1.md), [DE.AE-03_Ex2](../../2_Controls/DE/DE.AE-03_Ex2.md), [DE.AE-03_Ex3](../../2_Controls/DE/DE.AE-03_Ex3.md)
- **Artifacts:** [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
