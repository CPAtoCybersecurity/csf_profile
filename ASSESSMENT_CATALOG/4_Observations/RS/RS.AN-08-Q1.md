# RS.AN-08: Incident Magnitude Estimation — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook magnitude estimation procedures, ServiceNow incident tickets with scope validation documentation, GuardDuty finding correlation across accounts |
| Interview | Yes | Interviewed Nadia Khan on incident magnitude estimation methodology; SOC analyst on IOC sweep and lateral movement detection procedures |
| Test | Yes | Reviewed 2 recent incidents for magnitude estimation documentation; validated IOC sweep capability across SentinelOne fleet; tested GuardDuty cross-account finding correlation |

---

## Findings

Alma Security estimates incident magnitude through a combination of initial GuardDuty severity assessment and manual SOC analyst investigation. When an incident is declared, the assigned analyst reviews other potential targets by searching for indicators of compromise across the SentinelOne endpoint fleet and CloudTrail logs. GuardDuty findings include related resource identification that helps scope the blast radius within AWS infrastructure.

SentinelOne's threat hunting capability allows analysts to search for IOCs (file hashes, IP addresses, domain names, behavioral patterns) across all managed endpoints. This provides the ability to identify additional compromised systems beyond the initial detection. However, the magnitude estimation process is largely manual and analyst-dependent. GuardDuty provides automated finding correlation within AWS but does not extend to on-premises or SaaS systems. There are no automated IOC sweep tools that run proactively when a new incident is declared.

### Strengths

- SentinelOne threat hunting enables fleet-wide IOC sweeps across managed endpoints
- GuardDuty correlates related findings across AWS accounts to identify blast radius
- Incident response playbook includes magnitude estimation as a required investigation step
- CloudTrail provides searchable event history for scoping cloud-level impact

### Gaps

- No automated IOC sweep triggered upon incident declaration
- Magnitude estimation is manual and dependent on individual analyst thoroughness
- Cross-platform magnitude assessment (cloud + endpoint + SaaS) not unified
- No validated magnitude estimation validation step before determining response scope

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook magnitude estimation section
- 2 ServiceNow incident tickets with scope assessment documentation
- SentinelOne threat hunting query examples and results
- GuardDuty cross-account finding correlation examples
- IOC sweep procedure documentation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Implement automated IOC sweep triggered upon incident declaration across all detection platforms | High | Nadia Khan |
| 2 | Develop standardized magnitude estimation checklist with required scoping actions | High | Nadia Khan |
| 3 | Add magnitude validation step requiring independent confirmation of estimated scope | Medium | Nadia Khan |
| 4 | Build cross-platform IOC correlation capability spanning cloud, endpoint, and SaaS environments | Medium | Nadia Khan |
