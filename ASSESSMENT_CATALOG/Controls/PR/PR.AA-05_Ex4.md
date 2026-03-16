# PR.AA-05 Ex4: Separation of Duties and Conflict-of-Interest Controls

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-5, AC-6, CM-5

## Implementation Example

> Implementing separation of duties (SoD) controls to prevent any single individual from having the ability to perform conflicting or sensitive combinations of functions without oversight, enforced through technical controls and monitored for violations

## Alma Security Implementation

Alma Security documents separation of duties requirements in the Access Management Policy and enforces critical SoD constraints through Active Directory group membership restrictions and AWS IAM policy conditions. The most significant SoD controls prevent: (1) a single individual from both approving and provisioning access requests in ServiceNow, (2) a developer from deploying code to production without a separate approver in the CI/CD pipeline, and (3) a single person from creating and approving financial transactions in the ERP system.

The CI/CD pipeline is the most technically mature SoD implementation. GitHub Actions workflows for the production environment require pull request approval from a code reviewer who is not the author, and the deployment approval step in the pipeline requires sign-off from an on-call engineer who did not write the code. This two-person integrity control for production deployments was implemented after a 2024 incident where a single developer inadvertently deployed untested code to production, causing a 2-hour service disruption.

However, SoD enforcement is predominantly procedural rather than technical for administrative functions. Active Directory does not technically prevent a Domain Admin from also holding application owner privileges, which would allow them to both manage the identity infrastructure and approve access grants. The security team relies on monthly privileged access reviews to detect such conflicts rather than automated technical controls. The SoD matrix was last updated in Q3 2025 and does not yet reflect the ERP module expansion completed in Q4 2025, which introduced new financial approval workflows that require SoD analysis.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Access Management Policy (SoD section) | SharePoint > Policies > InfoSec | 2026-01-15 |
| ServiceNow access request workflow (dual approval) | ServiceNow > Workflow Designer | 2026-02-01 |
| CI/CD pipeline approval configuration | GitHub Actions > Production Workflows | 2026-02-15 |
| SoD matrix | Security Team > IAM > SoD Matrix | 2025-09-15 |
| Monthly privileged access review (SoD check) | Security Team > Monthly Reviews | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| SoD matrix not updated for Q4 2025 ERP module expansion | New financial workflows may lack proper SoD constraints; approval conflicts could exist undetected | Update SoD matrix to include new ERP financial approval workflows; validate technical enforcement | Gerry | 2026-05-31 |
| Administrative SoD enforcement is procedural, not technical | Relies on manual review to detect conflicts; a compromised admin account could bypass both identity and access controls | Implement technical SoD controls in AD using restricted group memberships and mutually exclusive group policies | Chris Magann | 2026-08-31 |
| No automated SoD violation detection or alerting | Conflicts may accumulate between monthly review cycles without detection | Deploy SoD monitoring that alerts on conflicting role assignments at time of provisioning, not just during reviews | Nadia Khan | 2026-07-31 |
