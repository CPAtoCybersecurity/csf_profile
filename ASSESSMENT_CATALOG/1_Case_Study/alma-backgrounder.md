# Alma Security — Company Backgrounder

**Document date:** March 2026
**Prepared by:** Corporate Communications, Alma Security, Inc.

> This is a fictional company profile created for educational purposes by Simply Cyber Academy. Canonical facts: see `ASSESSMENT_CATALOG/0_Methodology/Alma-Fact-Sheet.md`.

---

## Company Overview

Alma Security, Inc. is a continuous-authentication SaaS company headquartered in Redwood City, California. Founded in **2021** by Chris Meyers — previously CTO at Sigma Systems and a senior security engineer at HPE — Alma verifies user identity continuously throughout a session using biometric and behavioral signals, rather than only at login.

Meyers on the founding insight: "I saw a gap in the authentication market, where companies were only looking at one or two aspects of one's identity to do authentication. They weren't looking at the whole picture and turning that into a continuous authentication story."

**Mission:** ensure businesses can continuously authenticate their users using their whole selves.

| Snapshot (Q1 2026) | |
|---|---|
| Employees | 300 |
| Annual recurring revenue | $36.4M |
| Stage | Series B ($47.5M, Feb 2025, led by Corvid Growth Partners; $62.0M total raised) |
| Customers | Enterprise, led by regulated industries |
| Headquarters | Redwood City, CA (on-site Windows domain; product runs on AWS) |

## History and Growth

| Year | Milestone |
|---|---|
| 2021 | Founded; seed funding; first product release |
| 2022 | Series A ($12.0M, Foundry Ridge Ventures) |
| 2023 | Scaled to ~120 employees; $9.6M revenue |
| 2024 | Two public security incidents (March, August); five senior security staff departed; closed FY2024 at 200 employees and $22.2M revenue |
| 2025 | New CISO hired (January); Series B closed (February) with governance conditions including an Audit Committee and an Internal Audit function; $31.8M revenue |
| 2026 | 300 employees; first annual NIST CSF 2.0 assessment cycle underway |

## The 2024 Incidents and the Rebuild

Alma's 2024 was defined by two incidents: a **public S3 bucket exposure** (March 2024, ~18,400 customer configuration records — no biometric templates) and a **compromised shared developer SSH key** (August 2024, staging access detected after 81 hours). For a company that sells trust, the reputational damage exceeded the technical damage — public trust remains Alma's most-watched recovery metric.

The response reshaped the company: Gerry Callahan joined as CISO in January 2025 and rebuilt the security program around an explicit risk register, targeted strategies, and transparent quarterly KPIs (time to detect, time to investigate, time to remediate on crown-jewel and all systems, and public trust score). The Series B investors added governance conditions — independent directors, an Audit Committee chaired by Priya Raman, and a standing Internal Audit function led by Steve Mercer.

## Organization

300 employees: Engineering/R&D 110 · Sales & Marketing 75 · Customer Success 35 · IT & Security 45 (30 IT, 15 security) · Finance & Accounting 20 · HR & Admin 13 · Internal Audit 2.

**Leadership:** Chris Meyers (Founder & CEO) · Marcus Lee (CTO) · Dana Okafor (CFO) · Gerry Callahan (CISO). The 15-person security team includes Nadia Khan (Detection & Response Lead), Chris Magann (Vulnerability Management Lead), and Tigan Wang (Vulnerability Management Engineer). The CISO reports to the CEO with quarterly board reporting.

## Business Priorities

Alma's stated goals: 20% market share and 10,000 active customers by January 2027; a 90%+ customer trust score by January 2027; churn below 5% by August 2026; European launch by August 2026 and India by November 2026; and an Apple Passkeys partnership launching June 2026 — a flagship integration that raises the bar for Alma's own supply-chain and vendor security.

## Technology Environment

Alma runs its product on AWS (Kubernetes/EKS, multi-AZ, S3, PostgreSQL), monitored through AWS-native tooling (CloudTrail, GuardDuty, VPC Flow Logs). Endpoints run SentinelOne. The Redwood City office operates a Windows domain (including a legacy Windows 2012 fileserver), fronted by a Palo Alto firewall with two-factor authentication tied to SSO. Corporate systems include ServiceNow (ITSM, vendor management, risk register), Workday, Slack, Microsoft 365, and PagerDuty. Build artifacts are signed with Sigstore/Cosign.

Known, acknowledged weaknesses — the subject of active remediation projects — include gaps in continuous perimeter monitoring, an incomplete asset inventory, shared developer SSH keys, and the absence of 24/7 alert coverage.

## Security Risks and Strategy

The security program is built around six register risks: understaffing after the 2024 departures (R1); no continuous perimeter/attack-surface monitoring (R2); slow detection and investigation (R3); incomplete asset inventory (R4); low public trust (R5); and third-party/supplier risk (R6). Matching strategies: hire five A-tier security professionals; implement attack surface management; invest in detection and response; deploy an integrated asset inventory; rebuild trust through transparency; and formalize third-party risk management in ServiceNow.

Progress is reported quarterly against public KPI targets: time-to-detect under 4 minutes by January 2027 (from an 81-hour baseline in October 2024, already down to 9 hours), crown-jewel remediation under 16 hours by August 2027, and a public trust score above 90% by January 2027.
