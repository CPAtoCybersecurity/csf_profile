# GV.OC-05: External Dependencies — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-05
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed external dependency inventory, single point of failure analysis |
| Interview | Yes | CTO, Security Engineering Lead |
| Test | No | N/A |

## Findings

### Strengths

- External dependency inventory maintained in ServiceNow covering cloud providers, SaaS tools, and critical vendors
- Single points of failure identified for infrastructure dependencies (AWS, DNS, CDN)
- Dependencies communicated to engineering through architecture documentation

### Gaps

- Dependency inventory does not include all indirect dependencies (sub-processors of Tier 1 vendors)
- Failure mode analysis not completed for three recently onboarded critical SaaS tools

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

**Scoring rationale:** The 5 places this control at the floor of the Minimally Acceptable band — the process runs consistently with known, tracked exceptions, per the 5 anchor. The dependency inventory is maintained in ServiceNow across cloud providers, SaaS tools, and critical vendors, and single points of failure are identified for AWS, DNS, and CDN. It does not earn Optimized (6.0) because scope coverage is incomplete rather than merely flawed at the margins: indirect dependencies (sub-processors of Tier 1 vendors) are absent from the inventory, and failure mode analysis has not been completed for three recently onboarded critical SaaS tools — so there is no full-scope measurement for an owner to review and act on.

## Evidence Reviewed

- External dependency inventory in ServiceNow
- Architecture diagrams with dependency mapping
- Single point of failure analysis document
- Vendor sub-processor disclosures

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Expand dependency inventory to include vendor sub-processors | Medium | Security GRC Lead |
| 2 | Complete failure mode analysis for recent SaaS additions | High | Security Engineering Lead |

## Related

- **Test Procedure:** [GV.OC-05 Test Procedures](../../3_Test_Procedures/GV/GV.OC-05.md)
- **Controls:** [GV.OC-05_Ex1](../../2_Controls/GV/GV.OC-05_Ex1.md), [GV.OC-05_Ex2](../../2_Controls/GV/GV.OC-05_Ex2.md)
