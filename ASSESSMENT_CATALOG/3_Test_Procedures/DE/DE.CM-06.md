# DE.CM-06: External Service Provider Monitoring Test Procedures

**CSF Subcategory:** DE.CM-06 — External service provider activities and services are monitored to find potentially adverse events

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Verify vendor access monitoring**
   - Confirm CloudTrail logs all API activity from third-party vendor IAM roles
   - Review GuardDuty monitoring for anomalous patterns from external principal ARNs
   - Verify vendor access sessions use time-limited IAM role assumptions with session logging
   - Review SOC weekly log review process for third-party access activity

2. **Assess cloud service provider monitoring**
   - Verify CloudTrail and GuardDuty monitoring for AWS service-level activity
   - Confirm O365 ATP monitoring for Microsoft cloud service threats
   - Review SaaS application admin console monitoring in weekly manual log reviews
   - Identify third-party SaaS services without active security monitoring

3. **Evaluate vendor activity validation**
   - Pull sample of recent vendor access sessions from CloudTrail
   - Cross-reference vendor activity against approved change tickets and maintenance windows
   - Verify that unauthorized vendor actions would be detected and flagged
   - Review vendor access termination process when engagements conclude

4. **Review service provider SLA monitoring**
   - Confirm monitoring of AWS service health dashboards for availability events
   - Verify alerting for service provider security advisories and incidents
   - Review contractual security monitoring obligations for key service providers

---

## Evidence Requests

- [ ] CloudTrail logs showing vendor IAM role assumption events (sample)
- [ ] GuardDuty findings related to external principal activity (if any)
- [ ] Vendor access approval and change ticket cross-reference
- [ ] List of third-party SaaS applications with monitoring status
- [ ] Service provider security SLA documentation

---

## Notes

This test procedure evaluates monitoring of external service provider activities across Alma's environment. As an AWS-centric SaaS company, vendor access primarily occurs through IAM role assumption, providing CloudTrail-based audit trails. The gap in monitoring third-party SaaS admin consoles relies on manual weekly reviews until automation is implemented.
