# RS.AN-03: Incident Root Cause Analysis Test Procedures

**CSF Subcategory:** RS.AN-03 - Analysis is performed to establish what has taken place during an incident and the root cause of the incident

---

## Test Procedures

1. **Review incident analysis methodology and procedures**
   - Obtain documented incident analysis procedures from the incident response playbook
   - Verify procedures address event sequencing, asset impact identification, and root cause determination
   - Confirm procedures include timeline reconstruction requirements and evidence preservation standards
   - Check that analysis methodology accounts for multi-vector and multi-stage attacks

2. **Examine completed incident analysis reports**
   - Pull 3-5 recent incident analysis reports from ServiceNow SOC tickets
   - Verify each report documents the sequence of events and affected assets
   - Confirm root cause analysis was performed and documented with supporting evidence
   - Check that vulnerability and threat actor identification was attempted for each incident

3. **Validate analysis tooling and capabilities**
   - Review SIEM correlation rules and log retention supporting incident investigation
   - Verify SentinelOne provides endpoint telemetry sufficient for timeline reconstruction
   - Confirm GuardDuty findings are correlated with other data sources during analysis
   - Check whether cyber deception technology is deployed and integrated into analysis workflows

4. **Test analyst competency and process adherence**
   - Interview SOC analysts on their investigation methodology for a recent incident
   - Walk through a specific incident to verify the documented process was followed
   - Assess whether systemic root causes are identified beyond immediate technical causes
   - Verify findings are communicated to stakeholders for remediation tracking

---

## Evidence Requests

- [ ] Incident Response Playbook (analysis section)
- [ ] 3-5 completed incident investigation reports from ServiceNow
- [ ] SIEM correlation rules and log retention configuration
- [ ] SentinelOne investigation workflow documentation
- [ ] GuardDuty finding integration procedures
- [ ] SOC analyst training records on investigation methodology
- [ ] Root cause analysis templates or frameworks in use

---

## Notes

This test procedure validates that the organization performs structured incident analysis to determine event sequences, identify affected resources, and establish root causes. Key maturity indicators include consistent use of analysis frameworks, correlation across multiple data sources, and identification of systemic root causes rather than surface-level technical failures. The time-to-investigate metric (currently 11 hours) provides a quantitative baseline for improvement tracking.
