# GV.OC-05: External Dependencies — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF
**Assessor:** Steve <steve@almasecurity.com>
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

## Evidence Reviewed

- External dependency inventory in ServiceNow
- Architecture diagrams with dependency mapping
- Single point of failure analysis document
- Vendor sub-processor disclosures

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Expand dependency inventory to include vendor sub-processors | Medium | GRC Manager |
| 2 | Complete failure mode analysis for recent SaaS additions | High | Security Engineering Lead |
