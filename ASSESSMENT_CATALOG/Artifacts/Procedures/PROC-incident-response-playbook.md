# Incident Response Playbook (Excerpt)

| Field | Value |
|-------|-------|
| **Procedure ID** | ALMA-SOP-2025-010 |
| **Version** | 1.4 |
| **Effective Date** | March 1, 2025 |
| **Last Reviewed** | February 16, 2026 |
| **Procedure Owner** | Nadia Khan, Detection & Response Lead |
| **Approved By** | CISO |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This playbook defines the detection, containment, eradication, and recovery procedures for security incidents at Alma Security. This document is an excerpt covering the primary detection and response workflows; the full playbook includes additional scenario-specific runbooks.

---

## 2. Severity Classification

| Severity | Description | Examples | Response SLA |
|----------|-------------|----------|-------------|
| SEV-1 (Critical) | Active compromise of crown jewel systems or confirmed data exfiltration | Biometric data breach, auth engine compromise, active ransomware | Immediate; all-hands war room |
| SEV-2 (High) | Confirmed compromise of non-crown-jewel production systems or credible threat | Compromised employee account with lateral movement, production server malware | 1 hour to begin investigation |
| SEV-3 (Medium) | Suspicious activity requiring investigation; no confirmed compromise | Anomalous login patterns, failed brute force attempts, phishing email received | 4 hours to begin investigation |
| SEV-4 (Low) | Minor security event; informational | Policy violation, blocked malware, routine phishing attempt reported | Next business day |

---

## 3. Detection Sources

| Source | Tool | Alert Routing |
|--------|------|---------------|
| Endpoint threats | SentinelOne EDR | Automated ticket + Slack #soc-alerts |
| Cloud threats | AWS GuardDuty | Automated ticket + Slack #soc-alerts |
| Network anomalies | VPC Flow Logs + GuardDuty | Automated ticket |
| Email threats | Email gateway + employee reports to phishing@almasecurity.com | D&R triage queue |
| Application anomalies | CloudWatch + custom detections | Automated ticket |
| Employee reports | #security-alerts Slack / phishing@almasecurity.com | D&R triage queue |
| Third-party intelligence | Threat intel feeds | D&R daily review |

---

## 4. Phase 1: Detection and Triage

### 4.1 Initial Triage (D&R Team, 0-15 minutes)

1. Alert received via automated routing or employee report
2. D&R analyst reviews alert details:
   - Source system and alert type
   - Affected asset(s) and their criticality (crown jewel status)
   - User(s) involved
   - Timeline of activity
3. Assign initial severity classification
4. For SEV-1 or SEV-2: immediately notify CISO and D&R Lead (Nadia Khan)
5. Create incident ticket in ServiceNow with:
   - Incident ID (auto-generated: INC-YYYY-NNNN)
   - Severity level
   - Affected systems/users
   - Initial observations
   - Assigned responder(s)

### 4.2 Investigation (D&R Team, 15-60 minutes)

1. Gather additional context:
   - SentinelOne: Deep Visibility query for process tree, network connections, file modifications
   - GuardDuty: Finding details including source IP, API calls, resource affected
   - CloudTrail: API activity for affected IAM identities
   - Okta: Authentication logs for affected user accounts
2. Determine scope of compromise:
   - How many systems/accounts are affected?
   - What data may have been accessed?
   - Is lateral movement detected?
   - Is the threat still active?
3. Confirm or adjust severity classification based on investigation findings
4. Update incident ticket with investigation findings

---

## 5. Phase 2: Containment

### 5.1 SentinelOne Endpoint Containment

For confirmed endpoint compromise:

1. **Network quarantine:** Initiate SentinelOne network quarantine on affected endpoint
   - This isolates the endpoint from the network while maintaining agent communication
   - Verify quarantine is active in SentinelOne console
2. **Process kill:** Use SentinelOne to terminate malicious processes identified in the investigation
3. **Account disable:** Disable affected user account(s) in Okta
4. **Credential rotation:** Reset passwords and revoke active sessions for affected accounts

### 5.2 AWS GuardDuty / Cloud Containment

For confirmed cloud infrastructure compromise:

1. **IAM containment:** Attach a deny-all IAM policy to compromised IAM user/role
   ```
   Policy: ALMA-EmergencyDenyAll
   Effect: Deny, Action: *, Resource: *
   ```
