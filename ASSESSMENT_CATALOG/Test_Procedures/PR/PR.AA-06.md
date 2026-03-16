# PR.AA-06: Physical Access Management Test Procedures

**CSF Subcategory:** PR.AA-06 - Physical access to assets is managed, monitored, and enforced commensurate with risk

---

## Test Procedures

1. **Review physical access control policy and procedures**
   - Obtain Physical Security Policy and access control procedures
   - Verify policy defines zones based on asset sensitivity (public, restricted, high-security)
   - Confirm policy addresses visitor management, escort requirements, and temporary access
   - Check that physical access requirements are aligned with data classification and risk levels

2. **Examine badge and credential management**
   - Review the badge issuance process and verify identity proofing occurs before badge activation
   - Confirm badge access levels correspond to documented role-based physical access matrix
   - Verify that badge deactivation is included in the employee offboarding workflow
   - Check for badge inventory reconciliation procedures (lost, stolen, or unreturned badges)
   - Sample 5-10 recent terminations to verify badge deactivation timing

3. **Assess physical access monitoring and logging**
   - Review badge reader and access control system (ACS) log retention and monitoring
   - Verify that access logs capture entry and exit events with timestamps and identity
   - Confirm that after-hours access to sensitive areas generates alerts or review queues
   - Check that tailgating prevention measures are in place (mantraps, turnstiles, awareness training)
   - Verify that physical access logs are available for incident investigation

4. **Test data center and server room access controls**
   - Verify that the on-premises Windows DC server room requires multi-factor physical access
   - Confirm that data center access is restricted to authorized IT and security personnel
   - Review visitor logs for the server room over the past quarter
   - Check that environmental monitoring (temperature, humidity, water detection) is operational
   - Verify that security cameras cover entry points and critical infrastructure areas

5. **Evaluate visitor management process**
   - Review visitor registration and approval procedures
   - Verify that visitors are logged with name, company, host, purpose, and entry/exit times
   - Confirm that visitors are escorted in restricted areas
   - Check that visitor badges are visually distinct and collected upon departure
   - Sample visitor logs for completeness over the past 30 days

6. **Assess AWS physical security reliance**
   - Review AWS shared responsibility model documentation for physical security controls
   - Verify that Alma relies on AWS SOC 2 Type II reports for data center physical security assurance
   - Confirm that AWS region and availability zone selection considers physical security requirements
   - Check that physical security of the Redwood City office accounts for hybrid architecture risks

---

## Evidence Requests

- [ ] Physical Security Policy and procedures
- [ ] Physical access zone map with classification levels
- [ ] Badge issuance workflow and role-based access matrix
- [ ] Sample termination badge deactivation records (5-10 examples)
- [ ] Access control system logs for sensitive areas (last 30 days)
- [ ] After-hours access alerts or review reports
- [ ] Server room visitor log (last quarter)
- [ ] Environmental monitoring system configuration and alert history
- [ ] Security camera coverage map
- [ ] Visitor management policy and sample visitor logs (last 30 days)
- [ ] AWS SOC 2 Type II report (physical security sections)

---

## Notes

This test procedure validates that physical access controls protect organizational assets commensurate with risk. Key maturity indicators include risk-based zone classification, automated badge lifecycle management tied to HR events, monitored access logging with alerting, and documented visitor management. At Alma Security, the on-premises Windows Domain Controller in Redwood City requires heightened physical protection since it manages Active Directory authentication for the hybrid environment. AWS physical security is inherited through the shared responsibility model and should be validated via AWS compliance reports. The 300-person headcount and Series B growth trajectory mean physical access controls must scale as the Redwood City office grows.
