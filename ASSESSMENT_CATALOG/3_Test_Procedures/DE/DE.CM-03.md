# DE.CM-03: Personnel Activity Monitoring Test Procedures

**CSF Subcategory:** DE.CM-03 — Personnel activity and technology usage are monitored to find potentially adverse events

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Assess user behavior analytics capabilities**
   - Review GuardDuty behavioral baseline capabilities for AWS API call patterns
   - Evaluate O365 ATP user behavior analytics for email and collaboration activity
   - Determine whether dedicated UBA tooling is deployed or planned
   - Assess detection coverage for insider threat indicators

2. **Verify logical access monitoring**
   - Confirm CloudTrail captures all IAM authentication events including failures
   - Verify Active Directory authentication log collection on the Windows Domain Controller
   - Test detection of credential stuffing, brute force, and impossible travel scenarios
   - Review monitoring for account lockout events and their investigation workflow

3. **Evaluate technology usage monitoring**
   - Review Slack workspace monitoring for malicious content and policy violations
   - Assess SentinelOne endpoint monitoring for unauthorized software usage
   - Verify monitoring of privileged account usage beyond normal job functions
   - Confirm that monitoring respects employee privacy requirements and is documented in policy

4. **Assess deception technology posture**
   - Determine whether honeypots, honeytokens, or canary accounts are deployed
   - If not deployed, document rationale and future plans
   - Evaluate whether deception technology is in the roadmap following IR Enhancement project

---

## Evidence Requests

- [ ] GuardDuty behavioral detection finding examples
- [ ] O365 ATP user behavior analytics configuration
- [ ] CloudTrail IAM authentication event samples
- [ ] Active Directory authentication log samples
- [ ] Slack monitoring configuration and policy
- [ ] SentinelOne application control policy
- [ ] Employee monitoring policy or acceptable use policy

---

## Notes

This test procedure evaluates Alma's monitoring of personnel activity and technology usage. The absence of dedicated UBA tooling means Alma relies on platform-native behavioral analytics from GuardDuty and O365 ATP. The SaaS continuous authentication context makes insider threat detection particularly relevant given the sensitivity of the authentication data Alma processes.
