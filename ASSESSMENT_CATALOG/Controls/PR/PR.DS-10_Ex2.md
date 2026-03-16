# PR.DS-10_Ex2: Prevent Unauthorized Access to Data in Use

**Subcategory:** PR.DS-10 -- The confidentiality, integrity, and availability of data-in-use are protected

**NIST SP 800-53 Ref:** SC-39 (Process Isolation), SC-43 (Usage Restrictions)

## Implementation Example

> Implement controls to prevent unauthorized access to data during active processing, including process isolation, interprocess communication restrictions, and runtime monitoring to detect and prevent unauthorized access attempts.

## Alma Security Implementation

Alma enforces process isolation through Kubernetes namespace separation, Pod Security Standards (non-root, dropped capabilities, no privilege escalation), and Linux namespace isolation with IPC blocked by default between containers. The biometric processing namespace has the most restrictive network policies, allowing only API gateway ingress and database/auth service egress. SentinelOne provides runtime behavioral monitoring for process injection and unauthorized data access, supplemented by WDAC and Exploit Guard on the Windows DC.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Kubernetes namespace isolation and network policies | GitOps repository / kubectl | 2026-02-20 |
| Pod security standards (PSS) configuration | Kubernetes cluster configuration | 2026-02-20 |
| Container runtime namespace isolation settings | Container runtime configuration | 2026-02-20 |
| SentinelOne runtime protection policy | SentinelOne Management Console | 2026-03-05 |
| Biometric processing namespace network policies | GitOps repository | 2026-02-20 |
| Windows WDAC and Exploit Guard configuration | Group Policy / Windows Security Center | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | Early Stage - infrastructure isolation deployed, unified program not yet established |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No unified data-in-use protection program | Controls exist but are not managed as a coordinated capability | Establish data-in-use protection program with defined scope and coverage metrics | Nadia Khan | 2026-07-31 |
| DLP monitoring does not cover data-in-use exfiltration vectors | Screen capture, clipboard, and memory scraping not fully monitored | Evaluate and deploy DLP controls for data-in-use exfiltration paths | Nadia Khan | 2026-07-31 |
| Container runtime security not independently audited | Cannot confirm isolation effectiveness without testing | Conduct container runtime security assessment with penetration testing | Chris Magann | 2026-08-31 |
