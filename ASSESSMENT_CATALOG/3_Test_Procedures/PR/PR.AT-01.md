# PR.AT-01: Security Awareness Training Test Procedures

**CSF Subcategory:** PR.AT-01 - Personnel are provided awareness and training

**Scope:** Alma Security 2025 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Review training program documentation**
   - Obtain security awareness program charter/policy
   - Verify training frequency requirements (Alma: quarterly)
   - Confirm coverage of required topics (social engineering, phishing, data handling)

2. **Verify Workday training records against full personnel roster**
   - Export training completion report segmented by employee type (FTE, contractor, part-time, temp)
   - Verify the 90%+ completion target applies to all segments, not just FTEs (Completeness assertion)
   - For each quarter in the past 12 months, verify a distinct training event was completed per employee (Recurrence: 4 completions per person, not 1 cumulative total)
   - Identify personnel with overdue training and any exemptions with documented business justification

3. **Examine phishing simulation results**
   - Review last 3-6 months of phishing simulation campaigns
   - Document click rates and improvement trends by quarter
   - Verify remedial training is triggered and tracked for repeat clickers

4. **Assess training content calibration against threat landscape**
   - Obtain the current threat intelligence summary or risk register for Alma
   - Verify that training topics are weighted proportionally to actual threats (e.g., if phishing represents the majority of incidents, it should be the primary training focus)
   - Confirm training content was updated in the past 12 months to reflect new threat vectors (Valuation assertion)

5. **Assess new hire onboarding process**
   - Review onboarding checklist for security training requirements
   - Verify training completion timeframe (e.g., within 30 days of start date)
   - Confirm cyber hygiene training is mandatory before system access is granted

---

## Evidence Requests

- [ ] Security Awareness Program documentation
- [ ] Workday training completion report segmented by employee type (FTE, contractor, temp)
- [ ] Quarterly training delivery records for past 12 months (not aggregated annually)
- [ ] Phishing simulation campaign results (last 3-6 months)
- [ ] New hire onboarding checklist
- [ ] Threat intelligence summary or risk register used to inform training content selection
- [ ] Sample training content/modules

---

## Related Artifacts

- [Security Awareness Program](../Sample_Artifacts/)
- [2025-05-26_Phish-1001-LI-Campaign-Data.xlsx](../Sample_Artifacts/2025-05-26_Phish-1001-LI-Campaign-Data.xlsx)

---

## Notes

This test procedure validates that the organization provides appropriate security awareness training to all personnel. Step 2 was expanded to apply the 15.6 Completeness and Recurrence assertions: the 90% completion rate must be verified across all employee types (not just FTEs), and quarterly recurrence must be confirmed as 4 distinct training completions per person in the past 12 months, not as a single annual aggregated report. Step 4 is a new addition applying the Valuation assertion: training content should be calibrated to the actual threat landscape, not just cover a static topic list. Key metrics include training completion rates by population segment, quarterly recurrence, and phishing simulation click rate trends.
