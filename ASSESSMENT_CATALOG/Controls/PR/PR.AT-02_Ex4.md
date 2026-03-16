# PR.AT-02_Ex4: Require Annual Refreshers for Specialized Roles

**Subcategory:** PR.AT-02 — Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-03 (Role-Based Training), AT-06 (Training Feedback)

## Implementation Example

> Require annual refresher training for individuals in specialized roles to maintain currency with evolving threats, tools, and procedures specific to their responsibilities.

## Alma Security Implementation

Alma Security does not yet have a formal annual refresher requirement specifically designated for specialized roles. While the general quarterly awareness training program applies to all employees including those in specialized roles, there is no additional annual refresher requirement that covers role-specific content such as updated tool configurations, emerging threat techniques relevant to their function, or changes to internal procedures. The distinction between general awareness refreshers and specialized role refreshers has not been formally established in policy.

In practice, some specialized role refresher activity occurs organically. The D&R team receives updated SentinelOne training when major platform versions are released, and Nadia Khan coordinates informal knowledge-sharing sessions when new threat techniques are observed in the wild. The VM team attends annual vendor conferences and webinars that serve as de facto refreshers on vulnerability management practices. Network administrators receive Palo Alto firewall update training tied to firmware upgrades. However, none of these activities are mandated by policy, tracked centrally in Workday, or enforced through compliance mechanisms.

The CISO has acknowledged this gap and has included the establishment of formal annual specialized role refresher requirements in the Q2 2026 training program improvement roadmap. The plan calls for role-specific refresher modules developed in collaboration with team leads (Nadia Khan for D&R, Chris Magann for VM) and delivered through Workday to enable centralized tracking and compliance enforcement. Until this is implemented, Alma relies on team-level initiative and vendor-driven update training.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| General quarterly awareness refresher completion records (applies to all employees) | Workday Reporting | 2026-03-10 |
| SentinelOne platform update training records for D&R team | Nadia Khan / Vendor portal | 2026-02-10 |
| Vendor conference attendance records for VM team | Expense reports | 2026-03-01 |
| Palo Alto firmware update training records | Network admin documentation | 2026-01-25 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Gap |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal policy requirement for specialized role annual refreshers distinct from general awareness | High — specialized personnel may not maintain currency with role-specific tools and procedures | Draft and approve policy amendment establishing mandatory annual specialized refreshers with role-specific content requirements | CISO | Q2 2026 |
| Specialized refresher activities are not tracked in Workday | High — no centralized compliance tracking; reliance on team-level documentation creates audit gaps | Develop role-specific refresher modules in Workday with annual auto-assignment and completion tracking | Security Team + HR | Q3 2026 |
| No mechanism to incorporate lessons learned from incidents into specialized refresher content | Medium — refresher content may not reflect the most current and relevant threats | Establish process requiring post-incident lessons learned to be incorporated into the next scheduled specialized refresher | Nadia Khan + CISO | Q3 2026 |
