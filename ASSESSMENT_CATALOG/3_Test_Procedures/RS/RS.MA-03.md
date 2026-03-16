# RS.MA-03: Incident Categorization and Prioritization Test Procedures

**CSF Subcategory:** RS.MA-03 - Incidents are categorized and prioritized

---

## Test Procedures

1. **Review categorization and prioritization framework**
   - Obtain incident categorization taxonomy (e.g., data breach, ransomware, DDoS, insider threat)
   - Verify prioritization criteria are documented addressing scope, impact, and time-critical nature
   - Confirm the framework includes guidance for selecting response strategies based on category
   - Check that the categorization taxonomy aligns with industry standards and regulatory requirements

2. **Examine categorization and prioritization for recent incidents**
   - Pull 5-10 recent incident records from ServiceNow
   - Verify each incident was categorized by type using the documented taxonomy
   - Confirm prioritization was applied based on scope, likely impact, and urgency
   - Check that response strategy selection was documented and justified for each incident

3. **Validate prioritization decision-making**
   - Review incidents where multiple active incidents required resource allocation decisions
   - Verify prioritization decisions balanced rapid recovery needs against evidence preservation
   - Confirm response strategies considered operational impact of containment and recovery actions
   - Check that re-prioritization occurred when incident scope or impact changed during response

4. **Test categorization consistency**
   - Compare categorization decisions across different analysts for similar incident types
   - Verify that categorization drives appropriate playbook selection
   - Confirm that the taxonomy covers incident types relevant to Alma Security's environment
   - Check that categorization data supports trending and metrics reporting

---

## Evidence Requests

- [ ] Incident categorization taxonomy documentation
- [ ] Prioritization criteria with scope, impact, and urgency factors
- [ ] Response strategy selection guidance
- [ ] 5-10 incident records showing categorization and prioritization decisions
- [ ] Evidence of re-prioritization during active incidents
- [ ] Incident trending reports using categorization data
- [ ] Playbook-to-category mapping documentation

---

## Notes

This test procedure validates that incidents are systematically categorized and prioritized to drive appropriate response actions and resource allocation. Key maturity indicators include a comprehensive categorization taxonomy, documented prioritization criteria balancing multiple factors, and evidence that categorization drives playbook selection and response strategy. The ability to balance rapid recovery against evidence preservation (RS.MA-03 Ex3) reflects advanced maturity in incident management decision-making. Prioritization decisions should be traceable and justified in incident records.
