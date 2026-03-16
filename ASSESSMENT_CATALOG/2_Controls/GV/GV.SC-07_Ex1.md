# GV.SC-07 Ex1: Adjust Assessments by Criticality and Reputation

**Subcategory:** GV.SC-07 — The risks posed by a supplier, their products and services, and other third parties are understood, recorded, prioritized, assessed, responded to, and monitored over the course of the relationship
**NIST SP 800-53 Ref:** RA-09, SA-04, SA-09, SR-03, SR-06

## Implementation Example

> Adjust assessment formats and frequencies based on the third party's reputation and the criticality of the products or services they provide.

## Alma Security Implementation

Assessment frequency and depth are scaled by vendor tier: Tier 1 vendors receive annual comprehensive assessments plus continuous monitoring via security rating services; Tier 2 vendors receive annual questionnaire-based assessments; Tier 3 vendors receive assessments at contract renewal. High-reputation vendors with strong certifications (SOC 2 Type II) may receive streamlined assessments. Assessment schedules are automated in ServiceNow with tier-based cadence rules.

## Artifacts

- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
