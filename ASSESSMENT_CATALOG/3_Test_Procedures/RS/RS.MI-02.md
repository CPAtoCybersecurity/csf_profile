# RS.MI-02: Incident Eradication Test Procedures

**CSF Subcategory:** RS.MI-02 - Incidents are eradicated

---

## Test Procedures

1. **Review eradication procedures and capabilities**
   - Obtain documented eradication procedures from the incident response playbook
   - Verify procedures address removal of malware, unauthorized access, and persistence mechanisms
   - Confirm eradication strategies are defined for different incident types
   - Check that procedures include verification steps to confirm successful eradication

2. **Examine automated eradication capabilities**
   - Review SentinelOne automated remediation and rollback capabilities
   - Verify endpoint protection features can automatically remove known threats
   - Confirm automated eradication actions are logged with details for post-incident review
   - Check that OS-level and application-level security features support threat removal

3. **Validate manual eradication procedures for complex scenarios**
   - Review procedures for manually selecting and performing eradication actions
   - Verify procedures address advanced persistent threats requiring manual intervention
   - Confirm procedures include credential reset, patch application, and configuration hardening
   - Check that third-party eradication support engagement procedures are documented

4. **Test eradication effectiveness through recent incidents**
   - Pull 3-5 recent incidents requiring eradication from ServiceNow
   - Verify eradication actions were performed after containment was confirmed
   - Confirm eradication was validated through follow-up scanning and monitoring
   - Check that incidents did not recur after eradication, indicating completeness
   - Verify that eradication findings informed preventive control improvements

---

## Evidence Requests

- [ ] Incident eradication procedures from response playbook
- [ ] SentinelOne automated remediation configuration
- [ ] Manual eradication playbooks for complex threats
- [ ] Eradication verification procedures (post-eradication scanning)
- [ ] 3-5 incident records showing eradication actions and verification
- [ ] Third-party eradication support contracts or retainer agreements
- [ ] Evidence of credential resets following account compromise incidents
- [ ] Post-eradication monitoring procedures and duration

---

## Notes

This test procedure validates that the organization can effectively eradicate threats after containment. Eradication goes beyond containment to remove the threat entirely from the environment, including persistence mechanisms, compromised credentials, and exploited vulnerabilities. Key maturity indicators include automated eradication for known threats, documented manual procedures for advanced threats, verification scanning after eradication, and absence of incident recurrence. The distinction between containment (RS.MI-01) and eradication (RS.MI-02) should be clear in incident records, with eradication occurring after containment is confirmed.
