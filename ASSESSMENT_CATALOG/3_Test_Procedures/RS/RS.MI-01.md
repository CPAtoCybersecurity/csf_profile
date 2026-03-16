# RS.MI-01: Incident Containment Test Procedures

**CSF Subcategory:** RS.MI-01 - Incidents are contained

---

## Test Procedures

1. **Review containment procedures and capabilities**
   - Obtain documented containment procedures from the incident response playbook
   - Verify procedures address both automated and manual containment actions
   - Confirm containment strategies are defined for different incident types (malware, data exfiltration, unauthorized access)
   - Check that third-party containment coordination procedures are documented (ISP, MSSP)

2. **Examine automated containment capabilities**
   - Review SentinelOne automated quarantine and network isolation configuration
   - Verify GuardDuty auto-remediation actions for AWS infrastructure containment
   - Confirm automated containment triggers and thresholds are documented
   - Check that automated containment actions are logged and reversible

3. **Validate manual containment procedures for complex scenarios**
   - Review procedures for manually selecting and performing containment actions
   - Verify SOC analysts have documented authority and procedures for manual containment
   - Confirm manual containment playbooks exist for scenarios beyond automated capabilities
   - Check that manual containment includes network segmentation, account disablement, and system isolation options

4. **Test containment effectiveness through recent incidents**
   - Pull 3-5 recent incidents requiring containment from ServiceNow
   - Verify containment was applied promptly after incident declaration
   - Confirm containment actions matched incident type and severity
   - Check that containment prevented further damage without unnecessary operational disruption
   - Verify remediation VLAN or equivalent isolation capability is operational

---

## Evidence Requests

- [ ] Incident containment procedures from response playbook
- [ ] SentinelOne quarantine and network isolation configuration
- [ ] GuardDuty auto-remediation configuration
- [ ] Manual containment playbooks for complex scenarios
- [ ] Containment authority matrix (who can authorize what actions)
- [ ] 3-5 incident records showing containment actions taken
- [ ] Remediation VLAN or network isolation architecture documentation
- [ ] Third-party containment coordination procedures

---

## Notes

This test procedure validates that the organization can effectively contain incidents through both automated and manual means. SentinelOne automated quarantine provides rapid endpoint containment, while GuardDuty auto-remediation addresses AWS infrastructure. Manual containment procedures are critical for complex, multi-vector incidents that exceed automated response capabilities. Key maturity indicators include rapid automated containment for known patterns, documented manual procedures for complex scenarios, and evidence that containment actions were effective without excessive operational disruption. The availability of a remediation VLAN for automatic endpoint isolation indicates advanced containment capability.
