# RS.MA-04: Incident Escalation Test Procedures

**CSF Subcategory:** RS.MA-04 - Incidents are escalated or elevated as needed

---

## Test Procedures

1. **Review escalation criteria and procedures**
   - Obtain documented escalation criteria from the incident response plan
   - Verify escalation thresholds are defined by severity, scope expansion, and elapsed time
   - Confirm escalation paths are documented for internal stakeholders (CISO, Legal, PR, executive)
   - Check that external escalation procedures are defined (regulators, law enforcement, customers)

2. **Examine incident status tracking mechanisms**
   - Review ServiceNow SOC ticket workflow for status tracking and update requirements
   - Verify status updates are recorded at defined intervals during active incidents
   - Confirm incident status dashboards or reports are available for leadership visibility
   - Check that status tracking captures changes in scope, severity, and assigned personnel

3. **Validate escalation execution for recent incidents**
   - Pull records of incidents that triggered escalation
   - Verify escalation occurred when documented criteria were met
   - Confirm escalation notifications reached designated stakeholders within required timeframes
   - Check that escalation included sufficient context for recipients to take informed action

4. **Test escalation communication channels**
   - Review Slack #security-alerts channel escalation notification configuration
   - Verify escalation chain contact information is current and tested
   - Confirm escalation can be executed outside business hours (on-call procedures)
   - Check that escalation documentation includes response acknowledgment requirements

---

## Evidence Requests

- [ ] Escalation criteria and threshold documentation
- [ ] Escalation path diagrams (internal and external)
- [ ] ServiceNow SOC ticket status tracking configuration
- [ ] Incident status update cadence requirements
- [ ] Records of recent incident escalations with timeline
- [ ] Slack escalation notification configuration
- [ ] On-call rotation and after-hours escalation procedures
- [ ] Escalation acknowledgment records

---

## Notes

This test procedure validates that incidents are tracked and escalated appropriately when criteria are met. Key maturity indicators include defined escalation thresholds, documented escalation paths for both internal and external stakeholders, and evidence that escalation occurred promptly when warranted. The 24/7 coverage gap is a particular concern for escalation effectiveness, as incidents occurring outside business hours may experience delayed escalation. ServiceNow ticket workflow should enforce status updates and escalation checkpoints at defined intervals.
