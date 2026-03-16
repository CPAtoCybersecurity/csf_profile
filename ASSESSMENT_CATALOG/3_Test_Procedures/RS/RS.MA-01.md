# RS.MA-01: Incident Response Plan Execution Test Procedures

**CSF Subcategory:** RS.MA-01 - The incident response plan is executed in coordination with relevant third parties once an incident is declared

---

## Test Procedures

1. **Review incident declaration criteria and authority**
   - Obtain incident response plan including declaration criteria and authority matrix
   - Verify SOC Manager authority to declare incidents is documented and communicated
   - Confirm criteria distinguish between events, alerts, and declared incidents
   - Check that declaration triggers are integrated into detection technology workflows

2. **Examine incident response plan execution procedures**
   - Review the incident response playbook for completeness and currency
   - Verify procedures address automated reporting from detection technologies (SentinelOne, GuardDuty)
   - Confirm incident lead designation process is documented and followed
   - Check that procedures reference activation of supporting plans (BCDR, crisis communication)

3. **Validate third-party coordination capabilities**
   - Review contracts and procedures for engaging incident response outsourcers or retainers
   - Verify contact information and engagement procedures for third-party IR services are current
   - Confirm coordination procedures with ISPs, MSSPs, and law enforcement are documented
   - Check that third-party roles and responsibilities are defined in the response plan

4. **Test plan execution through recent incidents or exercises**
   - Pull 3-5 recent incident records from ServiceNow to verify plan execution
   - Verify an incident lead was designated for each declared incident
   - Confirm detection technology automatic reporting functioned as designed
   - Check that supporting plans were activated when criteria were met

---

## Evidence Requests

- [ ] Incident Response Plan (current version)
- [ ] Incident declaration criteria and authority matrix
- [ ] Incident response playbook (all playbooks)
- [ ] Third-party IR retainer agreement
- [ ] Third-party contact and engagement procedures
- [ ] 3-5 recent incident records showing plan execution
- [ ] Incident lead assignment records
- [ ] Detection technology auto-reporting configuration (SentinelOne, GuardDuty)

---

## Notes

This test procedure validates that the incident response plan is actually executed when incidents are declared, not just documented. Key maturity indicators include clear declaration criteria, designated incident leads, automated detection reporting, and documented third-party coordination. The SOC Manager's authority to declare incidents should be widely understood across the organization. Gaps in 24/7 coverage may impact the ability to execute the plan outside business hours, which should be specifically examined during testing.
