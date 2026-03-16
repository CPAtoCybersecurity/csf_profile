# RS.MA-02: Incident Triage and Validation Test Procedures

**CSF Subcategory:** RS.MA-02 - Incident reports are triaged and validated

---

## Test Procedures

1. **Review triage and validation procedures**
   - Obtain documented triage procedures from the incident response playbook
   - Verify procedures include preliminary review criteria to confirm cybersecurity relevance
   - Confirm severity estimation criteria are documented with clear thresholds
   - Check that triage procedures address false positive identification and dismissal

2. **Examine triage execution for recent incidents**
   - Pull 5-10 recent SOC tickets from ServiceNow showing triage decisions
   - Verify each incident report was reviewed for cybersecurity relevance before escalation
   - Confirm severity was estimated using documented criteria at the triage stage
   - Check triage decision turnaround times against defined SLAs

3. **Validate severity estimation accuracy**
   - Compare initial severity estimates against final severity determinations for closed incidents
   - Identify patterns of over-estimation or under-estimation
   - Verify that severity estimation criteria account for data sensitivity, system criticality, and blast radius
   - Check that severity estimates are updated as additional information becomes available

4. **Test triage workflow and tooling**
   - Review ServiceNow SOC ticket workflow for triage stages and required fields
   - Verify triage decisions are documented with rationale
   - Confirm automated alert enrichment supports triage decisions (e.g., asset context, threat intel)
   - Check that dismissed reports (false positives) are tracked for detection tuning

---

## Evidence Requests

- [ ] Incident triage procedures from response playbook
- [ ] Severity estimation criteria and classification matrix
- [ ] 5-10 ServiceNow SOC tickets showing triage decisions and rationale
- [ ] Triage SLA metrics (time from report to triage decision)
- [ ] Comparison of initial vs. final severity for recent incidents
- [ ] ServiceNow SOC ticket workflow configuration
- [ ] Alert enrichment and automation documentation
- [ ] False positive tracking records and detection tuning evidence

---

## Notes

This test procedure validates that incident reports are systematically triaged and validated before resources are committed to response. Effective triage prevents resource exhaustion from false positives while ensuring genuine incidents receive prompt attention. Key maturity indicators include documented triage criteria, consistent severity estimation, tracked triage SLAs, and feedback loops from false positive tracking to detection tuning. The accuracy of initial severity estimates directly impacts resource allocation and response effectiveness.
