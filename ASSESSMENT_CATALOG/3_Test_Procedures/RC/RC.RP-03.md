# RC.RP-03: Verify Backup and Restoration Asset Integrity

**CSF Subcategory:** RC.RP-03 - The integrity of backups and other restoration assets is verified before using them for restoration

---

## Test Procedures

1. **Review automated backup verification procedures**
   - Obtain documentation for the automated backup verification process
   - Verify that integrity checks are performed on PostgreSQL automated backups before restoration
   - Confirm that backup verification includes checksum validation, corruption detection, or test restoration
   - Check that verification runs automatically and results are logged and alerted on failure

2. **Evaluate backup integrity testing during quarterly restore tests**
   - Review quarterly restore test procedures for backup integrity verification steps
   - Verify that restore tests confirm backup completeness and data accuracy
   - Confirm that test restorations are performed to an isolated environment before production use
   - Check that quarterly restore test results document any integrity issues discovered

3. **Assess backup security controls**
   - Verify that backups are protected against unauthorized modification or deletion
   - Confirm that backup storage (AWS) uses encryption at rest and access controls
   - Check whether backup assets are scanned for indicators of compromise before restoration
   - Evaluate whether immutable backup copies exist to protect against ransomware scenarios

4. **Test restoration asset inventory and currency**
   - Verify that all restoration assets (backup images, configuration snapshots, deployment manifests) are inventoried
   - Confirm that Kubernetes deployment manifests and infrastructure-as-code templates are version-controlled
   - Check that restoration assets are current and reflect the production environment
   - Verify that the automated backup verification covers all critical data stores

---

## Evidence Requests

- [ ] Automated backup verification procedure documentation
- [ ] Backup verification logs (most recent 90 days)
- [ ] Quarterly restore test results with integrity verification details
- [ ] AWS backup encryption configuration
- [ ] Backup access control and retention policies
- [ ] PostgreSQL backup configuration and scheduling
- [ ] Kubernetes deployment manifest version control evidence
- [ ] Infrastructure-as-code repository access for restoration assets

---

## Notes

This test procedure evaluates whether Alma Security verifies the integrity of backups and restoration assets before using them for recovery. Automated backup verification is a key strength. Quarterly restore testing provides periodic validation. Key focus areas include whether integrity checks detect corruption or compromise indicators, whether backup security controls prevent tampering, and whether all restoration assets (not just database backups) are inventoried and verified. The PostgreSQL automated backup process and AWS infrastructure provide the technical foundation, but the assessment should confirm verification extends beyond database backups to application configurations and deployment manifests.
