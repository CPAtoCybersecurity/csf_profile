# PR.DS-10_Ex2: Prevent Unauthorized Access to Data in Use

**Subcategory:** PR.DS-10 -- The confidentiality, integrity, and availability of data-in-use are protected

**NIST SP 800-53 Ref:** SC-39 (Process Isolation), SC-43 (Usage Restrictions)

## Implementation Example

> Implement controls to prevent unauthorized access to data during active processing, including process isolation, interprocess communication restrictions, and runtime monitoring to detect and prevent unauthorized access attempts.

## Alma Security Implementation

Alma Security implements process isolation and unauthorized access prevention through Kubernetes namespace isolation, container security contexts, and runtime behavioral monitoring. The Kubernetes cluster enforces namespace-level isolation between workloads of different security classifications, ensuring that pods processing biometric data operate in a dedicated namespace with restricted network policies. Pod security standards (PSS) enforce baseline restrictions including non-root execution, dropped capabilities, and prohibition of privilege escalation.

Container-level isolation ensures that processes within one container cannot access memory or storage of another container on the same node. The container runtime uses Linux namespaces (PID, network, mount, UTS, IPC) to provide kernel-level process isolation. Interprocess communication (IPC) between containers is blocked by default, with explicit network policies required for any cross-pod communication. The biometric processing namespace has the most restrictive network policies, allowing ingress only from the API gateway and egress only to the database and internal authentication services.

SentinelOne's runtime protection provides behavioral monitoring at the endpoint and workload level, detecting patterns indicative of unauthorized data access including process injection, shared memory manipulation, clipboard scraping, and screen capture attempts. On corporate endpoints, SentinelOne enforces application control policies that restrict which processes can access sensitive data paths. The on-premises Windows Domain Controller uses Windows Defender Application Control (WDAC) and Windows Defender Exploit Guard to prevent unauthorized code execution and memory access patterns. These controls are monitored but not yet consolidated into a unified data-in-use protection program with documented coverage metrics.

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
