# DE.CM-09: Computing Environment Monitoring Test Procedures

**CSF Subcategory:** DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Verify common attack vector monitoring**
   - Confirm O365 ATP with Alma-specific rules monitors inbound/outbound email threats
   - Verify SentinelOne monitors web downloads and file activity on endpoints
   - Review Slack monitoring for malicious links and suspicious file uploads
   - Test PagerDuty escalation path for critical detections outside business hours

2. **Assess authentication attack detection**
   - Verify CloudTrail monitoring of IAM authentication failures and MFA challenge failures
   - Confirm Active Directory Kerberos and NTLM authentication anomaly detection
   - Review GuardDuty findings for brute force and credential access from malicious IPs
   - Test impossible travel detection capabilities

3. **Evaluate configuration drift monitoring**
   - Verify AWS Config monitors resource configurations against security baselines
   - Confirm SentinelOne Application Control monitors unauthorized software installations
   - Review SNS notification configuration for AWS Config compliance findings
   - Pull sample of recent configuration drift detections and remediation actions

4. **Test endpoint health and integrity monitoring**
   - Verify SentinelOne real-time malware detection and behavioral analysis on managed endpoints
   - Confirm SentinelOne anti-tamper protection prevents unauthorized agent modification
   - Review vulnerability scan summary for missing critical patches
   - Assess CloudTrail detection of unauthorized AMI, Lambda, and container image modifications

---

## Evidence Requests

- [ ] O365 ATP configuration including Alma-specific custom threat rules
- [ ] SentinelOne detection policy configuration
- [ ] Slack monitoring configuration
- [ ] AWS Config rules and compliance dashboard
- [ ] SentinelOne Application Control policy and recent findings
- [ ] Vulnerability scan summary report
- [ ] SentinelOne endpoint health dashboard
- [ ] CloudTrail events for infrastructure modification detection (sample)

---

## Notes

This test procedure evaluates monitoring of Alma's computing environment including endpoints, cloud infrastructure, email, and collaboration platforms. SentinelOne and O365 ATP provide the primary detection capabilities for endpoints and email respectively, while AWS Config and CloudTrail monitor cloud infrastructure integrity. The breadth of DE.CM-09 (5 implementation examples) reflects the comprehensive scope of computing environment monitoring required for a SaaS company handling continuous authentication data.
