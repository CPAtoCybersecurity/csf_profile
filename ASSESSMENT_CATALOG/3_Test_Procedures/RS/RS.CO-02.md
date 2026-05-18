# RS.CO-02: Incident Stakeholder Notification Test Procedures

**CSF Subcategory:** RS.CO-02 - Internal and external stakeholders are notified of incidents

---

## Test Procedures

1. **Review notification policies and procedures**
   - Obtain breach notification procedures and incident communication plans
   - Verify procedures address data breach notification requirements (state laws, GDPR, contractual)
   - Confirm notification timelines are defined for each stakeholder category
   - Check that notification templates exist for customers, regulators, law enforcement, and partners

2. **Examine notification criteria and triggers**
   - Review incident classification criteria that trigger external notification
   - Verify criteria align with applicable regulatory requirements (e.g., 72-hour GDPR, state breach laws)
   - Confirm the incident response playbook includes decision trees for notification requirements
   - Check that Legal and PR coordination steps are documented for customer-impacting incidents

3. **Compute notification timeliness KPIs for recent incidents**
   - For each incident in the past 12 months that required stakeholder notification, calculate time from detection to first notification
   - For incidents with regulatory notification requirements, verify actual notification time vs. required timeline (e.g., GDPR 72-hour window)
   - Calculate average notification time and flag any instances where required timelines were missed (Accuracy + Valuation assertions)

4. **Validate notification execution for recent incidents**
   - Pull records of incidents that required stakeholder notification
   - Verify notifications were sent within required timeframes
   - Confirm notification content met regulatory requirements (nature of breach, data affected, remediation steps)
   - Check that business partner and customer notifications met contractual SLA requirements

5. **Reperformance: simulate incident notification trigger**
   - Request a tabletop walkthrough of the notification workflow for a hypothetical P1 incident
   - Verify the escalation chain is reachable by testing current phone numbers and email addresses in the contact list
   - Confirm that notification procedures can be executed outside business hours without relying on systems that may be compromised during the incident
   - Document any gaps in the on-call contact list or missing coverage windows (Recurrence assertion)

---

## Evidence Requests

- [ ] Breach notification procedures
- [ ] Incident communication plan with stakeholder categories
- [ ] Notification templates (customer, regulator, law enforcement, partner)
- [ ] Notification timeline requirements by regulation and contract
- [ ] Records of notifications sent for recent incidents with timestamps
- [ ] Escalation chain documentation with current contact information
- [ ] Legal/PR coordination procedures for customer-impacting incidents

---

## Notes

This test procedure validates that the organization has established and follows notification procedures for internal and external stakeholders when incidents occur. Given the 2024 security incidents that damaged public trust, the maturity and timeliness of notification processes is particularly critical for Alma Security. Step 3 is a new analytical procedure: verifying that notifications were sent is insufficient; the procedure must compute whether they were sent within required timelines. Step 5 is a new reperformance step: reviewing past records only tests what was documented; simulating a notification trigger tests what the team would actually do. Note: this procedure focuses on notification TO stakeholders. Information sharing WITH designated external parties (ISACs, regulatory bodies, threat intel platforms) is covered separately in RS.CO-03.
