# PR.PS-04: Log Record Generation and Monitoring Test Procedures

**CSF Subcategory:** PR.PS-04 - Log records are generated and made available for continuous monitoring

---

## Test Procedures

1. **Review logging policy and requirements**
   - Obtain the organization's logging and monitoring policy
   - Verify the policy defines what events must be logged across system types (authentication, authorization, configuration changes, data access, errors)
   - Confirm the policy specifies log retention requirements aligned with regulatory and business needs
   - Check that the policy addresses log integrity protection (tamper-evidence, write-once storage)
   - Verify the policy defines roles and responsibilities for log management and review

2. **Examine log source coverage and collection**
   - Obtain an inventory of all systems, applications, and infrastructure that generate security-relevant logs
   - Verify log collection is configured for critical asset categories: identity providers, firewalls, WAFs, operating systems, databases, applications, cloud control planes
   - Confirm cloud-native logging services are enabled (CloudTrail, VPC Flow Logs, GuardDuty, EKS audit logs)
   - Identify any systems or applications that are not forwarding logs to the central collection point
   - Verify Kubernetes cluster audit logging is enabled and captures API server events
   - Check that container runtime logs are collected and correlated with orchestration events

3. **Validate centralized log aggregation and management**
   - Identify the centralized log management platform (SIEM, log aggregation tool)
   - Verify logs from all identified sources are successfully ingested into the central platform
   - Confirm log parsing and normalization produces structured, searchable records
   - Review log storage capacity planning and retention configuration
   - Verify that log ingestion failures generate alerts to the operations team
   - Check that log data is indexed for query performance adequate for incident investigation

4. **Test monitoring and anomaly detection**
   - Review configured monitoring rules, alerts, and correlation logic
   - Verify alerts are generated for high-priority events (privilege escalation, unauthorized access attempts, configuration changes, data exfiltration indicators)
   - Test a sample alert by reviewing recent triggered alerts and confirming appropriate response
   - Assess whether monitoring covers 24/7 or business-hours-only and document any coverage gaps
   - Verify alert routing reaches the appropriate response team (SOC, on-call engineer)
   - Check false positive rates and alert tuning practices

5. **Assess log integrity and access controls**
   - Verify log storage has appropriate access controls (read-only for analysts, write restricted to log collection systems)
   - Confirm logs cannot be modified or deleted by the systems or users they monitor
   - Check for log integrity mechanisms (checksums, immutable storage, CloudTrail log file validation)
   - Verify that administrative access to log systems is audited and monitored
   - Review backup and disaster recovery procedures for log data

---

## Evidence Requests

- [ ] Logging and monitoring policy
- [ ] Log source inventory with collection status for each source
- [ ] SIEM or log aggregation platform configuration documentation
- [ ] CloudTrail, VPC Flow Logs, and EKS audit log configuration evidence
- [ ] Log ingestion and coverage dashboard screenshots
- [ ] Monitoring rule inventory with alert routing configuration
- [ ] Sample of recent triggered alerts and response actions (5-10 examples)
- [ ] Log retention configuration and capacity planning documentation
- [ ] Log access control configuration and audit logs
- [ ] 24/7 monitoring coverage documentation or on-call rotation schedule

---

## Notes

This test procedure validates that logging is comprehensive, centralized, and actively monitored. Key maturity indicators include complete log source coverage, centralized aggregation with structured parsing, real-time alerting on high-priority events, and 24/7 monitoring capability. Organizations often have strong cloud-native logging but gaps in application-layer logging and on-premises systems. The transition from log collection to active monitoring and anomaly detection is a critical maturity threshold.
