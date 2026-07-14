# PR.PS-03: Hardware Maintenance and Lifecycle - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed ServiceNow CMDB hardware inventory, warranty tracking records, laptop replacement cycle documentation, and hardware disposal procedures |
| Interview | Yes | Interviewed Tigan Wang (infrastructure lead) on hardware lifecycle management practices, cloud vs. on-premises strategy, and disposal procedures |
| Test | Yes | Cross-referenced CMDB records against SentinelOne endpoint inventory and AWS resource tags; identified discrepancies in asset tracking |

---

## Findings

### Strengths

- Laptop replacement follows a defined 4-year lifecycle with automated ServiceNow workflow triggers, covering approximately 300 endpoints
- ServiceNow CMDB tracks on-premises hardware with asset tags, serial numbers, warranty dates, and ownership
- AWS resource tagging standards provide cloud infrastructure tracking with Config-enforced tagging compliance
- SentinelOne provides real-time hardware inventory data for all managed endpoints
- Hardware disposal follows NIST SP 800-88 guidelines with certificates of destruction retained

### Gaps

- No unified asset inventory dashboard combining on-premises and cloud hardware; teams use separate views requiring manual correlation
- CMDB updates lag for asset transfers, relocations, and returns, resulting in stale inventory records identified during reconciliation
- Windows Server 2012 R2 fileserver runs on out-of-warranty Dell hardware with no vendor support, compounding the software EOL risk with hardware failure risk
- No standardized lifecycle replacement policy for server and infrastructure hardware; replacement is reactive rather than planned
- Network infrastructure (switches, access points) has minimal lifecycle tracking in CMDB
- Hardware disposal procedure documentation has not been updated since June 2024
- No automated EOL alerting based on vendor lifecycle data; tracking depends on institutional knowledge

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** Hardware lifecycle management scores 3, in the Some Security band: a process is defined and works well for one asset class — the ~300 laptops follow an automated 4-year ServiceNow replacement cycle, and disposal follows NIST SP 800-88 with certificates of destruction — but execution beyond endpoints is unreliable. Server replacement is reactive with no lifecycle policy, the 2012 R2 fileserver runs on out-of-warranty Dell hardware, CMDB records go stale on transfers and returns, network switches and access points are barely tracked, and the disposal procedure has not been updated since June 2024. Minimally Acceptable (5.0) would require the lifecycle discipline that exists for laptops to execute consistently across servers and network infrastructure too — currently the majority of the non-endpoint estate lacks it.

---

## Evidence Reviewed

- ServiceNow CMDB hardware inventory export
- SentinelOne endpoint hardware inventory report
- AWS resource tagging compliance report (AWS Config)
- Quarterly physical inventory reconciliation report (Q4 2025)
- Laptop replacement lifecycle policy and ServiceNow workflow
- Windows 2012 R2 fileserver hardware warranty documentation (expired)
- Hardware disposal and media sanitization procedure (dated June 2024)
- Sample certificates of destruction for retired hardware

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Replace Windows 2012 R2 fileserver hardware as part of Q3 2026 migration; combined hardware and software failure risk is critical | Critical | Chris Magann |
| 2 | Implement unified asset management dashboard combining on-premises CMDB and AWS resources | High | Tigan Wang |
| 3 | Develop standardized lifecycle replacement policy for server and infrastructure hardware | High | Tigan Wang |
| 4 | Implement automated hardware lifecycle alerting in ServiceNow based on vendor EOL data | Medium | Tigan Wang |
| 5 | Update hardware disposal procedures to current state and audit disposal vendor practices | Medium | Chris Magann |
| 6 | Extend CMDB lifecycle tracking to network infrastructure (switches, access points) | Low | Tigan Wang |

## Related

- **Test Procedure:** [PR.PS-03 Test Procedures](../../3_Test_Procedures/PR/PR.PS-03.md)
- **Controls:** [PR.PS-03_Ex1](../../2_Controls/PR/PR.PS-03_Ex1.md), [PR.PS-03_Ex2](../../2_Controls/PR/PR.PS-03_Ex2.md), [PR.PS-03_Ex3](../../2_Controls/PR/PR.PS-03_Ex3.md)
