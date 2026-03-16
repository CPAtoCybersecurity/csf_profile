# ID.AM-02: Software and Service Inventory Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve <steve@almasecurity.com>
**Observation Date:** 2026-03-15
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

ServiceNow CMDB tracks licensed software with renewal dates. AWS Systems Manager collects software inventory across EC2 fleet. Endpoint management agents provide installed application visibility.

### Gaps

No automated SaaS discovery tool deployed to identify shadow IT. Container runtime inventory not automated. Open-source software components not tracked in a software bill of materials (SBOM).

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 6 |

## Evidence Reviewed

- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Deploy SaaS discovery tool to identify shadow IT applications | High | IT Operations |
| 2 | Implement container runtime inventory automation | Medium | Cloud Platform |
| 3 | Establish SBOM tracking for open-source software components | Medium | Engineering |
| 4 | Integrate software inventory reconciliation into monthly cadence | Low | IT Operations |
