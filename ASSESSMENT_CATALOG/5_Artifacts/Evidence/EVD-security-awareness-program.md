# Security Awareness Program — Alma Security

**Artifact Type:** Program Description  
**CSF Subcategory:** PR.AT-01, PR.AT-02  
**Organization:** Alma Security  
**Program Owner:** HR / People Operations (co-owned with IT Security)  
**Last Reviewed:** 2025-Q4  
**Assessment Reference:** Alma Security 2025 CSF Assessment

---

## Program Overview

Alma Security operates a quarterly security awareness program delivered through the Workday LMS. The program targets all personnel (full-time, part-time, contractors, and temporary staff) and is supplemented by role-specific technical training for employees in security-sensitive positions.

**Program goals:**
- Maintain ≥90% training completion rate across all employee types each quarter
- Reduce phishing simulation click rates by 20% year-over-year
- Ensure all personnel can identify and report social engineering attempts
- Align training content to Alma's active threat landscape

---

## Training Modules

| Module | Audience | Frequency | Platform | Duration |
|--------|----------|-----------|----------|----------|
| Security Awareness Foundations | All staff | Quarterly | Workday LMS | 30 min |
| Phishing & Social Engineering | All staff | Quarterly | Workday LMS | 20 min |
| Data Handling & Classification | All staff | Annual | Workday LMS | 25 min |
| Secure Remote Work | All staff | Annual | Workday LMS | 20 min |
| Incident Reporting Procedures | All staff | Quarterly | Workday LMS | 15 min |
| SentinelOne EDR Operations | D&R Team | Semi-annual | Vendor-delivered | 4 hrs |
| Vulnerability Management & CVSS | VM Team | Semi-annual | Vendor-delivered | 3 hrs |
| Secure Coding / OWASP Top 10 | Developers | Quarterly | Internal | 2 hrs |
| Firewall & Network Operations | Net Ops | Annual | Vendor-delivered | 8 hrs |

---

## Phishing Simulation Program

Alma Security runs monthly phishing simulations using a commercial platform. Campaigns target all employees and vary in sophistication (Level 1–3) across the calendar year.

**Simulation schedule:**
- **Level 1** (low sophistication): Months 1, 4, 7, 10
- **Level 2** (moderate): Months 2, 5, 8, 11
- **Level 3** (spear phish / targeted): Months 3, 6, 9, 12

**Click rate thresholds:**
- Green: <5% click rate
- Yellow: 5–15% click rate — trigger awareness reminder
- Red: >15% click rate — mandatory remedial training within 5 business days

**Repeat clickers:** Personnel who click in 2 consecutive simulations are automatically enrolled in a 1:1 coaching session with the Security team and flagged for manager awareness.

**2024–2025 trend data:** See `EVD-phish-campaign-2025-05-26.xlsx` for the May 2025 campaign results.

---

## Completion Tracking

Training completion is tracked in Workday. The IT Security team exports a segmented completion report at the end of each quarter.

**Completion targets:**
- Full-time employees: ≥90% completion within 30 days of module assignment
- Contractors: ≥90% completion within 14 days of module assignment (tighter window due to shorter tenure)
- New hires: All foundational modules completed before system access is granted (Day 1 onboarding gate)

**Quarterly reporting:** IT Security provides the People Operations team a completion dashboard by the 10th business day of the following quarter.

---

## Threat-Aligned Content Updates

Training content is reviewed quarterly against Alma's risk register and the previous quarter's SOC tickets. Content is updated annually at minimum. Updates triggered by material threat changes (e.g., new malware campaign, regulatory change) are deployed on an ad-hoc basis within 30 days of the triggering event.

**Q3 2025 update:** Social engineering module refreshed after SOC-Ticket-1001 (phishing-related incident). New section added on business email compromise (BEC) patterns observed in Alma's industry vertical.

---

## Contractor and Third-Party Training

Contractors accessing Alma systems for >5 business days must complete the Security Awareness Foundations and Incident Reporting modules before access is provisioned. Completion is verified by IT Security before Workday onboarding is finalized. Long-term contractors (>90 days) are subject to the same quarterly training cadence as full-time employees.

---

## Evidence Available for Assessment

| Evidence Item | Location | Notes |
|---------------|----------|-------|
| Training completion report (Q1 2026, segmented by employee type) | `EVD-training-completion-q1.md` | Includes FTE, contractor, and temp breakdown |
| Phishing simulation campaign data (May 2025) | `EVD-phish-campaign-2025-05-26.xlsx` | Click rates by department |
| Security awareness policy | `POL-information-security.md` | Section 6: Awareness and Training |
| New hire onboarding checklist | HR SharePoint (request via People Ops) | Training gate documented on p. 3 |
| Workday LMS module catalogue | Workday (export available on request) | — |

---

## Related Test Procedures

- [PR.AT-01: Security Awareness Training Test Procedures](../../3_Test_Procedures/PR/PR.AT-01.md)
- [PR.AT-02: Specialized Role-Based Training Test Procedures](../../3_Test_Procedures/PR/PR.AT-02.md)

---

## Observations

- The program satisfies the core requirements of PR.AT-01 and PR.AT-02 at a process level.
- Completion tracking distinguishes employee types (FTE vs. contractor), which addresses the Completeness assertion in PR.AT-01.
- Quarterly recurrence is enforced via Workday module assignments — each quarter generates a new module instance, so cumulative annual totals cannot mask missed quarters.
- The phishing simulation program is mature for a company of Alma's size; monthly cadence with three sophistication tiers exceeds typical SMB practice.
- Gap: No formal documentation exists for the contractor onboarding training gate outside of the HR SharePoint onboarding checklist. This should be captured in a standalone procedure.
