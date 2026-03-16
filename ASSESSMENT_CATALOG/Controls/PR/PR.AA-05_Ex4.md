# PR.AA-05 Ex4: Separation of Duties and Conflict-of-Interest Controls

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-5, AC-6, CM-5

## Implementation Example

> Implementing separation of duties (SoD) controls to prevent any single individual from having the ability to perform conflicting or sensitive combinations of functions without oversight, enforced through technical controls and monitored for violations

## Alma Security Implementation

Alma Security enforces separation of duties through Active Directory group membership restrictions, AWS IAM policy conditions, and CI/CD pipeline controls documented in the Access Management Policy. Key SoD controls prevent a single individual from both approving and provisioning access requests in ServiceNow, require separate code reviewer and deployment approver in GitHub Actions production workflows, and enforce dual authorization for financial transactions in the ERP system. Administrative SoD enforcement relies primarily on monthly privileged access reviews to detect conflicting role assignments. The SoD matrix defines incompatible role combinations across identity management, application ownership, and financial approval functions.

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
