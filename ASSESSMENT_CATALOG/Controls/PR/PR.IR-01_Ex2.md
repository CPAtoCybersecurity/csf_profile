# PR.IR-01_Ex2: DMZ and Gateway Security

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex2: DMZ and gateway security mechanisms (e.g., firewalls, web application firewalls, proxies) are used to control traffic flows between network segments and to filter potentially harmful content.

## Alma Security Implementation

Alma Security employs a Palo Alto next-generation firewall as the primary perimeter gateway for the Redwood City on-premises data center. The firewall enforces deny-by-default policies, with explicit allow rules for authorized traffic flows between network zones. Administrative access to the firewall requires two-factor authentication through Windows Authenticator, reducing the risk of unauthorized configuration changes. The firewall provides application-layer inspection, URL filtering, and intrusion prevention capabilities at the network boundary.

In the AWS environment, internet-facing traffic is routed through Application Load Balancers (ALBs) with Security Groups restricting inbound traffic to required ports (443, 80). However, Alma Security does not currently have a Web Application Firewall (WAF) deployed. This is a recognized gap with an approved remediation project — the WAF Install project has a $112K budget and is currently in progress. Until the WAF is operational, the organization lacks application-layer filtering for web traffic, leaving exposure to OWASP Top 10 threats such as SQL injection, cross-site scripting, and request smuggling at the gateway.

VPC Flow Logs and DNS query logging provide visibility into traffic patterns but are monitoring controls rather than gateway filtering controls. The combination of a strong on-premises perimeter (Palo Alto) and a gap in cloud application-layer filtering (no WAF) creates an asymmetric security posture across the hybrid environment.

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
