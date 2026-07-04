# RS.CO-03: Incident Information Sharing — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook information sharing procedures, information sharing agreements with partners, Slack #security-alerts channel protocols, executive incident status reporting templates |
| Interview | Yes | Interviewed Nadia Khan on information sharing protocols and partner communication channels; Gerry (CISO) on executive status reporting cadence and external sharing decisions |
| Test | Yes | Verified information sharing agreement provisions for 2 key partners; reviewed executive incident status reports from recent incidents; validated sensitive data sanitization in external communications |

---

## Findings

Alma Security shares incident information through defined channels based on the audience and sensitivity of the information. Internal information sharing occurs through Slack #security-alerts for the security team, ServiceNow incident tickets for detailed technical information, and executive status reports for leadership during major incidents. Nadia Khan coordinates incident status updates and ensures consistent messaging across internal channels.

External information sharing is governed by contractual agreements and the CISO's authorization. Information sharing agreements with key partners define the scope, format, and classification of information that can be shared. The organization does not currently participate in ISACs or voluntary threat intelligence sharing communities. External communications undergo sensitive data sanitization before release to prevent inadvertent disclosure of proprietary indicators or victim-identifying information.

### Strengths

- Incident information sharing procedures documented with clear channel assignments
- Slack #security-alerts provides real-time security team coordination
- Executive status reporting established for major incidents with defined cadence
- Information sharing agreements with key partners define scope and classification
- Sensitive data sanitization applied to external communications

### Gaps

- No ISAC participation or voluntary threat intelligence sharing with industry peers
- Crisis communication methods with critical suppliers not formalized beyond existing agreements
- HR notification procedures for insider threat incidents not explicitly defined in the playbook
- External sharing limited to contractual obligations; no proactive community contribution

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

**Scoring rationale:** Information sharing rates a 4, in the Some Security band: the channels that exist operate regularly — Slack #security-alerts for the team, ServiceNow for technical detail, cadenced executive status reports, sanitization of external communications, and sharing agreements verified with 2 key partners defining scope and classification. The material weaknesses are coverage holes rather than execution failures: the playbook never defines HR notification for insider-threat incidents, crisis communication with critical suppliers is not formalized beyond the standing agreements, and all external sharing is reactive to contract — no ISAC or community participation. Closing the distance to Minimally Acceptable (5.0) means covering the full set of sharing scenarios the subcategory contemplates (insider-threat, supplier crisis) so that execution is consistent across scope, not just within the channels already built.

---

## Evidence Reviewed

- Incident response playbook information sharing section
- Information sharing agreements with 2 key partners
- Slack #security-alerts channel communication protocols
- Executive incident status report templates and samples
- External communication sanitization procedures
- Contractual incident sharing obligations matrix

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Evaluate ISAC membership for voluntary threat intelligence sharing and community engagement | High | Nadia Khan |
| 2 | Formalize crisis communication procedures with critical suppliers including backup channels | Medium | Nadia Khan |
| 3 | Add explicit HR notification procedures for insider threat incidents to the playbook | Medium | Nadia Khan |
| 4 | Develop anonymized TTP sharing capability for proactive community contribution | Low | Nadia Khan |

## Related

- **Test Procedure:** [RS.CO-03 Test Procedures](../../3_Test_Procedures/RS/RS.CO-03.md)
- **Controls:** [RS.CO-03_Ex1](../../2_Controls/RS/RS.CO-03_Ex1.md), [RS.CO-03_Ex2](../../2_Controls/RS/RS.CO-03_Ex2.md), [RS.CO-03_Ex3](../../2_Controls/RS/RS.CO-03_Ex3.md), [RS.CO-03_Ex4](../../2_Controls/RS/RS.CO-03_Ex4.md), [RS.CO-03_Ex5](../../2_Controls/RS/RS.CO-03_Ex5.md), [RS.CO-03_Ex6](../../2_Controls/RS/RS.CO-03_Ex6.md)
