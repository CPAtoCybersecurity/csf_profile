# DE.AE-06: Adverse Event Information Distribution Test Procedures

**CSF Subcategory:** DE.AE-06 — Information on adverse events is provided to authorized staff and tools

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Verify automated alert routing**
   - Trace GuardDuty finding delivery path from detection to SOC notification (SNS > Slack)
   - Confirm SentinelOne alert routing to SOC console and assigned analysts
   - Verify O365 ATP alert visibility in Microsoft 365 Defender portal
   - Test PagerDuty escalation for after-hours Critical and High severity findings

2. **Assess on-demand access to security findings**
   - Verify SOC analyst access to GuardDuty console, SentinelOne portal, and CloudWatch Logs
   - Confirm incident responders can query VPC Flow Logs via Athena
   - Test that access controls restrict security findings to authorized personnel only

3. **Review automated ticket creation workflow**
   - Verify SentinelOne auto-creates tickets for High/Critical endpoint detections
   - Confirm GuardDuty High-severity findings trigger Lambda-to-ticketing integration
   - Review ticket assignment logic based on SOC rotation schedule

4. **Evaluate manual reporting and escalation**
   - Review process for staff to manually report suspicious activity
   - Verify ticketing system supports manual security ticket creation by non-SOC personnel
   - Confirm SOC Manager severity validation occurs within documented SLA (2 hours)

---

## Evidence Requests

- [ ] SNS-to-Slack integration configuration for GuardDuty alerts
- [ ] PagerDuty escalation policy for security alerts
- [ ] SentinelOne auto-ticketing configuration
- [ ] Lambda function for GuardDuty-to-ticketing integration
- [ ] SOC analyst access provisioning records
- [ ] Sample of auto-generated and manually created security tickets

---

## Notes

This test procedure evaluates how effectively Alma distributes information about adverse events to authorized personnel and tools. The current business-hours SOC with on-call rotation creates a risk window where alert routing delays could extend TTD, a gap the Incident Response Enhancement project aims to address.
