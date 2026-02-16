# DE.AE-02: Adverse Event Analysis Test Procedures

**CSF Subcategory:** DE.AE-02 - Potentially adverse events are analyzed to better understand associated activities

**Scope:** Alma Security 2025 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Review CloudTrail and GuardDuty configuration**
   - Verify CloudTrail is enabled for all regions
   - Confirm GuardDuty findings are being generated and routed
   - Check integration between CloudTrail events and GuardDuty analysis

2. **Examine detection rule tuning**
   - Review custom GuardDuty findings configurations
   - Assess suppression rules for false positive management
   - Verify threat intelligence feeds are current

3. **Verify TTD (Time to Detect) metrics**
   - Pull TTD metrics from security dashboards
   - Compare against baseline (Alma baseline: 81 hours)
   - Document improvement trends (Alma current: 9 hours)

4. **Assess 24/7 monitoring gaps**
   - Review SOC staffing schedule
   - Identify coverage gaps outside business hours
   - Document planned remediation (Incident Response Enhancement project)

---

## Evidence Requests

- [ ] CloudTrail configuration export
- [ ] GuardDuty findings dashboard screenshot
- [ ] TTD metrics report (quarterly comparison)
- [ ] SOC on-call rotation schedule
- [ ] Incident Response Enhancement project status

---

## Related Artifacts

- [SIEM Configuration](../Sample_Artifacts/)
- [SOC-Ticket-1004](../Sample_Artifacts/SOC-Ticket-1004.md)

---

## Notes

This test procedure addresses the DETECT function's requirement for analyzing potentially adverse events. Key focus areas include SIEM-like functionality provided by AWS native tools (CloudTrail, GuardDuty) and measuring detection effectiveness through TTD metrics.
