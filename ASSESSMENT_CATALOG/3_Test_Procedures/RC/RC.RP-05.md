# RC.RP-05: Verify Restored Asset Integrity

**CSF Subcategory:** RC.RP-05 - The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed

---

## Test Procedures

1. **Review restored asset integrity verification procedures**
   - Obtain documentation for verifying restored assets are free of compromise indicators
   - Verify that restored systems are scanned for indicators of compromise before returning to production
   - Confirm that root cause remediation is verified before bringing restored assets online
   - Check that integrity verification procedures address application code, data, and infrastructure layers

2. **Evaluate restoration correctness validation**
   - Review procedures for validating that restoration actions produced correct results
   - Verify that functional testing is performed on restored systems before production cutover
   - Confirm that the continuous authentication service undergoes end-to-end testing after restoration
   - Check that PostgreSQL data integrity is verified after backup restoration (row counts, checksums, application queries)

3. **Assess normal operating status confirmation**
   - Verify that criteria exist for declaring restored systems operational
   - Confirm that monitoring and alerting are fully operational before declaring normal status
   - Check that Kubernetes pod health checks, AWS resource monitoring, and application-level checks all pass
   - Review whether a stabilization observation period is defined before full operational declaration

4. **Test post-restoration security validation**
   - Verify that security controls are confirmed operational on restored systems
   - Confirm that access controls, encryption, and logging are validated after restoration
   - Check that restored systems are not reintroduced with the vulnerabilities that enabled the original incident
   - Evaluate whether the quarterly restore tests include post-restoration security validation steps

---

## Evidence Requests

- [ ] Restored asset integrity verification procedures
- [ ] Post-restoration IOC scanning procedures and tools
- [ ] Functional testing procedures for restored systems
- [ ] PostgreSQL data integrity validation procedures
- [ ] Normal operating status declaration criteria
- [ ] Post-restoration monitoring configuration
- [ ] Quarterly restore test results showing integrity verification
- [ ] 2024 incident restoration verification evidence

---

## Notes

This test procedure evaluates whether Alma Security verifies the integrity of restored assets and confirms normal operating status after recovery. The quarterly restore testing provides evidence of restoration validation practices. Key focus areas include whether IOC scanning occurs before restored systems return to production, whether functional testing verifies the continuous authentication service operates correctly, and whether a defined stabilization period exists before declaring normal operations. The 2024 security incidents provide real-world evidence of how restoration integrity was (or was not) verified. The automated backup verification capability should extend to post-restoration integrity checks.
