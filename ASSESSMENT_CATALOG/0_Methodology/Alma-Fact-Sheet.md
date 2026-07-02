# Alma Security — Canonical Fact Sheet

**Status:** Authoritative (resolves issue #234)
**Precedence:** This document is the single source of truth for every fact about Alma Security. When any other file in this repository states a different value, that file is wrong and gets corrected to match this sheet. See §10 for the known legacy values awaiting correction.

> Alma Security is fictional. This fact sheet exists so that every control description, test procedure, observation, artifact, and report in this training catalog describes the *same* fictional company.

---

## 1. Company Identity

| Fact | Canonical Value |
|---|---|
| Legal name | Alma Security, Inc. |
| Founded | **2021**, by Chris Meyers (former CTO, Sigma Systems; former senior security engineer, HPE) |
| Headquarters | Redwood City, California |
| Business | Continuous authentication SaaS — biometric and behavioral identity verification for enterprises |
| Mission | "Ensure businesses can continuously authenticate their users using their whole selves." |
| Stage | Series B |
| Employees (current, Q1 2026) | **300** |
| ARR (current, Q1 2026) | **$36.4M** |

### Timeline

| Year | Milestone |
|---|---|
| 2021 | Founded; seed funding; first product release |
| 2022 (Nov) | Series A — $12.0M, led by Foundry Ridge Ventures |
| 2023 | Growth year; ~120 employees by year end; FY2023 revenue $9.6M |
| 2024 (Mar) | **INC-2024-01** — public S3 bucket exposure (see §8) |
| 2024 (Aug) | **INC-2024-02** — compromised developer SSH key (see §8) |
| 2024 (Q3–Q4) | Five senior security staff depart; public trust score collapses; FY2024 closes at 200 FTE / $22.2M revenue |
| 2025 (Jan) | New CISO (Gerry Callahan) hired; security program rebuild begins; TTD baseline measured at 81 hours (Oct 2024 measurement) |
| 2025 (Feb) | Series B — $47.5M, led by Corvid Growth Partners; round terms include governance conditions: independent board members, an Audit Committee, and a documented Internal Audit function |
| 2025 | FY2025 revenue $31.8M; 270 FTE at year end |
| 2026 (Q1) | First annual NIST CSF 2.0 assessment cycle begins (the assessment this catalog documents) |

## 2. Organization (300 employees)

| Department | Headcount |
|---|---|
| Engineering / R&D | 110 |
| Sales & Marketing | 75 |
| Customer Success | 35 |
| IT & Security | 45 (30 IT, 15 Security) |
| Finance & Accounting | 20 |
| HR & Admin | 13 |
| Internal Audit | 2 |
| **Total** | **300** |

The security team of 15 covers Detection & Response, Vulnerability Management, and security-focused IT. Internal Audit reports functionally to the Audit Committee of the Board and administratively to the CFO — it is organizationally independent of the CISO and the security team (see the [Independence Statement](Scoring-Rubric-and-Methodology.md#6-independence-statement)).

## 3. Cast of Characters

Full names are canonical. Legacy single-name placeholders (Gerry / Jane / John / Steve / OG) map to these people.

| Name | Role | Email | Legacy placeholder |
|---|---|---|---|
| Chris Meyers | Founder & CEO | chris.meyers@almasecurity.com | — |
| Marcus Lee | CTO | marcus.lee@almasecurity.com | — |
| Dana Okafor | CFO | dana.okafor@almasecurity.com | — |
| Priya Raman | Audit Committee Chair (independent director) | — (board) | — |
| **Gerry Callahan** | CISO (hired Jan 2025) | gerry.callahan@almasecurity.com | "Gerry", gerry@almasecurity.com |
| Nadia Khan | Detection & Response Lead | nadia.khan@almasecurity.com | — |
| Chris Magann | Vulnerability Management Lead | chris.magann@almasecurity.com | — |
| Tigan Wang | Vulnerability Management Engineer | tigan.wang@almasecurity.com | — |
| **Jane Alvarez** | Product Engineer (control stakeholder) | jane.alvarez@almasecurity.com | "Jane", jane@almasecurity.com, "Jane Doe" |
| **John Tran** | Financial Systems Analyst (control stakeholder) | john.tran@almasecurity.com | "John", john@almasecurity.com |
| **Steve Mercer** | Director, Internal Audit — Lead Assessor of record | steve.mercer@almasecurity.com | "Steve", "Steve M", steve@almasecurity.com |
| **Omar Garza** | Senior IT Auditor, Internal Audit — second assessor | omar.garza@almasecurity.com | "OG" |
| Dana Whitfield | Quality Assurance Reviewer, Internal Audit (contract, part-time) | dana.whitfield@almasecurity.com | "Jane Doe" (audit report QR line) |

**Role rules:** Steve Mercer and Omar Garza perform assessments and are NEVER control owners, control operators, scoped personnel, or remediation owners. Gerry Callahan is the accountable owner for most security controls; Nadia, Chris Magann, Tigan, Jane, and John own or operate specific controls and are legitimate scoped personnel.

## 4. Financials

All figures are canonical; do not round them into new values.

| Metric | FY2023 | FY2024 | FY2025 | Q1 2026 |
|---|---|---|---|---|
| Revenue | $9.6M | **$22.2M** | $31.8M | ARR $36.4M |
| Employees (year end) | 120 | **200** | 270 | 300 |

- **Funding:** Seed $2.5M (2021); Series A $12.0M (Nov 2022, Foundry Ridge Ventures); **Series B $47.5M (Feb 2025, Corvid Growth Partners)**. Total raised: $62.0M. A Series C is under discussion but not raised.
- **Balance sheet (Q1 2026):** cash and equivalents $51.2M; deferred revenue $8.9M; no debt.
- **Burn / runway:** net monthly burn $1.65M; **runway ≈ 31 months**.
- **Profitability:** not profitable; FY2025 net loss $18.4M (deliberate growth investment).
- **Security budget FY2026:** $5.3M operating (15-person team, tooling, program costs) plus $637K of named security projects: MFA Rollout $80K, Data Encryption Upgrade $95K, Cloud Security Optimization $100K, Incident Response Enhancement $150K, WAF $112K, ASM implementation $100K.

## 5. Technology Stack (the ONE canonical stack)

| Layer | Canonical tools |
|---|---|
| Cloud | AWS (multi-AZ, Kubernetes/EKS, S3, ALB); a few legacy Ubuntu hosts among mostly Amazon Linux 2 |
| Data | PostgreSQL (all application databases) |
| Logging / detection | AWS CloudTrail, GuardDuty, VPC Flow Logs, DNS query logs — SIEM-like monitoring is AWS-native (no third-party SIEM) |
| Endpoint | SentinelOne EDR (workstations, laptops) |
| Network / access | Palo Alto firewall (2FA via Windows Authenticator tied to SSO; 802.1X) |
| On-prem | Windows domain (ALMA) — DC in Redwood City HQ; domain-joined Windows 2012 fileserver |
| ITSM / GRC | ServiceNow (tickets, supplier inventory, vendor workflows, risk register) |
| Alerting | PagerDuty (after-hours paging) |
| Corporate | Workday (HR, training), Slack, Microsoft 365 / Outlook 365 (with O365 ATP), SharePoint Online / OneDrive |
| Privileged access | CyberArk (privileged account vaulting and PAM workflows) |
| Supply-chain integrity | Sigstore / Cosign (artifact signing) |

**Explicitly NOT in the stack:** Splunk, CrowdStrike, Okta, Jira. If any file mentions these, it is noncanon and gets corrected (SIEM = AWS-native; EDR = SentinelOne; SSO/MFA = Windows Authenticator + Palo Alto; tickets = ServiceNow).

## 6. Risk Register (the ONE canonical register)

The strategic risk register lives in ServiceNow and is reviewed monthly by CISO staff, formally updated quarterly. R-numbers below are canonical — the `alma-controls.csv` mapping wins over older variants.

| ID | Title | Risk Statement | Driver | Owner | Treatment | Linked Strategy | Linked CSF | Target | Cadence |
|---|---|---|---|---|---|---|---|---|---|
| R1 | Security understaffing | Security team is understaffed by 50% after 5 key departures, so detection, response, and remediation work exceeds capacity | Post-incident departures, Q3–Q4 2024 | Gerry Callahan | Mitigate | STS1 (hire 5 A-tier professionals) | GV.RR, PR.AT | 2026-09 | Monthly |
| R2 | No perimeter / attack-surface monitoring | External perimeter is not continuously monitored for exposed ports, services, and unknown hosts, so internet-facing weaknesses persist undetected | Bimonthly scans only; no owner for results | Nadia Khan | Mitigate | STS2 (ASM solution) | ID.AM, DE.CM | 2026-06 | Monthly |
| R3 | Slow detection and investigation | Detecting and beginning investigation of malicious behavior takes days, so attacker dwell time is excessive | TTD baseline 81h (Oct 2024, post-INC-2024-02) | Nadia Khan | Mitigate | STS3 (detection & response investment) | DE.AE, RS.AN | 2027-01 (TTD <4 min) | Monthly |
| R4 | Incomplete asset inventory | No full inventory of assets (external hosts, S3 buckets, endpoints), so the attack surface cannot be fully protected | Growth outpaced IT asset management | Chris Magann | Mitigate | STS4 (asset inventory integrated with ASM) | ID.AM | 2026-08 | Monthly |
| R5 | Low public trust | Public trust score remains low after the 2024 incidents, threatening the viability of an authentication product | INC-2024-01, INC-2024-02 | Gerry Callahan (with Marketing) | Mitigate | STS5 (transparency / PR program) | GV.OC, RC.CO | 2027-01 (trust 90%+) | Quarterly |
| R6 | Third-party / supplier risk | A compromise or failure at a critical supplier (especially processors of biometric data) could cascade into Alma's platform and reputation | Vendor count growth; Apple Passkey integration | Gerry Callahan | Mitigate | STS6 (TPRM program in ServiceNow) | GV.SC | 2026-12 | Quarterly |

**Operational risk entries** (specific technical risks, e.g. the shared developer SSH key) use the `R-{AREA}-NNN` convention in ServiceNow (e.g. `R-SSH-001`) and roll up to a strategic risk (R-SSH-001 → R4/R2). Strategy IDs STS5 and STS6 are additions to the legacy STS1–STS4 list.

## 7. Threat Profile

Who realistically targets a 300-person biometric-authentication SaaS, in priority order:

1. **Organized cybercrime (extortion-motivated).** Biometric templates and authentication metadata are high-leverage extortion material — unlike passwords, biometrics cannot be rotated. Ransomware-plus-exfiltration is the dominant scenario.
2. **Fraud actors targeting the product.** Credential-stuffing crews and auth-bypass specialists probe the platform itself; a bypass of Alma's continuous authentication is directly monetizable against Alma's customers.
3. **Supply-chain attackers.** Compromise of a critical vendor or of Alma's build pipeline (hence Sigstore/Cosign signing) to reach Alma's enterprise customer base (ties to R6).
4. **Nation-state collection.** Durable interest in bulk biometric identity data; lower likelihood, highest impact.
5. **Insider / development-workflow risk.** Shared credentials and over-privileged developer access (the INC-2024-02 pattern; R-SSH-001).

## 8. Incident History (the two 2024 incidents)

### INC-2024-01 — Public S3 bucket exposure (March 2024)

A production S3 bucket holding customer configuration exports was set world-readable during a migration. An independent researcher found it and published after a disclosure dispute. **~18,400 customer configuration records** exposed (tenant names, admin emails, policy configurations — **no biometric templates**). Public coverage was severe because Alma sells trust. Direct cause of the public-trust collapse (R5) and the customer trust surveys referenced throughout the catalog.

### INC-2024-02 — Compromised developer SSH key (August 2024)

A shared developer SSH key (issued during laptop provisioning, port 45001 access to Kubernetes nodes) was exfiltrated from a contractor laptop. The actor accessed a staging node and attempted lateral movement toward production. Detection took **81 hours** — the figure later formalized as the October 2024 TTD baseline (R3). Contained before production data access; the shared-key practice became risk entry R-SSH-001 (rolls up to R2/R4).

**Aftermath of both:** five senior security staff departed Q3–Q4 2024 (R1); the board added security governance conditions to the Feb 2025 Series B; Gerry Callahan was hired as CISO in January 2025 to rebuild the program.

Any reference to "2022 security events" is noncanon — the canonical incident year is **2024**.

## 9. Assessment Context

| Fact | Canonical Value |
|---|---|
| Assessment name | **2026 Alma Security CSF Assessment** |
| Framework | NIST CSF 2.0, scored per the [Scoring Rubric](Scoring-Rubric-and-Methodology.md) |
| Period | Calendar year 2026, quarterly cycles (Q1–Q4); Q1 fieldwork Jan 1 – Mar 10, 2026 |
| Scope | 40 control implementations across all six CSF functions (see Scope Statement) |
| Assessor of record | Internal Audit — Steve Mercer (lead), Omar Garza (assessor), Dana Whitfield (QA review) |
| Report | IA-2026-001 (Q1 2026) |
| KPI targets | TTD <4 min by Jan 2027; TTR-CJC <16h by Aug 2027; TTR-C <3 days by Aug 2027; public trust 90%+ by Jan 2027 |

## 10. Known Legacy Values (noncanon → canonical)

The propagation sweep completed 2026-07 ([#237]) — every row below is corrected in the repo. The table is retained as the reference list of banned values: the coherence lint ([#238], `scripts/coherence-lint.mjs`) greps for them in CI so they cannot re-enter.

| Noncanon value | Canonical value | Status |
|---|---|---|
| Founded 2023 | Founded 2021 | fixed (#234) |
| "2022 security events" | 2024 incidents (INC-2024-01/-02) | fixed (#237) — alma-controls.csv, alma-assessments.csv |
| ~120-person company (as current) | 120 = FY2023 headcount; current = 300 | fixed (#237) — GV.RM-03_Ex1.md |
| R2 = asset inventory, R4 = public trust | R2 = perimeter monitoring, R4 = asset inventory (see §6) | fixed (#234) — 1_Case_Study/README.md |
| TTD <4 min "by Jan 2025" / TTR-CJC "by Aug 2025" | by Jan 2027 / by Aug 2027 | fixed (#237) — CSVs, src stores, spreadsheet templates |
| "2025 Alma Security CSF" (and name variants) | 2026 Alma Security CSF Assessment | fixed (#237) — CSV, observations, assessmentsStore.js |
| Assessor "Steve <steve@almasecurity.com>" | Steve Mercer, Internal Audit <steve.mercer@almasecurity.com> (comma-free form in CSVs) | fixed (#237) — observations, test procedures, CSV |
| Assessor "OG" | Omar Garza, Internal Audit | fixed (#237) — ID.AM-01-Q1.md, PROC-sampling-walkthrough.md |
| "Jane Doe" (quality reviewer) | Dana Whitfield | fixed (#235) — 6_Audit_Report |
| Steve = "GRC Manager" | Steve Mercer = Director, Internal Audit | fixed (#237) — src/stores/userStore.js |
| Nadia Khan = SRE; Chris Magann = Security Engineer | D&R Lead; VM Lead (see §3) | fixed (#237) — src/stores/userStore.js |
| "Series C funding" (as raised) | Series B raised Feb 2025; Series C only under discussion | fixed (#237) — GV.RM-01-Q1.md |
| Splunk / CrowdStrike / Okta / Jira | Not in stack (see §5) | fixed (#237) — 20 catalog files reconciled |
| Score 5.0 labeled "Some Security" | 5.0–5.9 = Minimally Acceptable | fixed (#235) — 6_Audit_Report |
| `{Subcat}-Ex{N}.md` control filenames | `{Subcat}_Ex{N}.md` per the Canonical Schema | fixed (#237) — 74 files renamed in 2_Controls/ID/ |
| Dead `feature/api-integration` case-study links | relative links into `1_Case_Study/` | fixed (#237) — GV.RM-01.md, GV.RM-03_Ex1.md, EVD-GV.RM-02 |

One canon *addition* from the sweep: CyberArk (privileged access) was used consistently across eight scenario files and has been added to the §5 stack rather than rewritten out.

---

*Created to resolve [#234]. Companion documents: [Canonical Schema](Canonical-Schema.md) (#233), [Scoring Rubric and Methodology](Scoring-Rubric-and-Methodology.md) (#235), [Instructor Key](Instructor-Key.md).*
