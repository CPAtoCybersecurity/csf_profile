# PR.PS-01: Configuration Management Practices Test Procedures

**CSF Subcategory:** PR.PS-01 - Configuration management practices are established and applied

---

## Test Procedures

1. **Review configuration management policy and standards**
   - Obtain the organization's configuration management policy documentation
   - Verify the policy defines hardened baseline standards for each platform type (servers, workstations, containers, network devices)
   - Confirm the policy specifies an authoritative source for baseline configurations (e.g., CIS Benchmarks, DISA STIGs, vendor hardening guides)
   - Verify the policy addresses baseline exceptions and the approval process for deviations

2. **Examine hardened baseline documentation and enforcement**
   - Obtain documented baseline configurations for each major platform (Linux, Windows, Kubernetes nodes, containers)
   - Verify baselines are derived from an industry-recognized source and tailored for the organization's environment
   - Confirm baselines are version-controlled and maintained in an infrastructure-as-code repository
   - Check that baseline changes follow a change management process with review and approval

3. **Validate automated configuration compliance monitoring**
   - Identify the tools used for continuous configuration compliance checking (e.g., AWS Config, Chef InSpec, Ansible, SCAP scanners)
   - Verify compliance rules are mapped to the documented baseline standards
   - Review compliance dashboards or reports showing current compliance rates across the environment
   - Confirm non-compliant resources generate alerts routed to responsible owners
   - Verify deviation alerting thresholds and escalation procedures

4. **Test configuration drift detection and remediation**
   - Select a sample of 10-15 systems across platform types
   - Compare actual configurations against documented baselines using automated tooling
   - Identify any configuration drift and verify it was detected by monitoring tools
   - Review remediation records for previously detected drift to confirm timely correction
   - Verify that remediation actions restore systems to compliant state without operational disruption

5. **Assess lifecycle management of baseline configurations**
   - Review the schedule for baseline review and updates (at minimum annually and upon significant change)
   - Verify baselines have been updated to address new vulnerabilities or platform changes
   - Confirm retired or decommissioned platforms have their baselines archived appropriately
   - Check that new platform types are assigned baselines before deployment to production

---

## Evidence Requests

- [ ] Configuration management policy document
- [ ] Hardened baseline standards for each platform (Amazon Linux 2, Ubuntu, Windows Server, Kubernetes)
- [ ] Infrastructure-as-code repository access or export showing baseline definitions
- [ ] AWS Config rules inventory and compliance dashboard screenshots
- [ ] Configuration compliance scan reports (most recent 3 months)
- [ ] Deviation alert samples and remediation tickets (5-10 examples)
- [ ] Change management records for baseline modifications
- [ ] Baseline review schedule and last review date evidence

---

## Notes

This test procedure validates that configuration management is not just documented but actively enforced and monitored. Key maturity indicators include infrastructure-as-code enforcement of baselines, automated compliance checking with drift detection, and evidence that deviations are detected and remediated within defined SLAs. Organizations with high compliance rates (90%+) but no automated drift detection may still have blind spots in dynamic environments like Kubernetes clusters.
