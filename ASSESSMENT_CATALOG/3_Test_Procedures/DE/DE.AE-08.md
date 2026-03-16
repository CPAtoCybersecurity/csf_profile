# DE.AE-08: Incident Declaration Test Procedures

**CSF Subcategory:** DE.AE-08 — Incidents are declared when adverse events meet the defined incident criteria

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Review incident declaration criteria**
   - Obtain incident response playbook and identify documented incident criteria
   - Verify criteria address severity levels (Critical, High, Medium, Low) with clear thresholds
   - Confirm criteria account for customer data exposure, service availability, and regulatory obligations
   - Assess whether criteria are specific enough for consistent application across SOC analysts

2. **Evaluate false positive management**
   - Review the false positive registry for documented suppression rules
   - Verify each suppression has business justification and approval
   - Confirm monthly review of false positive registry by SOC Manager
   - Assess quarterly re-validation process for existing suppression rules

3. **Test incident declaration accuracy**
   - Pull 5-8 recent security events and trace the declaration decision for each
   - Verify that events meeting incident criteria were declared as incidents
   - Identify any events that should have been declared but were not (missed declarations)
   - Review events suppressed as false positives and validate suppression appropriateness

4. **Assess declaration timeliness**
   - Measure time from initial alert to incident declaration for recent incidents
   - Evaluate whether the business-hours SOC model delays incident declaration for after-hours events
   - Document how on-call rotation handles incident declaration authority outside business hours

---

## Evidence Requests

- [ ] Incident response playbook with incident criteria section
- [ ] False positive registry with suppression rules and justifications
- [ ] 5-8 recent security event tickets showing declaration decisions
- [ ] SOC on-call rotation and after-hours incident declaration authority
- [ ] Monthly false positive review records

---

## Notes

This test procedure validates that Alma applies consistent, documented criteria when declaring incidents. The business-hours SOC model with on-call rotation introduces risk that after-hours events may experience delayed declaration, impacting the TTD metric improvement trajectory toward the January 2027 target of under 4 minutes.
