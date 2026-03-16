# GV.OC-05: External Dependencies Test Procedures

**CSF Subcategory:** GV.OC-05 - Outcomes, capabilities, and services that the organization depends on are understood and communicated

---

## Test Procedures

1. **Review external dependency inventory**
   - Request documented inventory of external dependencies (cloud providers, SaaS tools, ISPs)
   - Verify AWS as primary cloud provider is documented with dependency mapping
   - Confirm critical third-party services identified (e.g., Splunk, CrowdStrike, ServiceNow)

2. **Validate single points of failure analysis**
   - Review whether external dependencies have been assessed for single points of failure
   - Verify redundancy or contingency plans exist for critical dependencies
   - Check that dependency risks are reflected in the risk register

3. **Interview Gerry on dependency management**
   - Ask how new external dependencies are evaluated and approved
   - Verify process exists for monitoring dependency health and availability
   - Confirm awareness of supply chain risks from critical dependencies

4. **Examine contingency planning for key dependencies**
   - Review business continuity plans for critical external service failures
   - Verify contractual protections (SLAs, escrow) with critical providers
   - Check that dependency failure scenarios are included in tabletop exercises

## Evidence Requests

- [ ] External dependency inventory
- [ ] Dependency risk assessment or single point of failure analysis
- [ ] Business continuity plans addressing external service failures
- [ ] Critical vendor SLA documentation

## Notes

Alma's reliance on AWS infrastructure, Splunk for SIEM, and CrowdStrike for MDR creates concentrated dependency risk. Assessment should verify these dependencies are formally tracked beyond the vendor risk program.
