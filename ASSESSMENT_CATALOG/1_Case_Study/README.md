# Case Study: Alma Security

Alma Security is a 300-person Series B SaaS company headquartered in Redwood City, California, specializing in continuous authentication. Founded in 2023, the company has grown to ~$36M ARR and serves enterprise customers with biometric-based identity verification.

## Files

| File | Description |
|---|---|
| `alma-backgrounder.docx` | Company history, mission, market position, org structure |
| `alma-business-case.docx` | Business justification for the CSF assessment |
| `alma-controls.csv` | Master control implementation data (38 in-scope controls) |
| `alma-assessments.csv` | Quarterly assessment scores, observations, and test results |
| `alma-kpi-trends.xlsx` | Security KPI trends (TTD, TTI, TTR-CJC, TTR-C) |
| `alma-financials-q1-2026.xlsx` | P&L statement for financial context |

## Key Context for Assessment Authors

- **Industry**: SaaS cybersecurity (continuous authentication)
- **Infrastructure**: AWS (Kubernetes, multi-AZ) + on-prem Windows DC at Redwood City
- **Security Team**: 15 people (Detection & Response, Vulnerability Management, IT)
- **Major Risks**: Understaffing (R1), incomplete asset inventory (R2), slow detection (R3), low public trust (R4), third-party vendor risk (R5)
- **Active Projects**: WAF install, MFA rollout, ASM implementation, data encryption upgrade, incident response enhancement, cloud security optimization, S3 bucket security, SQL injection mitigation
- **Assessment Period**: 2025 annual CSF assessment with quarterly scoring (Q1-Q4)

All test procedures, control descriptions, observations, and artifacts in this catalog should be grounded in this case study context.
