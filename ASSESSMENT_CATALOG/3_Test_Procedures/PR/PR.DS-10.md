# PR.DS-10: Data-in-Use Protection Test Procedures

**CSF Subcategory:** PR.DS-10 - The confidentiality, integrity, and availability of data-in-use are protected

---

## Test Procedures

1. **Review data-in-use protection policies and standards**
   - Obtain policies addressing protection of data during active processing
   - Verify policy covers memory handling for sensitive data (biometric data, authentication tokens)
   - Confirm policy addresses process isolation and secure computing requirements
   - Validate that data-in-use protection is aligned with data classification levels
   - Check alignment with NIST SP 800-53 SC-04, SC-39, SC-43

2. **Assess memory handling for sensitive data**
   - Review application code and architecture for secure memory handling practices
   - Verify that biometric data is cleared from memory after processing (no persistent memory residue)
   - Confirm authentication tokens and session keys have defined memory lifetimes
   - Test that sensitive data is not written to swap files or crash dumps unencrypted
   - Check that debug/logging configurations do not expose sensitive data in memory
   - Review application frameworks for secure string handling (SecureString equivalents)
   - Validate heap and stack protections are enabled (ASLR, DEP/NX, stack canaries)

3. **Evaluate process isolation controls**
   - Verify Kubernetes pod security standards enforce process isolation
   - Confirm container runtime security settings (read-only root filesystem, no privilege escalation)
   - Test namespace isolation between workloads of different sensitivity levels
   - Validate that SentinelOne monitors for memory injection attacks and process hollowing
   - Check that on-premises Windows Domain Controller enforces credential guard and secure boot
   - Review application sandboxing for services processing biometric data

4. **Test unauthorized data-in-use access prevention**
   - Verify controls preventing unauthorized interprocess communication
   - Test screen capture and clipboard protection for applications handling sensitive data
   - Confirm DLP controls monitor for data exfiltration through memory scraping
   - Validate that hypervisor-level isolation is configured for multi-tenant workloads (if applicable)
   - Review SentinelOne behavioral detection rules for runtime data access anomalies

---

## Evidence Requests

- [ ] Data-in-use protection policy or secure development standards
- [ ] Application architecture documentation for biometric data processing pipeline
- [ ] Kubernetes pod security policy/standards configuration
- [ ] Container runtime security configuration (seccomp profiles, AppArmor/SELinux)
- [ ] Memory handling procedures for sensitive data types
- [ ] SentinelOne behavioral detection policy configuration
- [ ] Windows Credential Guard and Secure Boot configuration evidence
- [ ] Crash dump and swap file encryption settings
- [ ] Secure coding guidelines addressing memory management

---

## Notes

This test procedure addresses an area where most organizations are in early maturity stages, and Alma Security is no exception. Data-in-use protection is inherently more challenging than at-rest or in-transit protection because data must be unencrypted during processing. Given that Alma processes biometric data (its highest sensitivity classification) as part of its continuous authentication platform, the secure handling of this data in memory during active processing is a critical control area. Assessors should focus on the biometric data processing pipeline specifically, and evaluate whether application-level controls compensate for the lack of hardware-based confidential computing (e.g., Intel SGX, AMD SEV). This is an emerging area where establishing baseline practices and a roadmap is more important than achieving full maturity in Q1 2026.
