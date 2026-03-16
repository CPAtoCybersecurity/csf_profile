# RS.MA-05: Incident Recovery Criteria Test Procedures

**CSF Subcategory:** RS.MA-05 - The criteria for initiating incident recovery are applied

---

## Test Procedures

1. **Review incident recovery initiation criteria**
   - Obtain documented criteria for determining when to transition from response to recovery
   - Verify criteria address containment confirmation, eradication validation, and environmental stability
   - Confirm criteria account for the operational disruption that recovery activities may cause
   - Check that recovery criteria are integrated into the incident response playbook decision flow

2. **Examine recovery decision-making for recent incidents**
   - Pull 3-5 incidents that progressed to recovery phase from ServiceNow
   - Verify recovery criteria were formally evaluated and documented before recovery initiation
   - Confirm the decision to initiate recovery was made by authorized personnel
   - Check that potential operational disruption from recovery was assessed and communicated

3. **Validate coordination between response and recovery phases**
   - Review handoff procedures between incident response and recovery teams
   - Verify that response findings (root cause, scope, IOCs) are communicated to recovery teams
   - Confirm recovery actions do not conflict with ongoing investigation or evidence preservation
   - Check that business continuity plans are activated when recovery timeline exceeds defined thresholds

4. **Test recovery readiness assessment**
   - Review criteria for validating that the environment is safe for recovery operations
   - Verify procedures for confirming threat actor is no longer present before rebuilding
   - Confirm backup integrity is validated before restoration
   - Check that recovery milestones and success criteria are predefined

---

## Evidence Requests

- [ ] Incident recovery initiation criteria documentation
- [ ] Response-to-recovery transition procedures
- [ ] 3-5 incident records showing recovery decision documentation
- [ ] Recovery authorization records
- [ ] Operational disruption assessment for recovery activities
- [ ] Response-to-recovery handoff documentation
- [ ] Backup integrity validation procedures
- [ ] Recovery milestone and success criteria definitions

---

## Notes

This test procedure validates that the organization applies defined criteria before initiating incident recovery, rather than rushing to restore operations prematurely. Premature recovery before complete containment and eradication is a common failure mode that leads to recurring incidents. Key maturity indicators include documented recovery criteria, formal assessment of operational disruption from recovery activities, coordination between response and recovery teams, and validation that the threat has been eradicated before rebuilding. The balance between rapid recovery and thorough response is a critical decision point.
