# GV.SC-10: Post-Relationship Provisions — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF
**Assessor:** Steve <steve@almasecurity.com>
**Observation Date:** 2026-03-15
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed offboarding procedures, EOL tracker, access revocation records, data destruction certs |
| Interview | Yes | GRC Manager, Identity Management Lead |
| Test | Yes | Verified access revocation and data destruction for 2 recently terminated vendor relationships |

## Findings

### Strengths

- Vendor offboarding procedures documented for both normal and adverse terminations
- EOL tracker maintained in ServiceNow with 12-month advance planning window
- Access deactivation workflow triggers within 24 hours of termination notification
- Data destruction certification required within 30 days of contract end

### Gaps

- 1 of 2 sampled terminations had orphaned API key revoked 5 days after termination (missed in initial sweep)
- Data leakage risk assessment not documented for either sampled termination
- Transition plan template not formalized for Tier 1 vendor transitions

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

## Evidence Reviewed

- Vendor offboarding procedure documentation
- EOL tracker in ServiceNow
- Access revocation audit logs for terminated vendors
- Data destruction certificates (2 sampled)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Add API key and service account sweep to offboarding checklist | High | Identity Management Lead |
| 2 | Require documented data leakage risk assessment for all terminations | High | GRC Manager |
| 3 | Create Tier 1 vendor transition plan template | Medium | GRC Manager |
