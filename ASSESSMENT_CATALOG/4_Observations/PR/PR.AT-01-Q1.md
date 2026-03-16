# PR.AT-01: Security Awareness Training -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Workday training modules, completion reports, phishing simulation results, AUP, Information Security Policy |
| Interview | Yes | Interviewed security team lead and HR learning administrator regarding program design and compliance tracking |
| Test | Yes | Verified phishing simulation click rates, reviewed training completion dashboards, sampled new hire onboarding records |

---

## Findings

### Strengths

- **Mature quarterly training cadence.** Alma exceeds the annual training minimum with quarterly security awareness modules delivered through Workday to all 300 employees. The Q1 module serves as the comprehensive annual refresher while Q2-Q4 modules address targeted topics.

- **Effective phishing simulation program.** Quarterly phishing simulations have driven a measurable improvement in employee resilience. Click rates have declined from 18% to approximately 7% over four quarters. Repeat clickers are automatically enrolled in supplemental training through Workday.

- **Strong new hire onboarding integration.** Security training is gated in the onboarding process -- ServiceNow access provisioning requires Workday training completion confirmation. This prevents new employees from receiving system access before completing baseline security awareness training.

- **Active reporting culture.** The phishing@almasecurity.com reporting inbox and #security-alerts Slack channel provide clear, well-communicated mechanisms for employees to report suspicious activity. The D&R team provides feedback to reporters, which reinforces the behavior.

- **Policy documentation includes consequences.** Both the Acceptable Use Policy and Information Security Policy contain explicit sections on consequences for cybersecurity violations, with a documented escalation path from retraining through formal disciplinary action.

### Gaps

- **No scored knowledge assessments.** Workday training modules use acknowledgment-based completion rather than scored quizzes with pass/fail thresholds. This means completion is verified but actual comprehension is not quantitatively measured. This is the most significant gap in the awareness program.

- **Contractor coverage incomplete.** The 12 EMEA-based contractors are enrolled in the same training program but content is not localized. The AUP acknowledgment requirement has not been formally extended to all contractor personnel through the vendor onboarding process.

- **No vishing or SMS simulation.** Phishing simulations are limited to email-based campaigns. Voice-based (vishing) and SMS-based (smishing) social engineering vectors are not tested, leaving a gap in assessing employee preparedness for non-email attack channels.

- **No unified assessment dashboard.** Phishing simulation results, Workday completion records, and incident reporting data exist in separate systems with no consolidated view of workforce security awareness posture.

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |
| Trend | Improving (was 4 in Q3 2025) |

---

## Evidence Reviewed

- Workday Learning module configuration and quarterly training content
- Workday training completion reports (Q1 2025 through Q1 2026, showing 94% annual completion rate)
- Phishing simulation campaign results (4 quarters, click rate trending from 18% to 7%)
- New hire onboarding checklist and ServiceNow access provisioning workflow
- Acceptable Use Policy and Information Security Policy (consequences sections)
- Annual AUP acknowledgment records from Workday (2025 cycle)
- Slack #security-alerts channel activity sample (last 30 days)
- Phishing report inbox triage logs (last 90 days)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Implement scored post-training quizzes in Workday with 80% pass threshold and auto-remediation for failures | High | Security Team |
| 2 | Extend AUP acknowledgment and training requirements to all contractor personnel through vendor onboarding | Medium | Security Team + Legal |
| 3 | Add vishing and smishing simulation capabilities to the phishing program at next platform renewal | Medium | Security Team |
| 4 | Build consolidated awareness metrics dashboard combining phishing results, Workday completions, and reporting behavior | Medium | Security Team |
| 5 | Establish "Phish Spotter" recognition program to positively reinforce reporting behavior | Low | Security Team + HR |
| 6 | Add pre-training baseline quiz at onboarding to measure incoming awareness level and track improvement | Low | HR + Security Team |
