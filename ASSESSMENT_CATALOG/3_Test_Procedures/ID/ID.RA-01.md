# ID.RA-01: Vulnerability Identification and Recording Test Procedures

**CSF Subcategory:** ID.RA-01 - Vulnerabilities in assets are identified, validated, and recorded

---

## Test Procedures

1. **Review Vulnerability Scanning Program**
   - Obtain Tenable scan configuration and scheduling documentation
   - Verify weekly scan cadence across all managed assets
   - Review AWS Inspector assessment configuration
   - Confirm scan coverage percentage across the asset inventory

2. **Validate Scanning Coverage**
   - Compare scanned asset list against hardware and software inventory
   - Identify assets excluded from scanning and document justification
   - Verify container image scanning coverage
   - Check for application-level vulnerability testing (SAST/DAST)

3. **Assess Triage and Remediation Process**
   - Review vulnerability triage criteria (CVSS-based severity)
   - Verify remediation SLAs by severity level
   - Sample 5 recent critical/high vulnerabilities and track remediation
   - Check ServiceNow ticket creation and assignment for findings

4. **Review Vulnerability Recording**
   - Verify all scan findings are recorded in ServiceNow
   - Confirm remediation owners are assigned for all findings
   - Check for vulnerability age tracking and escalation
   - Review reporting and metrics for vulnerability management

5. **Assess Non-Technical Vulnerability Identification**
   - Review processes for identifying architectural vulnerabilities
   - Check for physical facility vulnerability assessments
   - Verify process and procedure reviews for exploitable weaknesses
   - Confirm threat intelligence integration for new vulnerability alerts

## Evidence Requests

- [ ] Tenable scan configuration and schedule
- [ ] AWS Inspector assessment reports
- [ ] Scan coverage report (assets scanned vs. total)
- [ ] Vulnerability remediation SLA documentation
- [ ] Sample critical/high vulnerability tickets with remediation evidence
- [ ] Vulnerability management metrics dashboard

## Notes

Strong scanning coverage for traditional infrastructure. Focus assessment on gaps in application security testing, container runtime scanning, and non-technical vulnerability identification.
