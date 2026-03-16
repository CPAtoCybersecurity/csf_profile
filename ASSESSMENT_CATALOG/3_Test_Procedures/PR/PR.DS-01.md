# PR.DS-01: Data-at-Rest Protection Test Procedures

**CSF Subcategory:** PR.DS-01 - The confidentiality, integrity, and availability of data-at-rest are protected

---

## Test Procedures

1. **Review data-at-rest encryption policy and standards**
   - Obtain the organization's data encryption policy and standards documentation
   - Verify policy mandates encryption for all sensitive data at rest (AES-256 or equivalent)
   - Confirm policy defines which data classifications require encryption
   - Validate that the policy addresses key management lifecycle (generation, rotation, revocation, destruction)
   - Check alignment with NIST SP 800-53 SC-28, SC-12, SC-13

2. **Assess encryption implementation across storage systems**
   - Inventory all data storage locations (databases, file systems, object storage, backups)
   - Verify encryption is enabled on PostgreSQL databases (Transparent Data Encryption or column-level)
   - Confirm AWS S3 bucket encryption settings (SSE-S3, SSE-KMS, or SSE-C) across all buckets
   - Validate on-premises Windows Domain Controller storage encryption (BitLocker or equivalent)
   - Check Kubernetes persistent volume encryption configurations
   - Sample 10-15 storage resources and verify encryption status against policy requirements

3. **Evaluate data integrity controls**
   - Review integrity verification mechanisms (checksums, hash validation, digital signatures)
   - Test file integrity monitoring (FIM) configuration and alerting
   - Verify SentinelOne FIM policy covers critical data repositories
   - Confirm that integrity baselines are established and deviation alerts are functional
   - Pull sample of recent integrity alerts and verify investigation/resolution

4. **Test access restrictions on data-at-rest**
   - Review access control lists on encrypted storage resources
   - Verify that decryption keys are restricted to authorized personnel and services only
   - Test separation of duties between storage administrators and key custodians
   - Confirm access logging is enabled for all encrypted data stores
   - Sample access logs to verify no unauthorized decryption attempts

5. **Examine removable media controls**
   - Obtain removable media policy documentation
   - Verify technical controls blocking unauthorized removable media (USB, external drives)
   - Test endpoint DLP policies enforcing encryption on approved removable media
   - Confirm SentinelOne device control policy is deployed across all endpoints
   - Review exception process and sample approved exceptions for business justification

6. **Validate secure storage infrastructure**
   - Assess physical security of on-premises storage infrastructure
   - Verify AWS S3 bucket policies block public access by default
   - Confirm S3 Access Analyzer is enabled and findings are triaged
   - Test that deleted data is securely wiped per media sanitization standards (NIST SP 800-88)
   - Validate data lifecycle rules ensure encrypted data remains protected through retention period

---

## Evidence Requests

- [ ] Data Encryption Policy and Standards document
- [ ] Data classification schema (or draft if in progress)
- [ ] AWS S3 bucket encryption configuration report (all buckets)
- [ ] PostgreSQL database encryption settings documentation
- [ ] AWS KMS key inventory and rotation schedule
- [ ] SentinelOne device control policy configuration
- [ ] Removable media policy and approved exceptions list
- [ ] File integrity monitoring configuration and recent alert samples
- [ ] Storage access control lists for critical data repositories
- [ ] BitLocker or equivalent encryption status for on-premises systems
- [ ] Kubernetes persistent volume encryption configuration
- [ ] S3 Access Analyzer findings report

---

## Notes

This test procedure validates that Alma Security protects data at rest across its hybrid infrastructure (AWS multi-AZ Kubernetes and on-premises Windows Domain Controller). Given the Data Encryption Upgrade project ($95K) and S3 Bucket Security project ($70K) are actively in progress, assessors should document both current state and planned improvements. Biometric data, as the highest sensitivity classification, warrants focused testing to confirm encryption meets or exceeds AES-256 standards. The data classification schema being in development may limit the ability to fully assess whether all sensitive data categories are identified and encrypted appropriately.
