# PR.IR-01_Ex2: DMZ and Gateway Security

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex2: DMZ and gateway security mechanisms (e.g., firewalls, web application firewalls, proxies) are used to control traffic flows between network segments and to filter potentially harmful content.

## Alma Security Implementation

Alma uses a Palo Alto next-generation firewall with deny-by-default policies, 2FA-protected admin access, application-layer inspection, and IPS at the Redwood City perimeter. In AWS, ALBs with Security Groups restrict inbound traffic to ports 443/80, but no WAF is deployed -- the WAF Install project ($112K budget) is in progress. VPC Flow Logs and DNS query logging provide traffic visibility but do not filter at the gateway layer.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Palo Alto firewall rulebase | Firewall management console | 2026-02-15 |
| Palo Alto 2FA configuration | Windows Authenticator / firewall admin settings | 2026-01-20 |
| AWS ALB configuration | AWS Console / IaC repository | 2026-02-20 |
| WAF Install project charter | Project management system | 2026-03-01 |
| VPC Flow Logs configuration | AWS CloudWatch | 2026-02-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No WAF deployed for cloud-hosted applications | Exposure to application-layer attacks (OWASP Top 10) | Complete WAF Install project ($112K budget approved) | Tigan Wang | 2026-06-30 |
| Firewall rule review cadence not formalized | Rule sprawl and stale rules accumulate over time | Establish quarterly firewall rule review process | Tigan Wang | 2026-05-15 |
