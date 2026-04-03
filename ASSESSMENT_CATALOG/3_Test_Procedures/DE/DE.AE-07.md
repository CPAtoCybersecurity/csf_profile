# DE.AE-07: Cyber Threat Intelligence and Other Contextual Information Are Integrated into the Analysis

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** PM-16, RA-03, RA-10
**Implementation Examples:** 3 (Ex1–Ex3)

## Scope & Applicability

This test procedure covers Alma Security's integration of threat intelligence and contextual information into detection and analysis:

- **Automated threat intelligence feeds:** GuardDuty (Amazon-managed feeds — malicious IPs, domains, cryptomining indicators); O365 ATP (Microsoft Threat Intelligence with Alma-specific custom rules); SentinelOne cloud intelligence (IOCs, malware signatures, behavioral models)
- **Manual threat intelligence:** SaaS-sector ISAC briefings distributed via encrypted email to D&R personnel; CISA KEV catalog monitoring; AWS Security Bulletins
- **Asset context sources:** AWS resource tags (environment, criticality tier, data sensitivity); SentinelOne endpoint inventory (device role, department, managed status); ServiceNow CMDB (asset owners, business impact ratings, interdependencies)
- **Vulnerability disclosure monitoring:** CISA KEV catalog, AWS Security Bulletins, ISAC advisories, vendor security notifications
- **Personnel:** Nadia Khan (D&R Lead — CTI program owner), Chris Magann (Vulnerability Management), SOC analysts (Jane, John), auditor (Steve)

