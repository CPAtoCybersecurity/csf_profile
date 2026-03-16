# ID.AM-07: Data Inventory and Classification Test Procedures

**CSF Subcategory:** ID.AM-07 - Inventories of data and corresponding metadata for designated data types are maintained

---

## Test Procedures

1. **Review Data Classification Policy**
   - Obtain the data classification policy defining designated data types
   - Verify classification tiers (Public, Internal, Confidential, Restricted)
   - Confirm handling requirements for each classification tier
   - Check that designated data types (PII, PHI, financial) are defined

2. **Validate Data Discovery Results**
   - Review data discovery scan results for primary databases
   - Review S3 bucket scanning results for sensitive data
   - Verify discovered data instances match expected locations
   - Identify any unexpected sensitive data locations

3. **Assess Metadata and Tagging**
   - Sample 5 data stores from the inventory
   - Verify each has assigned data classification tags
   - Confirm data owner, provenance, and location metadata
   - Check for unclassified data stores containing sensitive data

4. **Review Data Inventory Completeness**
   - Compare data inventory against system inventory
   - Verify all databases and storage services are included
   - Check that structured and unstructured data sources are covered
   - Identify data stores not yet scanned by discovery tools

5. **Assess Ongoing Discovery Process**
   - Review data discovery scan schedule and coverage
   - Verify new data stores are scanned upon provisioning
   - Check for continuous versus ad hoc discovery processes
   - Confirm discovery results feed into the data inventory

## Evidence Requests

- [ ] Data classification policy
- [ ] Data discovery scan results
- [ ] Data inventory with metadata
- [ ] S3 bucket classification report
- [ ] Data owner assignments
- [ ] Data discovery tool configuration

## Notes

The pilot nature of Alma's data classification program means coverage gaps are expected. Focus on whether the methodology is sound and scalable, and identify the highest-priority gaps for formalization.
