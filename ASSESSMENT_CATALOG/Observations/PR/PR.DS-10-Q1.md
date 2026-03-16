# PR.DS-10: Data-in-Use Protection -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Kubernetes pod security contexts, seccomp profiles, container runtime security settings, Windows Credential Guard configuration, SentinelOne runtime protection policies, and application architecture documentation for biometric processing pipeline. |
| Interview | Yes | Interviewed Chris Magann on secure memory handling practices in the biometric processing pipeline, Tigan Wang on infrastructure-level process isolation controls, and Nadia Khan on runtime behavioral monitoring coverage. |
| Test | Yes | Verified pod security standards enforcement in biometric processing namespace, confirmed core dump disablement on container hosts, validated Windows Credential Guard status on Domain Controller, and reviewed SentinelOne memory attack detection alert history. |

---

## Findings

### Strengths

- Kubernetes pod security standards enforce non-root execution, dropped capabilities, and privilege escalation prohibition across all workloads
- Biometric processing services operate in a dedicated Kubernetes namespace with the most restrictive network policies (ingress only from API gateway, egress only to database)
- Container runtime uses Linux namespace isolation (PID, network, mount, UTS, IPC) with seccomp profiles restricting system calls
- Core dumps are disabled on all container hosts, preventing crash dumps from containing sensitive data
- ASLR, DEP/NX, and stack canaries are enabled across all Linux container hosts
- Windows Credential Guard is enabled on the Domain Controller, isolating credential material in a virtualization-based security container
- SentinelOne provides behavioral monitoring for memory injection, process hollowing, and runtime attack patterns

### Gaps

- No formal secure memory handling standard for application development; memory clearing practices for biometric data are implemented but not independently verified
- Application-level memory clearing of biometric data after processing has not been validated through code review or memory analysis
- No hardware-based confidential computing (Intel SGX, AMD SEV) for biometric processing workloads; data is unencrypted in memory during processing
- No unified data-in-use protection program; controls exist across multiple tools but are not managed as a coordinated capability with coverage metrics
- DLP monitoring does not specifically cover data-in-use exfiltration vectors (screen capture, clipboard scraping, memory dump extraction)
- Container runtime security has not been independently audited or penetration tested
- Data-in-use protection requirements are not yet mapped to data classification levels

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

---

## Evidence Reviewed

- Kubernetes pod security standards configuration for biometric processing namespace
- Seccomp profile definitions for biometric processing pods
- Container host Linux kernel security settings (ASLR, NX, stack canaries verified via sysctl)
- Core dump disablement configuration on container hosts
- Windows Credential Guard and Secure Boot status on Domain Controller
- SentinelOne runtime protection policy configuration
- SentinelOne memory attack detection alert history (Q1 2026)
- Biometric processing pipeline architecture documentation
- Kubernetes namespace network policies for biometric processing

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Draft secure coding standard for memory handling of sensitive data (biometric data, authentication tokens) | High | Chris Magann |
| 2 | Conduct code review and memory analysis of biometric processing pipeline to verify memory clearing | High | Chris Magann |
| 3 | Establish a unified data-in-use protection program with defined scope, controls inventory, and coverage metrics | Medium | Nadia Khan |
| 4 | Evaluate and deploy DLP controls for data-in-use exfiltration paths (screen capture, clipboard, memory dumps) | Medium | Nadia Khan |
| 5 | Conduct container runtime security assessment with penetration testing | Medium | Chris Magann |
| 6 | Evaluate confidential computing options (Intel SGX, AMD SEV) for biometric processing workloads as a roadmap item | Low | Tigan Wang |
