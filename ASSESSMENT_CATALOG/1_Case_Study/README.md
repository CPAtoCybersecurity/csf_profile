# Case Study: Alma Security

Alma Security is a 300-person Series B SaaS company headquartered in Redwood City, California, specializing in continuous authentication. Founded in **2021**, the company has grown to $36.4M ARR and serves enterprise customers with biometric-based identity verification.

> **Canon:** every fact about Alma Security is defined in [`../0_Methodology/Alma-Fact-Sheet.md`](../0_Methodology/Alma-Fact-Sheet.md). If anything in this directory conflicts with the fact sheet, the fact sheet wins.

## Files

| File | Description |
|---|---|
| `alma-backgrounder.md` / `.docx` | Company profile: history, the 2024 incidents, org structure, technology environment (docx generated from the .md) |
| `alma-business-case.md` / `.docx` | Business case for the 2026 CSF assessment: sponsor, cost, scope, decision ask (docx generated from the .md) |
| `alma-controls.csv` | Master control implementation data (38 in-scope controls) |
| `alma-assessments.csv` | Quarterly assessment scores, observations, and test results |
| `alma-kpi-trends.xlsx` | Security KPI trends (TTD, TTI, TTR-CJC, TTR-C) |
| `alma-financials-q1-2026.xlsx` | P&L statement for financial context |

## Key Context for Assessment Authors

- **Industry**: SaaS cybersecurity (continuous authentication)
- **Infrastructure**: AWS (Kubernetes, multi-AZ) + on-prem Windows DC at Redwood City
- **Security Team**: 15 people (Detection & Response, Vulnerability Management, IT)
- **Major Risks** (canonical mapping — see Fact Sheet §6): understaffing (R1), no perimeter/attack-surface monitoring (R2), slow detection and investigation (R3), incomplete asset inventory (R4), low public trust (R5), third-party/supplier risk (R6)
- **Incident History**: INC-2024-01 (S3 exposure, Mar 2024) and INC-2024-02 (compromised developer SSH key, Aug 2024) — see Fact Sheet §8
- **Active Projects**: WAF install ($112K), MFA rollout ($80K), ASM implementation ($100K), data encryption upgrade ($95K), incident response enhancement ($150K), cloud security optimization ($100K), S3 bucket security, SQL injection mitigation
- **Assessment**: 2026 Alma Security CSF Assessment — CY2026 with quarterly scoring (Q1–Q4), performed by Internal Audit per the [Scoring Rubric and Methodology](../0_Methodology/Scoring-Rubric-and-Methodology.md)

All test procedures, control descriptions, observations, and artifacts in this catalog should be grounded in the [0_Methodology](../0_Methodology/) canon.