Out of scope: threat modeling for product security (application-level threats to Alma's continuous authentication platform), which falls under a separate product security function.

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Threat intelligence feed freshness | GuardDuty, SentinelOne, O365 ATP | Weekly | All automated feeds updated within 24h of last publication |
| CISA KEV exposure assessment turnaround | Vulnerability management tickets | Per disclosure | Critical KEV entries assessed against asset inventory within 24h of publication |
| ISAC briefing consumption rate | D&R team records | Monthly | ≥90% of relevant ISAC briefings reviewed by at least one D&R team member |
| Asset criticality coverage in CMDB | ServiceNow | Quarterly | ≥90% of production assets have criticality and data sensitivity ratings |
| Detection rule updates informed by CTI | Change log | Quarterly | ≥1 detection rule created or tuned per quarter based on threat intelligence input |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Verify GuardDuty threat intelligence feeds are active and receiving updates | GuardDuty settings showing threat list status; timestamp of most recent threat list update; confirmation that custom threat lists (if any) are maintained |
| E2 | Confirm O365 ATP consumes Microsoft Threat Intelligence and has Alma-specific custom rules | O365 ATP policy configuration; list of Alma-specific custom threat rules with creation dates and rationale |
| E3 | Review SentinelOne cloud intelligence integration status | SentinelOne settings showing cloud intelligence enabled; sample detection demonstrating behavioral model or IOC match from cloud intelligence |
| E4 | Assess ISAC membership and threat briefing distribution to SOC personnel | ISAC membership documentation (SaaS-sector or authentication-sector); distribution list configuration; sample briefing with distribution confirmation |
| E5 | Review AWS resource tagging for asset criticality context | AWS resource tag policy; sample tag inventory showing environment, criticality, and data sensitivity tags; coverage report from AWS Config required-tags rule |
| E6 | Examine SentinelOne endpoint inventory attributes | Endpoint inventory export showing device role, department, and managed status fields populated for enrolled endpoints |
| E7 | Verify CISA KEV catalog and vendor advisory monitoring process | Documentation of monitoring cadence; sample vulnerability disclosure with evidence of exposure assessment against asset inventory; cross-reference with vulnerability scan summary |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Nadia Khan (D&R Lead) | "Describe your threat intelligence program. What sources do you consume, how are they distributed to your team, and how do they influence detection rule tuning?" — Expected: Names specific sources (GuardDuty feeds, ISAC, CISA KEV), describes distribution mechanism, and gives at least one example of CTI-driven rule change |
| I2 | SOC Analyst (Jane or John) | "When you're triaging a GuardDuty finding, how do you determine the criticality of the affected asset? What data sources do you reference?" — Expected: Describes checking AWS resource tags for environment/criticality, looking up the asset in CMDB for owner and business impact, and using that context to prioritize response |
| I3 | Chris Magann (Vulnerability Management) | "When a new critical CVE appears on the CISA KEV catalog, what is your process for determining if Alma is exposed? How quickly does that assessment happen?" — Expected: Describes checking the CVE against deployed software inventory, AWS Config rules, and SentinelOne application inventory with a target turnaround time |
| I4 | Nadia Khan (D&R Lead) | "Has threat intelligence from an ISAC briefing or external source ever caused you to create a new detection rule or modify an existing one? Walk me through that example." — Expected: Can describe a specific instance with the intelligence source, the resulting action, and the detection improvement achieved |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Verify GuardDuty threat list update timestamps are within 7 days; review 3 recent GuardDuty findings and confirm threat intelligence enrichment is present in finding details | All 3 findings include threat intelligence context (threat type, known-bad indicator match, or behavioral pattern); threat lists are current |
| T2 | Select a recent CISA KEV entry relevant to Alma's technology stack; verify an exposure assessment was conducted and documented | Assessment exists with documentation of affected/not-affected determination; if affected, remediation timeline is documented; assessment was completed within 48 hours of KEV publication |
| T3 | Request the SOC analyst to triage a sample GuardDuty finding and demonstrate asset context lookup; verify they reference AWS tags and/or CMDB during triage | Analyst looks up the affected resource's criticality tier, environment (prod/dev), data sensitivity, and owner before completing severity assessment; context influences triage decision |
| T4 | Review SentinelOne endpoint inventory for 10 random endpoints; verify asset context fields (device role, department, managed status) are populated | ≥8 of 10 endpoints have all three fields populated; any gaps are documented with explanation |

## Evidence Requirements

- [ ] GuardDuty threat intelligence feed configuration and update timestamps
- [ ] O365 ATP policy configuration with Alma-specific custom rules
- [ ] SentinelOne cloud intelligence integration settings and sample detection
- [ ] ISAC membership documentation and sample threat briefing
- [ ] AWS resource tag policy and coverage report from AWS Config
- [ ] SentinelOne endpoint inventory export with attribute fields
- [ ] ServiceNow CMDB asset criticality coverage report
- [ ] CISA KEV exposure assessment example with timeline
- [ ] Vulnerability scan summary report showing CVE cross-referencing
- [ ] Evidence of at least one detection rule change driven by threat intelligence

## Pass/Fail Criteria

**Pass:** All three implementation examples are demonstrably operational:
- Threat intelligence feeds (Ex1) are active on at least two automated platforms (GuardDuty + SentinelOne or O365 ATP) with evidence of regular updates, plus at least one manual intelligence source (ISAC or CISA KEV) actively consumed
- Asset inventory context (Ex2) is available during triage with criticality, environment, and ownership attributes populated for ≥80% of production assets across AWS and SentinelOne
- Vulnerability disclosure monitoring (Ex3) has a documented process with evidence of at least one recent exposure assessment completed within 48 hours of disclosure

**Partial Pass:** Automated feeds are active but manual CTI sources (ISAC, CISA KEV) are consumed informally without documented process, OR asset context is available but coverage is below 80%, OR vulnerability disclosure monitoring exists but assessment turnaround exceeds 48 hours.

**Fail:** No threat intelligence feeds beyond vendor defaults are actively consumed, OR asset criticality context is not referenced during triage, OR no vulnerability disclosure monitoring process exists.

## Alma Security Context

Alma's CTI posture relies heavily on vendor-provided intelligence (GuardDuty, SentinelOne cloud, Microsoft ATP) with limited investment in external CTI sources. For a 300-person SaaS company, this is common but creates a blind spot for sector-specific threats targeting authentication infrastructure — exactly the kind of threat most relevant to Alma's business.

The ISAC membership and CISA KEV monitoring represent the manual CTI layer. The observation from Q1 2026 noted that ISAC engagement is informal and there is no dedicated threat intelligence function. For Alma's current scale, a formal CTI program is aspirational, but structured consumption of 2-3 external sources (ISAC, CISA KEV, vendor advisories) with documented integration into detection tuning is achievable and would meaningfully improve the score.

Asset context integration is a strength area — AWS resource tags at 93.5% compliance (per AWS Config) and SentinelOne endpoint attributes provide good triage context. The ServiceNow CMDB adds ownership and business impact data. The gap is that this context is not systematically fed into detection rule tuning decisions — asset criticality informs triage prioritization but not which detection rules are most important to maintain or enhance.

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md), [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md), [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- **Controls:** [DE.AE-07_Ex1](../../2_Controls/DE/DE.AE-07_Ex1.md), [DE.AE-07_Ex2](../../2_Controls/DE/DE.AE-07_Ex2.md), [DE.AE-07_Ex3](../../2_Controls/DE/DE.AE-07_Ex3.md)
- **Observations:** [DE.AE-07-Q1](../../4_Observations/DE/DE.AE-07-Q1.md)
