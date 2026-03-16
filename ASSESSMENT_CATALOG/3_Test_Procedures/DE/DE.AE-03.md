# DE.AE-03: Information Correlation Test Procedures

**CSF Subcategory:** DE.AE-03 — Information is correlated from multiple sources

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Assess log aggregation architecture**
   - Identify all log sources (CloudTrail, VPC Flow Logs, DNS query logs, SentinelOne, O365 ATP, Slack)
   - Verify log forwarding from each source to centralized storage or analysis platform
   - Document gaps where log sources remain siloed without cross-platform correlation

2. **Evaluate event correlation capabilities**
   - Review GuardDuty multi-source correlation for AWS-native log streams
   - Assess O365 ATP correlation within the Microsoft ecosystem
   - Determine whether cross-platform correlation (AWS + endpoint + email) is automated or manual
   - Review status of planned custom cross-source correlation scripts

3. **Test threat intelligence integration in correlation**
   - Verify GuardDuty threat intelligence feeds are active and current
   - Confirm ISAC threat briefings are available to SOC analysts during event correlation
   - Test whether threat indicators from one platform can be queried across other log sources

4. **Review correlation effectiveness**
   - Pull sample of recent multi-vector incidents (if any) and assess correlation timeliness
   - Evaluate whether alert fatigue from uncorrelated duplicate alerts exists across platforms
   - Document mean time from first detection signal to correlated incident view

---

## Evidence Requests

- [ ] CloudTrail log forwarding configuration
- [ ] VPC Flow Log and DNS query log routing setup
- [ ] SentinelOne log export or API integration documentation
- [ ] Cross-source correlation script project status and architecture
- [ ] Sample of correlated incident investigation showing multi-source evidence
- [ ] GuardDuty threat intelligence feed status

---

## Notes

This test procedure evaluates Alma's ability to correlate security events across AWS-native, endpoint, and email platforms. The current architecture relies on platform-native correlation within AWS and Microsoft ecosystems, with manual cross-platform correlation. The Incident Response Enhancement project is expected to address this gap through custom correlation scripts.
