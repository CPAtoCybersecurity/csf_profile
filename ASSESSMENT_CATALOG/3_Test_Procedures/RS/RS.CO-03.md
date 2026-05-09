# RS.CO-03: Incident Information Sharing Test Procedures

**CSF Subcategory:** RS.CO-03 - Information is shared with designated internal and external stakeholders

---

## Test Procedures

1. **Review information sharing policies and agreements**
   - Obtain incident information sharing procedures from the response plan
   - Verify information sharing agreements exist with key external partners and ISACs
   - Confirm procedures address data sanitization before sharing threat intelligence externally
   - Check that sharing protocols specify classification levels and handling requirements

2. **Inventory all external sharing obligations**
   - Obtain a complete list of all information sharing obligations: ISAC memberships, regulatory disclosure requirements, and contractual sharing obligations with customers and partners
   - Verify each obligation has a corresponding documented procedure and named owner
   - Confirm sharing agreements include data sanitization requirements before external disclosure
   - Check that the obligations list was reviewed and updated in the past 12 months (Completeness + Recurrence assertions)
   - Note: internal stakeholder notification (Slack, leadership escalation) is covered in RS.CO-02 and should not be re-examined here

3. **Validate external information sharing practices**
   - Review evidence of TTP sharing with external parties (ISACs, sector peers, threat intel platforms)
   - Verify sensitive data is removed before external sharing
   - Confirm contractual information sharing obligations with customers and partners are met
   - Check that supplier/vendor crisis communication protocols are documented and tested

4. **Test information sharing workflow execution**
   - Walk through a recent incident to verify external information sharing steps were followed
   - Verify that sharing decisions were documented with justification
   - Confirm that information sharing did not compromise the ongoing investigation or legal proceedings

5. **Confirmation: verify external sharing relationships are active**
   - Request confirmation from ISAC contact(s) that Alma's membership is current and that sharing has occurred in the past 6 months
   - If contractual sharing obligations exist with key customers, verify at least one customer can confirm they received required notifications for applicable incidents (Confirmation assertion)
   - Confirm regulatory bodies in scope have current contact information on file

---

## Evidence Requests

- [ ] Incident information sharing procedures
- [ ] Complete obligations inventory: ISAC memberships, regulatory requirements, contractual sharing obligations
- [ ] Information sharing agreements with external parties
- [ ] Data sanitization procedures for external threat intelligence sharing
- [ ] Named owner documentation for each sharing obligation
- [ ] Evidence of TTP sharing with ISACs or sector peers (past 6 months)
- [ ] Supplier crisis communication protocols
- [ ] ISAC membership confirmation or correspondence

---

## Notes

This test procedure validates that the organization shares incident information appropriately with designated external stakeholders. Effective information sharing requires balancing transparency with operational security. Step 2 replaces a prior step that duplicated RS.CO-02's examination of internal Slack communications: RS.CO-03 is scoped to external and bilateral sharing only. Step 2 applies the 15.6 Completeness assertion by requiring a full obligations inventory rather than spot-checking known agreements. Step 5 is a new Confirmation step: self-attestation from ISAC contacts and customers provides independent evidence that sharing relationships are active, not just documented. Key maturity indicators include voluntary external threat intelligence sharing with sensitive data sanitized, current ISAC membership, and documented procedures for all regulatory and contractual sharing obligations.
