# RS.AN-06: Investigation Action Recording Test Procedures

**CSF Subcategory:** RS.AN-06 - Actions performed during an investigation are recorded, and the records' integrity and provenance are preserved

---

## Test Procedures

1. **Review investigation documentation requirements**
   - Obtain incident response policy sections governing investigation record-keeping
   - Verify requirements for individual responder action logging during incidents
   - Confirm the incident lead role and responsibilities for documentation oversight are defined
   - Check that evidence chain-of-custody procedures are documented

2. **Examine investigation records for completeness**
   - Pull 3-5 recent incident tickets from ServiceNow (TKT-SOC series)
   - Verify each ticket contains timestamped action logs from individual responders
   - Confirm the incident lead documented the incident narrative with supporting evidence
   - Check that all investigation steps are traceable and attributed to specific personnel

3. **Validate record integrity and preservation controls**
   - Review ServiceNow audit logging configuration for SOC ticket modifications
   - Verify incident records cannot be altered without audit trail
   - Confirm evidence storage locations have access controls and integrity verification
   - Check retention periods for investigation records against policy requirements

4. **Test provenance tracking for collected evidence**
   - Select a recent incident and trace evidence from collection through analysis
   - Verify evidence items are cataloged with source, collector, timestamp, and hash values
   - Confirm digital evidence handling follows documented forensic procedures
   - Check that evidence is stored in tamper-evident or write-once storage

---

## Evidence Requests

- [ ] Incident response policy (investigation documentation section)
- [ ] 3-5 ServiceNow SOC tickets with investigation action logs
- [ ] ServiceNow audit log configuration for incident tickets
- [ ] Evidence chain-of-custody procedures
- [ ] Evidence storage access control configuration
- [ ] Incident record retention policy
- [ ] Sample evidence catalog from a recent incident

---

## Notes

This test procedure validates that investigation actions are systematically recorded with integrity and provenance controls. Mature organizations maintain detailed, tamper-evident investigation logs attributed to individual responders, with the incident lead responsible for comprehensive documentation. The integrity of these records is critical for post-incident reviews, legal proceedings, and regulatory compliance. ServiceNow ticket audit trails provide a baseline, but dedicated evidence management may be needed for complex incidents.
