# ID.AM-04: Supplier Service Inventory Test Procedures

**CSF Subcategory:** ID.AM-04 - Inventories of services provided by suppliers are maintained

---

## Test Procedures

1. **Obtain Supplier Service Inventory**
   - Request the current supplier service inventory from ServiceNow
   - Obtain vendor contract management records
   - Request AWS Marketplace purchase history

2. **Validate Inventory Completeness**
   - Cross-reference supplier inventory against accounts payable vendor list
   - Check SSO/IdP for SaaS applications not in the supplier inventory
   - Review department expense reports for cloud service subscriptions
   - Verify all IaaS, PaaS, and SaaS providers are inventoried

3. **Sample Verification**
   - Select 5 supplier services at random from the inventory
   - Confirm contract status, renewal date, and service owner
   - Verify security assessment status for each sampled supplier
   - Check that service criticality classification is assigned

4. **Assess Onboarding Process**
   - Review the vendor onboarding process documentation
   - Verify that new vendor requests require security review
   - Check for recent examples of vendors that completed onboarding
   - Identify any vendors that bypassed the onboarding process

5. **Review Inventory Maintenance**
   - Confirm inventory update triggers and frequency
   - Verify decommissioned services are removed from inventory
   - Check for sub-processor (fourth-party) documentation

## Evidence Requests

- [ ] ServiceNow supplier service inventory export
- [ ] Vendor contract management records
- [ ] AWS Marketplace purchase history
- [ ] Vendor onboarding process documentation
- [ ] Recent vendor onboarding examples (2-3)
- [ ] Accounts payable vendor list for cross-reference

## Notes

Department-level SaaS purchases that bypass centralized procurement represent a significant gap. Cross-referencing expense reports and SSO logs helps identify untracked supplier services.
