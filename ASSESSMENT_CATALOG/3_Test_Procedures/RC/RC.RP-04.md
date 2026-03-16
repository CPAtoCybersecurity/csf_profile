# RC.RP-04: Establish Post-Incident Operational Norms

**CSF Subcategory:** RC.RP-04 - Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms

---

## Test Procedures

1. **Review post-incident operational norm establishment process**
   - Obtain documentation describing how post-incident operational norms are defined and approved
   - Verify that business impact analysis and system categorization records inform post-incident priorities
   - Confirm that the continuous authentication SaaS platform has defined service delivery objectives (RTO, RPO)
   - Check that post-incident norms address both technical restoration and business process resumption

2. **Evaluate system restoration confirmation procedures**
   - Review procedures for confirming successful system restoration with system owners
   - Verify that sign-off or acceptance criteria exist before declaring systems operational
   - Confirm that restoration verification includes functional testing of the continuous authentication service
   - Check that AWS multi-AZ and Kubernetes pod health are validated before declaring normal operations

3. **Assess restored system performance monitoring**
   - Verify that monitoring is enhanced for recently restored systems
   - Confirm that KPI tracking (including the public trust score) resumes after recovery
   - Check that performance baselines exist to compare restored system behavior against normal operations
   - Evaluate whether alerting thresholds are adjusted during the post-recovery stabilization period

4. **Test post-incident risk reassessment**
   - Review whether cybersecurity risk management activities are updated after incidents
   - Verify that risk register entries are created or updated based on incident findings
   - Confirm that the 2024 security incidents resulted in updated risk assessments
   - Check that post-incident operational norms incorporate lessons learned from previous recoveries

---

## Evidence Requests

- [ ] Post-incident operational norm documentation
- [ ] Business impact analysis with RTO/RPO for critical systems
- [ ] System restoration acceptance criteria and sign-off procedures
- [ ] Post-recovery monitoring configuration and dashboards
- [ ] KPI tracking documentation (public trust score metrics)
- [ ] Risk register updates following 2024 security incidents
- [ ] 2024 incident lessons learned documentation
- [ ] AWS and Kubernetes health check configurations

---

## Notes

This test procedure evaluates how Alma Security establishes post-incident operational norms that account for critical mission functions and cybersecurity risk. The 2024 security incidents and subsequent trust-rebuilding initiatives provide direct evidence of post-incident norm establishment. KPI tracking for the public trust score demonstrates awareness of recovery beyond technical restoration. Key focus areas include whether formal RTOs and RPOs exist for the continuous authentication platform, whether system owners participate in restoration confirmation, and whether risk management activities are updated after incidents. The DR plan in development should address formalization of these post-incident processes.
