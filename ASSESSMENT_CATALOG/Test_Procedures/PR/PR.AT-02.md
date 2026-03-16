# PR.AT-02: Specialized Role-Based Training Test Procedures

**CSF Subcategory:** PR.AT-02 - Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind

**Scope:** Alma Security Q1 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Identify roles designated as requiring specialized training**
   - Obtain the organization's role classification matrix or equivalent documentation
   - Verify that roles with elevated access, security responsibilities, or regulatory obligations are formally designated (e.g., D&R analysts, vulnerability management, system administrators, developers)
   - Confirm designation criteria are documented and reviewed at least annually

2. **Review role-based training curriculum and delivery records**
   - Obtain training plans specific to each designated specialized role
   - Verify training content maps to role-specific threats, tools, and procedures (e.g., SentinelOne console operation for D&R, Palo Alto firewall management for network ops)
   - Export Workday training completion records filtered to specialized roles
   - Calculate completion rates per role and identify overdue personnel

3. **Examine hands-on and technical skill validation**
   - Review evidence of practical exercises, tabletop scenarios, or tool-specific certifications
   - Verify D&R team (Nadia Khan) has received training on SentinelOne EDR, incident handling procedures, and Slack-based alert triage
   - Verify VM team (Chris Magann, Tigan Wang) has received training on vulnerability scanning tools, CVSS scoring, and patch prioritization workflows
   - Confirm developer security training covers secure coding practices, dependency scanning, and OWASP Top 10

4. **Assess periodic knowledge testing for specialized roles**
   - Review results of any role-specific assessments, quizzes, or practical evaluations
   - Determine whether assessment results are tracked and remediation is assigned for below-threshold scores
   - Verify assessment cadence aligns with policy requirements

5. **Verify annual refresher requirements**
   - Confirm policy mandates annual refresher training for all specialized roles
   - Review Workday records to verify refresher completions within the last 12 months
   - Identify any specialized personnel who have not completed annual refreshers

---

## Evidence Requests

- [ ] Specialized role designation matrix or policy defining which roles require additional training
- [ ] Role-based training plans/curricula for D&R, VM, DevSec, and system administration
- [ ] Workday training completion reports filtered to specialized roles (last 12 months)
- [ ] Tool-specific certification or training records (SentinelOne, Palo Alto, etc.)
- [ ] Role-based assessment or quiz results
- [ ] Annual refresher completion records for specialized personnel
- [ ] Training budget allocation documentation for specialized roles

---

## Notes

This test procedure validates that individuals in roles with heightened cybersecurity responsibilities receive training beyond general awareness. At Alma Security, key specialized roles include D&R analysts, vulnerability management specialists, DevSecOps engineers, and system/network administrators. The assessment focuses on whether training is role-appropriate, current, and validated through periodic testing. Specialized training maturity is expected to trail general awareness maturity given Alma's growth stage.
