# DE.AE-02: Adverse Event Analysis - Q1 2025 Observation

**CSF Subcategory:** DE.AE-02 - Potentially adverse events are analyzed to better understand associated activities

**Assessment Period:** Q1 2025

**Observation Date:** 2025-01-26

**Testing Status:** Complete

---

## Observation

CloudTrail and GuardDuty provide SIEM-like functionality. TTD at 9 hours. Malicious activity detection rules tuned based on threat intelligence.

---

## Testing Methods

| Method | Performed |
|--------|-----------|
| Examine | No |
| Interview | Yes |
| Test | Yes |

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 2 |
| Target Score | 5 |

---

## Gap Analysis

- Current TTD of 9 hours exceeds target but shows significant improvement from 81-hour baseline
- No 24/7 monitoring coverage - business hours only with on-call rotation
- SIEM use cases limited to AWS-native systems

---

## Remediation Notes

Incident Response Enhancement project addressing 24/7 monitoring gap. Additional SIEM use cases planned for non-AWS systems.

---

## Linked Artifacts

- SIEM Configuration
- [SOC-Ticket-1004](../Sample_Artifacts/SOC-Ticket-1004.md)
