# GV.RM — Risk Management Strategy: Test Procedures
## Alma Security Case Study — Issue #30

**CSF 2.0 Category:** GV.RM (GOVERN: Risk Management Strategy)  
**Subcategories covered:** GV.RM-01, GV.RM-02, GV.RM-03  
**Assessment period:** Q1–Q2 2026  
**Methodology:** Inquiry, inspection, and observation consistent with NIST SP 800-53A and CSF 2.0 guidance.

---

## GV.RM-01 — Risk management objectives are established and agreed to by organizational stakeholders

**What we are testing:** Whether Alma Security has formally documented cybersecurity risk
management objectives, whether those objectives are understood by key stakeholders (not just
the security team), and whether they are connected to business strategy.

---

**Test Procedure 1.1 — Document review: Risk register**

- Request the current risk register. Confirm it is dated within the last 90 days.
- Verify each entry includes: risk description, likelihood rating, impact rating, risk owner
  (by name and role), treatment plan, and target resolution date.
- Check that at least Alma's five documented risks (R-01 through R-05) are present and
  reflect current status (e.g., R-03 TTD improvement should be noted).
- Flag any risks rated High/High with no treatment plan or no assigned owner.

---

**Test Procedure 1.2 — Interview: CISO**

- Ask: *"How were the cybersecurity risk management objectives established? Who had input?"*
- Expected: CISO can describe a process involving input from engineering leads, legal, and
  executive team. Objectives should reference Alma's growth targets (10K customers, 20% market share).
- Ask: *"When were these objectives last reviewed, and what prompted any changes?"*
- Expected: Answer references a specific event or calendar cycle (e.g., "we updated after the
  SOC 2 scoping exercise in Q4 2025").

---

**Test Procedure 1.3 — Interview: non-security stakeholder (e.g., VP Engineering or CFO)**

- Ask: *"Are you aware of Alma's cybersecurity risk management objectives? Can you describe them?"*
- Pass: Stakeholder can accurately describe at least 2 of the 5 major risks and their
  connection to business outcomes without being prompted.
- Fail: Stakeholder is unaware of the risk register or believes "security handles that."

---

**Test Procedure 1.4 — Board/committee reporting review**

- Request the most recent Board Audit and Risk Committee meeting minutes or materials.
- Confirm cybersecurity risk was on the agenda and that the risk register (or a summary) was
  presented.
- Check whether the Board acknowledged or formally approved the risk objectives.

---

## GV.RM-02 — Risk strategy is established, agreed to, and managed

**What we are testing:** Whether Alma has a documented, reviewed risk management strategy (not
just a risk register) that describes *how* risk decisions are made — including risk identification
methodology, assessment cadence, treatment options, and governance process.

---

**Test Procedure 2.1 — Document review: Risk Management Strategy document**

- Request the risk management strategy or policy document.
- Confirm it includes: scope, risk identification process, assessment methodology (qualitative
  or quantitative), treatment options (accept, avoid, mitigate, transfer), escalation path,
  and review cadence.
- Check whether it references NIST CSF 2.0, or another recognized framework, as its basis.
- Verify the document has a revision date, document owner, and approval signature.

---

**Test Procedure 2.2 — Inspection: Risk treatment evidence**

For each of the five risks in the register, request evidence that the stated treatment is
being executed:

- R-01 (Understaffing): Job requisitions or offer letters for security roles. CrowdStrike
  MDR SOW as compensating control documentation.
- R-02 (Asset inventory): AWS Config dashboard screenshot showing resource coverage. Export
  from asset management tool (e.g., Orca Security, or AWS Systems Manager Inventory).
- R-03 (Slow TTD): Splunk dashboard showing TTD trend data (Oct 2024 baseline vs. Mar 2026
  current state). GuardDuty findings summary.
- R-04 (Customer trust): Customer-facing SOC 2 roadmap document or trust center page.
  Evidence of customer communication sent post-incident.
- R-05 (Vendor risk): Vendor questionnaire tracker or spreadsheet showing Tier 1 coverage
  percentage (target: 60%+ assessed as of Q1 2026).

---

**Test Procedure 2.3 — Interview: CISO or Risk Lead**

- Ask: *"Walk me through how a new risk gets added to the register. Who can identify risks?
  What is the assessment process?"*
- Expected: A defined process — not just "CISO decides." At minimum, there should be a way for
  engineering leads, legal, or product to surface risks, with the CISO validating and rating.
- Ask: *"How do you decide between accepting and mitigating a risk?"*
- Expected: Reference to risk tolerance thresholds (e.g., "we accept risks below a certain
  likelihood/impact combination") connected to the risk appetite statement.

---

**Test Procedure 2.4 — Verify strategy communication**

- Ask three employees outside the security team (e.g., a software engineer, an account executive,
  and a customer success manager): *"Do you know who to contact if you identify a potential
  security risk?"*
- Pass: All three can name the CISO, security team email alias, or a documented reporting channel.
- Partial pass: 2 of 3 can answer.
- Fail: No consistent awareness of how to surface risks to the security team.

---

## GV.RM-03 — Risk appetite and tolerance statements are defined and communicated

**What we are testing:** Whether Alma has explicitly stated what risks it is willing to accept
(appetite) versus the maximum level of risk it can operate within before action is required
(tolerance), and whether this is known beyond the security team.

---

**Test Procedure 3.1 — Document review: Risk Appetite/Tolerance Statement**

- Request the risk appetite statement or policy section that defines tolerance thresholds.
- Confirm it distinguishes between risk appetite (what Alma *wants* to take on) and risk
  tolerance (the boundary beyond which action is mandatory).
- Check whether thresholds are defined in terms that connect to the business — e.g., "Alma will
  not accept any risk that could result in customer data exfiltration, regardless of likelihood"
  or "Risks with likelihood >Medium AND impact >High must have treatment plans within 30 days."
- Verify the statement is approved by at least the CISO and CEO. Board ratification is the
  target state; note if it is still pending.

---

**Test Procedure 3.2 — Validate alignment between risk appetite and risk register ratings**

- Cross-reference the risk register against the tolerance statement.
- For each High/High risk (R-01 and R-03 as of Q1 2026): verify an active treatment plan
  exists and has a target date. If the tolerance statement says High/High risks require treatment
  within 30 days, verify the register shows treatment was initiated within that window.
- Flag any High/High risk with no active treatment as a direct gap against GV.RM-03.

---

**Test Procedure 3.3 — Interview: CFO or CEO**

- Ask: *"How does Alma decide how much cybersecurity risk is acceptable? Has that been documented
  and communicated to you?"*
- Pass: Executive can describe the risk appetite concept and confirms they reviewed or approved
  the statement.
- Gap indicator: Executive says "that's a security team decision" — shows risk appetite has not
  been elevated to organizational leadership as GV.RM-03 requires.

---

**Test Procedure 3.4 — Verify tolerance drives prioritization decisions**

- Review the last 90 days of risk register updates. Look for at least one example where a risk
  exceeded the stated tolerance threshold and triggered a formal treatment response.
- If Alma's tolerance statement was drafted but no decisions have yet been visibly driven by it,
  note this as a maturity gap: the statement exists but is not yet operationalized.

---

## References

- NIST Cybersecurity Framework 2.0: GV.RM — https://www.nist.gov/cyberframework
- NIST SP 800-53A: Assessing Security and Privacy Controls
- NIST SP 800-30 Rev 1: Guide for Conducting Risk Assessments
- Alma Security Case Study Materials: https://github.com/CPAtoCybersecurity/csf_profile/tree/feature/api-integration/EXAMPLE_BUSINESS_CASE_STUDY_FOR_ASSESSMENT
