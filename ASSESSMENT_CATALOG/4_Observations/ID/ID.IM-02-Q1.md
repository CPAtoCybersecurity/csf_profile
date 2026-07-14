# ID.IM-02: Security Test-Based Improvement -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-17
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Quarterly phishing simulations with metrics tracking. Annual incident response tabletop exercises. Exercise findings documented. Phishing results inform security awareness training.

### Gaps

No penetration testing performed. No red team or purple team exercises. Improvement tracking from exercises is informal, not integrated into project management. Business continuity exercises limited to tabletop, no functional tests. Supplier coordination in exercises not practiced.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 2 |
| Target Score | 5 |

**Scoring rationale:** The 2 is at the floor of the Some Security band (2.0–4.9) — per the boundary rule, exactly 2.0 belongs to this band. Security testing happens (quarterly phishing simulations with tracked metrics, an annual incident response tabletop whose findings are documented), but the anchor fits: no penetration testing, no red or purple team exercises, business continuity tested only on paper, and improvement tracking from exercises handled informally rather than through project management — outcomes depend on individual initiative. Even the next anchor up (3) would require a defined test-based improvement process; the Minimally Acceptable band (5.0) is further separated by a consistently executed testing program spanning penetration testing and functional exercises with tracked follow-through.

## Evidence Reviewed

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Phishing Simulation Report](../../5_Artifacts/Reports/RPT-phishing-simulation-q1.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Conduct penetration testing of external-facing applications | Critical | Security |
| 2 | Formalize improvement tracking from exercises into project management | High | Security |
| 3 | Plan functional business continuity test beyond tabletop | Medium | Business Operations |
| 4 | Include supplier coordination in future exercise scenarios | Low | Security |

## Related

- **Test Procedure:** [ID.IM-02 Test Procedures](../../3_Test_Procedures/ID/ID.IM-02.md)
- **Controls:** [ID.IM-02_Ex1](../../2_Controls/ID/ID.IM-02_Ex1.md), [ID.IM-02_Ex2](../../2_Controls/ID/ID.IM-02_Ex2.md), [ID.IM-02_Ex3](../../2_Controls/ID/ID.IM-02_Ex3.md), [ID.IM-02_Ex4](../../2_Controls/ID/ID.IM-02_Ex4.md), [ID.IM-02_Ex5](../../2_Controls/ID/ID.IM-02_Ex5.md), [ID.IM-02_Ex6](../../2_Controls/ID/ID.IM-02_Ex6.md)
