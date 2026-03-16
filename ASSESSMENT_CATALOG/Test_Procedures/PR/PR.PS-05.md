# PR.PS-05: Installation and Execution of Unauthorized Software Prevention Test Procedures

**CSF Subcategory:** PR.PS-05 - Installation and execution of unauthorized software is prevented

---

## Test Procedures

1. **Review application control policy and standards**
   - Obtain the organization's application control or software restriction policy
   - Verify the policy defines what constitutes authorized versus unauthorized software
   - Confirm the policy specifies the enforcement mechanism (allowlisting, blocklisting, or hybrid approach)
   - Check that the policy addresses all endpoint types (workstations, laptops, servers, Kubernetes nodes)
   - Verify the policy establishes an exception process for legitimate software not on the approved list

2. **Examine application control deployment and coverage**
   - Identify the application control solution(s) in use (e.g., SentinelOne, AppLocker, SELinux, Kubernetes admission controllers)
   - Verify deployment coverage across the endpoint population (workstations, laptops, servers)
   - Confirm the solution is operating in enforcement mode, not just audit/monitor mode
   - Identify any endpoints or system types excluded from application control and document the justification
   - Verify Kubernetes nodes have restrictions on unauthorized container execution
   - Check that container admission controllers enforce image source and signing policies

3. **Validate the authorized software inventory**
   - Obtain the organization's authorized software list or application catalog
   - Verify the list is maintained and updated on a regular cadence
   - Confirm each authorized application has a documented business justification and owner
   - Check that the authorized list is synchronized with the application control enforcement tool
   - Review the process for adding new software to the authorized list (approval workflow, security review)

4. **Test application control enforcement effectiveness**
   - Attempt to install or execute a benign unauthorized application on a sample workstation (with prior authorization from system owner)
   - Verify the application control solution blocks the execution and generates an alert
   - Review recent application control block/deny logs to confirm the solution is actively preventing unauthorized software
   - Test that users cannot bypass application control through common techniques (portable executables, script interpreters, alternate execution paths)
   - Verify that blocked execution events are logged and reviewed by security operations

5. **Assess administrative privilege restrictions for software installation**
   - Verify that standard users do not have administrative privileges to install software
   - Confirm that local administrator access is restricted and monitored
   - Review the process for granting temporary elevated privileges for legitimate software installation needs
   - Check that developer workstations have appropriate controls even with elevated privileges
   - Verify that server environments restrict software installation to authorized deployment pipelines

---

## Evidence Requests

- [ ] Application control / software restriction policy
- [ ] SentinelOne (or equivalent) deployment dashboard showing coverage percentage
- [ ] Application control configuration showing enforcement mode status
- [ ] Authorized software inventory or application catalog
- [ ] Software approval workflow documentation
- [ ] Application control block/deny logs (last 30 days)
- [ ] Kubernetes admission controller configuration
- [ ] Container image registry allowlist configuration
- [ ] Local administrator privilege audit report
- [ ] Exception requests and approvals for non-standard software (5-10 examples)

---

## Notes

This test procedure evaluates the organization's ability to prevent unauthorized software from executing in the environment. Application control is one of the most effective preventive controls but also one of the most operationally challenging to maintain. Key considerations include the balance between security and developer productivity, coverage gaps on servers versus workstations, and the effectiveness of controls in containerized environments where traditional application control may not apply.
