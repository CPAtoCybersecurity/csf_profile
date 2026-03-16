# RS.AN-08: Incident Magnitude Estimation Test Procedures

**CSF Subcategory:** RS.AN-08 - An incident's magnitude is estimated and validated

---

## Test Procedures

1. **Review magnitude estimation criteria and procedures**
   - Obtain documented criteria for estimating incident scope, impact, and magnitude
   - Verify procedures include searching additional targets for indicators of compromise (IOCs)
   - Confirm criteria address lateral movement detection and blast radius assessment
   - Check that estimation procedures are integrated into the incident response playbook workflow

2. **Examine magnitude estimation in recent incidents**
   - Pull 3-5 recent incident reports from ServiceNow SOC tickets
   - Verify each incident includes a documented scope assessment with affected systems and data
   - Confirm investigators searched beyond the initial indicator for additional compromise
   - Check that magnitude estimates were updated as new information emerged during investigation

3. **Validate automated IOC scanning capabilities**
   - Review SentinelOne threat hunting capabilities for IOC-based sweeps across endpoints
   - Verify GuardDuty can automatically scan for IOCs across AWS infrastructure
   - Confirm SIEM rules exist for retroactive IOC matching against historical log data
   - Check that automated scanning results are documented within incident tickets

4. **Test magnitude validation process**
   - Walk through a specific incident to verify the scope was validated, not just estimated
   - Confirm that magnitude estimates informed containment and resource allocation decisions
   - Verify that initial estimates were compared against final determinations in post-incident review
   - Check that magnitude estimation feeds into severity classification under RS.MA-03

---

## Evidence Requests

- [ ] Incident severity and magnitude estimation criteria documentation
- [ ] 3-5 incident reports showing magnitude estimation and validation
- [ ] SentinelOne threat hunting query examples for IOC sweeps
- [ ] GuardDuty automated remediation configuration
- [ ] SIEM retroactive IOC search procedures
- [ ] Post-incident review reports showing initial vs. final magnitude assessment
- [ ] Incident response playbook (magnitude estimation section)

---

## Notes

This test procedure validates that the organization systematically estimates and validates incident magnitude rather than relying solely on initial indicators. Key maturity indicators include automated IOC scanning across the environment, iterative scope refinement as investigation progresses, and validation of estimates through comprehensive analysis. Organizations that only assess the initially detected system without proactively hunting for additional compromise frequently underestimate incident magnitude, leading to incomplete containment and recurring incidents.
