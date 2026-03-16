# ID.AM-05: Asset Classification and Prioritization Test Procedures

**CSF Subcategory:** ID.AM-05 - Assets are prioritized based on classification, criticality, resources, and impact on the mission

---

## Test Procedures

1. **Review Classification Framework**
   - Obtain the asset classification policy and criteria
   - Verify classification tiers are defined (Critical, High, Medium, Low)
   - Confirm criteria include business impact, data sensitivity, and regulatory requirements
   - Check that crown jewel assets are explicitly identified

2. **Validate Classification Application**
   - Sample 10 assets from the inventory across different tiers
   - Verify each sampled asset has an assigned classification
   - Confirm classification rationale is documented
   - Check that AWS resource criticality tags match documented classifications

3. **Assess Prioritization Process**
   - Review the process for prioritizing assets
   - Verify business impact analysis completion rates
   - Confirm asset owners have validated classifications
   - Check that non-production environments have assigned classifications

4. **Review Classification Currency**
   - Verify classification review cadence (quarterly risk review)
   - Check for classification updates following organizational changes
   - Confirm reclassification triggers are defined
   - Review recent examples of classification changes

5. **Validate Crown Jewel Documentation**
   - Obtain the crown jewel asset list
   - Verify each crown jewel has documented business impact
   - Confirm protective controls are mapped to crown jewel assets
   - Check that crown jewel list is reviewed and approved by leadership

## Evidence Requests

- [ ] Asset classification policy
- [ ] Crown jewel asset register
- [ ] Business impact analysis records
- [ ] AWS resource criticality tagging report
- [ ] Quarterly risk review minutes showing asset classification discussion
- [ ] Asset classification change log

## Notes

Pay attention to gaps between production and non-production classification. Development environments often contain production data copies and should be classified accordingly.
