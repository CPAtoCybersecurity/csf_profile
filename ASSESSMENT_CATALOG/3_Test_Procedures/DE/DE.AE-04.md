# DE.AE-04: Impact and Scope Estimation Test Procedures

**CSF Subcategory:** DE.AE-04 — The estimated impact and scope of adverse events are understood

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Review automated impact estimation capabilities**
   - Verify GuardDuty finding severity ratings include affected resource identification
   - Confirm SentinelOne threat assessments include scope indicators (affected endpoints, process trees)
   - Assess whether automated severity ratings align with Alma's asset criticality framework

2. **Evaluate manual impact assessment process**
   - Review incident response playbook for impact estimation guidance and criteria
   - Interview SOC Manager on methodology for refining automated severity assessments
   - Verify that impact estimates consider customer data exposure, service availability, and regulatory thresholds

3. **Test impact estimation accuracy**
   - Pull 3-5 recent incident tickets and compare initial impact estimates to final post-incident assessments
   - Evaluate whether scope creep was identified promptly during investigation
   - Document cases where initial estimates significantly differed from actual impact

4. **Assess communication of impact estimates**
   - Verify that impact and scope estimates are documented in incident tickets at each stage
   - Confirm that revised estimates trigger appropriate escalation per the incident response playbook
   - Review whether executive leadership receives timely impact summaries for significant events

---

## Evidence Requests

- [ ] GuardDuty finding examples showing severity and affected resource details
- [ ] SentinelOne threat assessment examples with scope indicators
- [ ] Incident response playbook impact estimation section
- [ ] 3-5 recent incident tickets showing impact estimation progression
- [ ] Escalation matrix tied to impact severity levels

---

## Notes

This test procedure assesses Alma's ability to estimate the business impact and technical scope of adverse events. Effective impact estimation is critical for a SaaS company handling continuous authentication data, where customer data exposure has both regulatory and reputational consequences.
