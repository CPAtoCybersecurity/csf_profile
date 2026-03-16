# DE.CM-02: Physical Environment Monitoring Test Procedures

**CSF Subcategory:** DE.CM-02 — The physical environment is monitored to find potentially adverse events

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Verify physical access control monitoring**
   - Review badge reader system configuration and log retention settings
   - Verify alerting for failed badge attempts and after-hours access
   - Confirm SOC inclusion of physical access anomalies in weekly log reviews
   - Test cross-referencing of badge events with employee schedules

2. **Assess visitor management controls**
   - Review visitor management system for ID verification and escort requirements
   - Verify visitor badge time-limitation and automatic deactivation
   - Confirm weekly and monthly visitor log review cadence
   - Test restricted zone access enforcement for visitor badges

3. **Evaluate tamper detection**
   - Verify tamper-detection sensors on server room and network closet access points
   - Review monthly physical security walkthrough documentation
   - Confirm reporting path from facilities team to security team for tamper anomalies
   - Inspect physical security of network infrastructure (cable runs, patch panels)

4. **Review surveillance and alarm systems**
   - Verify security camera coverage of building entrances, parking, and server room access
   - Confirm 90-day video retention on recording system
   - Test 24/7 central station alarm monitoring functionality
   - Review after-hours alarm response procedures with contracted security provider

---

## Evidence Requests

- [ ] Badge reader system configuration and log sample
- [ ] After-hours access alert configuration
- [ ] Visitor management system policies and recent visitor logs
- [ ] Monthly physical security walkthrough reports
- [ ] Security camera coverage map and retention configuration
- [ ] Alarm system central station monitoring contract
- [ ] After-hours security response provider contract

---

## Notes

This test procedure evaluates physical security monitoring at Alma's Redwood City office. As a 300-person SaaS company with on-premises server infrastructure (Windows Domain Controller), physical security monitoring complements the digital detection capabilities assessed in DE.CM-01 and DE.CM-09.
