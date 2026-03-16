# RC.RP-02: Select and Perform Recovery Actions

**CSF Subcategory:** RC.RP-02 - Recovery actions are selected, scoped, prioritized, and performed

---

## Test Procedures

1. **Review recovery action selection and prioritization criteria**
   - Obtain documentation defining how recovery actions are selected based on incident type and severity
   - Verify that prioritization criteria consider business impact, data sensitivity, and service criticality
   - Confirm that the continuous authentication SaaS platform is designated as the highest-priority recovery target
   - Check that recovery action selection aligns with business impact analysis outputs

2. **Evaluate recovery scoping procedures**
   - Review how the scope of recovery is determined during active incidents
   - Verify that scoping considers dependencies across AWS services, Kubernetes workloads, and PostgreSQL databases
   - Confirm that recovery scope can be adjusted based on evolving situational awareness
   - Check that the 2024 incident recovery demonstrated appropriate scoping decisions

3. **Assess recovery action execution capabilities**
   - Review the quarterly restore test process for evidence of structured recovery action execution
   - Verify that PostgreSQL automated backup restoration follows a defined runbook
   - Confirm that AWS multi-AZ failover can be initiated as a recovery action for production systems
   - Evaluate Kubernetes pod restart and redeployment procedures as recovery mechanisms

4. **Test recovery prioritization adaptability**
   - Determine whether recovery priorities can be adjusted mid-recovery based on new information
   - Review whether resource constraints (personnel, infrastructure) are factored into recovery sequencing
   - Verify that the DR plan in development addresses multi-system recovery coordination
   - Confirm that communication procedures support real-time priority changes during recovery

---

## Evidence Requests

- [ ] Recovery action selection criteria documentation
- [ ] Business impact analysis or system criticization records
- [ ] Quarterly restore test procedures and results
- [ ] PostgreSQL backup restoration runbook
- [ ] AWS multi-AZ failover runbook
- [ ] Kubernetes recovery procedures
- [ ] 2024 incident recovery action logs
- [ ] DR plan development status (Cloud Security Optimization project)

---

## Notes

This test procedure evaluates how Alma Security selects, scopes, and prioritizes recovery actions during incident recovery. The quarterly restore testing and PostgreSQL automated backups provide evidence of structured recovery execution. The DR plan under development through the Cloud Security Optimization project will formalize recovery prioritization. The 2024 security incidents offer real-world evidence of recovery action selection under pressure. Key focus areas include whether recovery priorities reflect the criticality of the continuous authentication SaaS platform and whether recovery sequencing accounts for infrastructure dependencies.
