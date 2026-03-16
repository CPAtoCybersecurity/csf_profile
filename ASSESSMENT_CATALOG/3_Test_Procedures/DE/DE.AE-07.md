# DE.AE-07: Threat Intelligence Integration Test Procedures

**CSF Subcategory:** DE.AE-07 — Cyber threat intelligence and other contextual information are integrated into the analysis

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Assess threat intelligence feed integration**
   - Verify GuardDuty threat intelligence feeds are active and receiving updates
   - Confirm O365 ATP is consuming Microsoft Threat Intelligence data
   - Review ISAC membership and threat briefing distribution to SOC personnel
   - Evaluate whether threat intelligence is consumed automatically or requires manual integration

2. **Evaluate asset context integration**
   - Review AWS resource tagging strategy for asset criticality classification
   - Verify SentinelOne endpoint inventory includes device role and department attributes
   - Confirm SOC analysts reference ServiceNow CMDB during triage for asset context
   - Test whether detection tools can query asset inventory data during analysis

3. **Review vulnerability disclosure monitoring**
   - Verify monitoring of CISA KEV catalog, AWS Security Bulletins, and ISAC advisories
   - Assess response time from vulnerability disclosure to exposure assessment
   - Confirm vulnerability scan summary is updated with newly disclosed CVEs
   - Review whether disclosed vulnerabilities are cross-referenced with active detection findings

4. **Test threat intelligence effectiveness**
   - Review sample GuardDuty findings enriched with threat intelligence data
   - Evaluate whether threat intelligence reduced false positive rates or improved detection accuracy
   - Document gaps where threat intelligence is not available for specific detection platforms

---

## Evidence Requests

- [ ] GuardDuty threat intelligence feed configuration and status
- [ ] O365 ATP threat rule configurations including Alma-specific custom rules
- [ ] ISAC membership documentation and recent threat briefings
- [ ] AWS resource tagging policy and sample tag inventory
- [ ] SentinelOne device inventory with attribute fields
- [ ] Recent vulnerability disclosure response timeline

---

## Notes

This test procedure evaluates how Alma integrates cyber threat intelligence and contextual information into its detection and analysis workflows. For a SaaS company in the continuous authentication space, sector-specific threat intelligence is particularly valuable for detecting targeted campaigns against authentication infrastructure.
