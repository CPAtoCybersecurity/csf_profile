# ID.AM-03: Network Communication and Data Flow Test Procedures

**CSF Subcategory:** ID.AM-03 - Representations of the organization's authorized network communication and internal and external network data flows are maintained

---

## Test Procedures

1. **Review Network Architecture Documentation**
   - Obtain current network architecture diagrams from Confluence
   - Verify diagrams include internal network segments, VPCs, and subnets
   - Confirm external connectivity points are documented
   - Check that diagrams include third-party connections

2. **Validate Data Flow Documentation**
   - Review documented data flows between internal systems
   - Verify third-party data flow agreements and documentation
   - Check that data flow diagrams include classification levels
   - Confirm cloud (IaaS) network flows are documented

3. **Compare Documentation to Actual State**
   - Review AWS VPC Flow Logs for active traffic patterns
   - Compare security group rules against documented allowed flows
   - Identify undocumented network connections or data flows
   - Verify firewall rules align with documented architecture

4. **Assess Currency of Documentation**
   - Check last update date on network diagrams
   - Review change management records for recent network changes
   - Verify documentation was updated following recent changes
   - Confirm review cadence for third-party data flow documentation

5. **Review Port and Protocol Documentation**
   - Obtain documentation of expected network ports and protocols
   - Compare against actual traffic observed in flow logs
   - Identify any unexpected ports or protocols in use

## Evidence Requests

- [ ] Network architecture diagrams (current version)
- [ ] Data flow documentation (internal and external)
- [ ] AWS VPC Flow Log samples
- [ ] Security group configuration export
- [ ] Firewall rule documentation
- [ ] Third-party connectivity agreements

## Notes

Network documentation accuracy degrades rapidly in cloud environments with frequent infrastructure changes. Prioritize validation of cloud network flows against documentation.
