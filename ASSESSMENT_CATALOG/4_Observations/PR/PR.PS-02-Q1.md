# PR.PS-02: Software Maintenance and Lifecycle - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed patch compliance reports (90-day period), EOL tracking records, software inventory, container image scanning results, and procurement workflows |
| Interview | Yes | Interviewed Chris Magann (patching/lifecycle owner) on patch management operations, EOL tracking process, and Windows 2012 R2 compensating controls |
| Test | Yes | Sampled 12 systems for current patch levels; verified patch compliance against defined SLAs; confirmed Windows 2012 R2 network segmentation controls |

---

## Findings

### Strengths

- Patch management program is operational with defined SLAs (critical: 14 days, emergency: 72 hours) enforced through AWS Systems Manager Patch Manager
- Automated vulnerability scanning runs weekly (daily for crown jewel systems) and generates remediation tickets
- Container base images are rebuilt weekly, providing regular patching cadence for containerized workloads
- Software inventory tracked through SentinelOne (endpoints), AWS Systems Manager (servers), and Amazon ECR (container images)
- Monthly patch compliance reporting to CISO provides executive visibility

### Gaps

- Windows Server 2012 R2 fileserver is 2+ years past end-of-life with no vendor patches available; compensating controls in place but risk acceptance is aging
- No software bill of materials (SBOM) for the SaaS platform; transitive dependency vulnerabilities not systematically tracked
- Container image signing (Sigstore/Cosign) not implemented; no cryptographic verification of image integrity between build and deployment
- Kubernetes node patching occasionally exceeds SLA due to workload scheduling coordination challenges
- Application-layer dependency patching (npm, pip) relies on developer-initiated updates rather than automated tooling
- Software procurement process does not consistently capture free/open-source tools used by developers
- Estimated 15-20% of SaaS tools in use have not been through formal security review

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

**Scoring rationale:** The 3.5 belongs to the Some Security band: a defined patch program operates — SLAs of 14 days for critical and 72 hours for emergency patches enforced through AWS Systems Manager, weekly vulnerability scans (daily for crown jewels), and weekly container base-image rebuilds — but execution is unreliable at the edges of scope. The Windows Server 2012 R2 fileserver is 2+ years past end-of-life with an aging risk acceptance, Kubernetes node patching periodically exceeds SLA, application-layer npm/pip updates depend on developer initiative, and an estimated 15–20% of SaaS tools bypassed security review entirely. Minimally Acceptable (5.0) requires consistent execution across the whole software estate with exceptions tracked and current; the unmanaged dependency layer and the stale EOL exception keep this control well below that floor.

---

## Evidence Reviewed

- Patch management policy with SLA definitions (Confluence)
- AWS Systems Manager Patch Manager compliance dashboard (90-day view)
- Patch compliance sample: 12 systems verified for current patch levels
- Windows Server 2012 R2 risk acceptance documentation and compensating controls
- Windows 2012 R2 migration project plan (Q3 2026 target)
- Amazon ECR image scanning results
- ServiceNow software procurement workflow and approved catalog
- SentinelOne installed software discovery report
- Container base image rebuild pipeline configuration (GitLab CI)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Accelerate Windows Server 2012 R2 migration to SharePoint Online/OneDrive; refresh risk acceptance documentation | Critical | Chris Magann |
| 2 | Implement SBOM generation and automated SCA scanning in CI/CD pipeline | High | Chris Magann |
| 3 | Deploy container image signing (Sigstore Cosign) and admission controller verification | High | Tigan Wang |
| 4 | Implement automated dependency update tooling (Dependabot or Renovate) | Medium | Chris Magann |
| 5 | Automate Kubernetes node draining and rolling updates for patching | Medium | Tigan Wang |
| 6 | Conduct SaaS audit to identify unreviewed tools and route through procurement | Medium | Chris Magann |

## Related

- **Test Procedure:** [PR.PS-02 Test Procedures](../../3_Test_Procedures/PR/PR.PS-02.md)
- **Controls:** [PR.PS-02_Ex1](../../2_Controls/PR/PR.PS-02_Ex1.md), [PR.PS-02_Ex2](../../2_Controls/PR/PR.PS-02_Ex2.md), [PR.PS-02_Ex3](../../2_Controls/PR/PR.PS-02_Ex3.md), [PR.PS-02_Ex4](../../2_Controls/PR/PR.PS-02_Ex4.md), [PR.PS-02_Ex5](../../2_Controls/PR/PR.PS-02_Ex5.md), [PR.PS-02_Ex6](../../2_Controls/PR/PR.PS-02_Ex6.md)
