# ID.AM-02: Software and Service Inventory Test Procedures

**CSF Subcategory:** ID.AM-02 - Inventories of software, services, and systems managed by the organization are maintained

---

## Test Procedures

1. **Obtain Software Inventory Records**
   - Request the current software inventory from ServiceNow CMDB
   - Request AWS Systems Manager software inventory reports
   - Obtain SaaS application registry from IT procurement

2. **Validate Inventory Completeness**
   - Compare CMDB software records against endpoint agent discovery data
   - Cross-reference AWS Systems Manager inventory with EC2 instance list
   - Verify SaaS applications against SSO/IdP authentication logs
   - Identify any software discovered by agents not present in CMDB

3. **Sample Verification**
   - Select 5 software entries from the inventory at random
   - Confirm license status, version, and owner for each sampled entry
   - Verify the software is installed on the documented systems
   - Check that end-of-life software is flagged appropriately

4. **Assess Container and Cloud Service Coverage**
   - Review container image registry for completeness
   - Verify cloud service inventory includes IaaS, PaaS, and SaaS
   - Check for automated discovery mechanisms for new services

5. **Review Update Processes**
   - Verify inventory update triggers (new installs, decommissions, audits)
   - Confirm frequency of automated inventory reconciliation
   - Review change management integration for software changes

## Evidence Requests

- [ ] ServiceNow CMDB software inventory export
- [ ] AWS Systems Manager inventory report
- [ ] SaaS application registry
- [ ] Endpoint agent discovery report
- [ ] Container image registry listing
- [ ] Software lifecycle tracking records

## Notes

Focus on identifying shadow IT and unapproved software installations. Pay particular attention to SaaS applications that may bypass centralized procurement.
