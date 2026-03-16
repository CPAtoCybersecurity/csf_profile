# RS.AN-07: Incident Data Collection and Integrity Test Procedures

**CSF Subcategory:** RS.AN-07 - Incident data and metadata are collected, and their integrity and provenance are preserved

---

## Test Procedures

1. **Review incident data collection procedures**
   - Obtain documented procedures for collecting incident data and metadata
   - Verify procedures specify data types to collect (logs, network captures, disk images, memory dumps)
   - Confirm procedures address metadata preservation including timestamps, source systems, and collection methods
   - Check that procedures account for volatile data collection priority and sequencing

2. **Examine data collection tooling and capabilities**
   - Review SentinelOne endpoint data collection capabilities for incident response
   - Verify SIEM log aggregation includes all relevant data sources for incident reconstruction
   - Confirm GuardDuty finding metadata is preserved with original context
   - Check that network traffic capture capabilities exist for incident analysis

3. **Validate integrity preservation mechanisms**
   - Verify cryptographic hashing is applied to collected evidence
   - Confirm write-once or tamper-evident storage is used for incident data
   - Review access controls on evidence repositories
   - Check that integrity verification is performed before evidence is used in analysis

4. **Test provenance documentation for collected data**
   - Select a recent incident and trace data collection chain
   - Verify each evidence item has documented source, collection time, collector identity, and method
   - Confirm chain-of-custody records exist for evidence transferred between systems or personnel
   - Check that automated collection tools log their actions and outputs

---

## Evidence Requests

- [ ] Incident data collection procedures and checklists
- [ ] SentinelOne incident response data collection configuration
- [ ] SIEM log source inventory and retention configuration
- [ ] Evidence hashing and integrity verification procedures
- [ ] Evidence storage access control lists
- [ ] Sample chain-of-custody documentation from recent incident
- [ ] Automated collection tool output logs

---

## Notes

This test procedure validates that incident data and metadata are collected systematically with integrity and provenance controls. The distinction from RS.AN-06 is that this subcategory focuses on the raw data and metadata collected as evidence, while RS.AN-06 addresses the recording of investigation actions themselves. Mature organizations automate evidence collection where possible, apply cryptographic integrity verification, and maintain detailed provenance records. The quality of collected data directly impacts the effectiveness of root cause analysis under RS.AN-03.