2. **Security group isolation:** Modify security groups on affected EC2 instances to restrict all inbound/outbound traffic except management access from the D&R jump box
3. **Access key rotation:** Deactivate compromised access keys; issue new keys only after root cause is confirmed
4. **S3 containment:** If S3 exfiltration detected, enable S3 Block Public Access (if not already) and review bucket policies

### 5.3 Network Containment

For lateral movement or network-level threats:

1. Implement temporary network ACL rules to isolate affected network segments
2. Block malicious IP addresses/domains at the network perimeter and DNS level
3. Capture network traffic from affected segments for forensic analysis (if not already captured)

---

## 6. Phase 3: Eradication

### 6.1 Endpoint Eradication

1. Use SentinelOne rollback to restore endpoint to pre-infection state (if available)
2. If rollback is insufficient: reimage endpoint from known-good image
3. Scan all endpoints in the same network segment for indicators of compromise (IOCs)
4. Update SentinelOne custom detection rules with IOCs from the incident

### 6.2 Cloud Eradication

1. Terminate compromised EC2 instances; replace from known-good AMI via infrastructure-as-code
2. Rotate all credentials that may have been exposed:
   - IAM access keys and secret keys
   - Database passwords
   - Application secrets in AWS Secrets Manager
3. Review and remediate the initial access vector (e.g., patch exploited vulnerability, fix misconfiguration)
4. Update GuardDuty custom threat lists with IOCs

### 6.3 Email / Phishing Eradication

1. Remove malicious emails from all recipient mailboxes
2. Block sender domain/address at the email gateway
3. Block malicious URLs at the web proxy
4. Reset credentials for any users who interacted with the phishing content

---

## 7. Phase 4: Recovery

1. Restore affected systems from verified clean backups or rebuild from infrastructure-as-code
2. Gradually restore network connectivity for contained systems:
   - Monitor closely for 24 hours after restoration
   - Verify no recurrence of malicious activity
3. Re-enable user accounts after credential rotation and user verification
4. Confirm all IOCs are blocked across detection tools
5. Validate that the exploited vulnerability or misconfiguration has been remediated

---

## 8. Phase 5: Post-Incident Review

### 8.1 Timeline

| Activity | Timeline |
|----------|----------|
| Initial post-incident report | Within 24 hours of incident closure |
| Post-incident review meeting | Within 5 business days of incident closure |
| Final incident report | Within 10 business days |
| Remediation tracking | Ongoing; tracked in Jira |

### 8.2 Review Requirements

The post-incident review must address:

- Timeline reconstruction (from initial compromise to detection to resolution)
- TTD (time to detect) and TTI (time to investigate) metrics
- Root cause analysis
- What worked well in the response
- What could be improved
- Action items with owners and deadlines
- Detection rule improvements to prevent recurrence

---

## 9. Communication

### 9.1 Internal Communication

| Audience | When | Channel |
|----------|------|---------|
| D&R team | Immediately | Slack #soc-alerts (encrypted) |
| CISO | SEV-1/SEV-2: immediately; SEV-3: daily summary | Phone + Slack |
| Executive team | SEV-1: within 1 hour | CISO briefing |
| All employees | If broad awareness needed | Email from CISO |

### 9.2 External Communication

| Audience | When | Owner |
|----------|------|-------|
| Customers (if data affected) | Per contractual notification requirements | CISO + Legal |
| Regulators | Per regulatory requirements (GDPR: 72 hours) | Legal + CISO |
| Law enforcement | If criminal activity suspected | Legal + CISO |

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Incident Communication Plan | ALMA-SOP-2025-010a |
| Business Continuity Plan | ALMA-SOP-2025-013 |
| Evidence Preservation Guide | ALMA-SOP-2025-010b |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2025 | N. Khan | Initial playbook |
| 1.1 | June 1, 2025 | N. Khan | Added GuardDuty containment procedures |
| 1.2 | September 1, 2025 | N. Khan | Added SentinelOne rollback procedures; expanded post-incident review |
| 1.3 | December 1, 2025 | N. Khan | Added communication matrix; updated severity definitions |
| 1.4 | February 16, 2026 | N. Khan | Annual review; added network containment section |

---

*This is a fictional example created for educational purposes.*
