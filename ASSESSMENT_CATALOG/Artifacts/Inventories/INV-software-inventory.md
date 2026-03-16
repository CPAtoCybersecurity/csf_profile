# Authorized Software Inventory

| Field | Value |
|-------|-------|
| **Document ID** | ALMA-INV-SW-2026 |
| **Version** | Q1 2026 (March) |
| **Last Updated** | March 14, 2026 |
| **Maintained By** | IT Security Team |
| **Source** | SentinelOne discovery + ServiceNow approved catalog |
| **Classification** | Internal Use Only |

---

## Overview

This inventory documents all authorized software approved for installation on Alma Security managed endpoints and servers. Software not on this list is blocked by SentinelOne application control on managed endpoints. Installation of unapproved software requires a ServiceNow request and IT Security review.

**Total approved applications:** 87
**Last full review:** February 2026
**Next review:** May 2026 (quarterly)

---

## Endpoint Software (Workstations and Laptops)

### Operating Systems

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| Windows 11 Enterprise | 23H2, 24H2 | Workstation OS | IT Infrastructure | Feb 2026 |
| macOS | 14.x (Sonoma), 15.x (Sequoia) | Workstation OS | IT Infrastructure | Feb 2026 |

### Security and Management

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| SentinelOne Agent | 24.1+ | EDR, application control, device control | IT Security | Feb 2026 |
| CrowdStrike Falcon | N/A | Not deployed (SentinelOne is primary) | N/A | N/A |
| Okta Verify | Latest | MFA authentication | IT Security | Feb 2026 |
| CyberArk Endpoint Privilege Manager | 24.x | Privilege management | IT Security | Feb 2026 |
| GlobalProtect VPN | 6.x | Remote access VPN | IT Infrastructure | Feb 2026 |

### Productivity

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| Microsoft 365 (Office suite) | Latest (cloud-managed) | Email, documents, collaboration | IT | Feb 2026 |
| Slack | Latest | Team communication | IT | Feb 2026 |
| Zoom | Latest | Video conferencing | IT | Feb 2026 |
| Google Chrome | Latest | Web browser (primary) | IT | Feb 2026 |
| Mozilla Firefox | Latest (ESR) | Web browser (secondary) | IT | Feb 2026 |
| Adobe Acrobat Reader | Latest | PDF viewing | IT | Feb 2026 |

### Development Tools

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| Visual Studio Code | Latest | Code editor | Engineering | Feb 2026 |
| JetBrains IntelliJ IDEA | 2024.x, 2025.x | Java/Kotlin IDE | Engineering | Feb 2026 |
| Docker Desktop | 4.x | Container development | Engineering | Feb 2026 |
| Git | 2.x | Version control | Engineering | Feb 2026 |
| Node.js | 20 LTS, 22 LTS | JavaScript runtime | Engineering | Feb 2026 |
| Python | 3.11, 3.12 | Scripting and development | Engineering | Feb 2026 |
| Postman | Latest | API testing | Engineering | Feb 2026 |
| kubectl | 1.28+, 1.29+ | Kubernetes management | Engineering | Feb 2026 |
| AWS CLI | 2.x | AWS management | Engineering | Feb 2026 |
| Terraform | 1.7+, 1.8+ | Infrastructure as code | Engineering | Feb 2026 |

### Collaboration and Project Management

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| Jira | Cloud (latest) | Project tracking | Engineering | Feb 2026 |
| Confluence | Cloud (latest) | Documentation | Engineering | Feb 2026 |
| Figma | Cloud (latest) | UI/UX design | Product | Feb 2026 |
| Miro | Cloud (latest) | Whiteboarding | Product | Feb 2026 |
| ServiceNow | Cloud (latest) | ITSM, access requests | IT | Feb 2026 |
| Workday | Cloud (latest) | HR, training | HR | Feb 2026 |

---

## Server and Infrastructure Software

| Software | Approved Version(s) | Purpose | Approved By | Last Reviewed |
|----------|---------------------|---------|-------------|---------------|
| Amazon Linux 2023 | Latest | EC2 server OS | IT Infrastructure | Feb 2026 |
| Ubuntu Server | 22.04 LTS, 24.04 LTS | EC2 server OS | IT Infrastructure | Feb 2026 |
| Windows Server | 2019, 2022 | On-premises servers | IT Infrastructure | Feb 2026 |
| Windows Server 2012 R2 | 2012 R2 (EOL) | Legacy file server (risk-accepted, migration Q3 2026) | CISO exception | Feb 2026 |
| PostgreSQL | 15.x, 16.x | Production database (RDS) | Engineering | Feb 2026 |
| Redis | 7.x | Caching (ElastiCache) | Engineering | Feb 2026 |
| Nginx | 1.24+, 1.26+ | Web server / reverse proxy | Engineering | Feb 2026 |
| Kubernetes | 1.28, 1.29 | Container orchestration (EKS) | IT Infrastructure | Feb 2026 |
| Velero | 1.13+ | Kubernetes backup | IT Infrastructure | Feb 2026 |
| Helm | 3.x | Kubernetes package management | Engineering | Feb 2026 |

---

## SaaS Applications

| Application | Purpose | Data Classification | Security Review Date | Owner |
|-------------|---------|--------------------|--------------------|-------|
| Salesforce | CRM | Tier 4 (General Business) | August 2025 | Sales |
| HubSpot | Marketing automation | Tier 4 (General Business) | July 2025 | Marketing |
| Datadog | Infrastructure monitoring | Tier 3 (Alma IP) | June 2025 | Engineering |
| GitLab | Source code, CI/CD | Tier 3 (Alma IP) | September 2025 | Engineering |
| PagerDuty | On-call management | Tier 4 (General Business) | May 2025 | Engineering |
| Snyk | Dependency scanning | Tier 3 (Alma IP) | October 2025 | Engineering |

---

## Known Gaps

| Issue | Impact | Remediation |
|-------|--------|-------------|
| Estimated 15-20% of SaaS tools in use have not been through formal security review | Unreviewed tools may not meet security standards | SaaS audit planned Q2 2026 |
| Developer-installed free/open-source tools not consistently captured | Shadow IT risk for developer workstations | Enhance SentinelOne discovery reporting |
| Application dependency libraries (npm, pip) not tracked in this inventory | Transitive dependency risk | SBOM initiative in progress |

---

## Change Process

1. New software requests submitted via ServiceNow
2. IT Security reviews for: known vulnerabilities, license compliance, data handling, vendor security posture
3. Approved software added to this inventory and SentinelOne allowlist
4. Denied requests documented with rationale and communicated to requester
5. Quarterly review of full inventory for continued appropriateness

---

*This is a fictional example created for educational purposes.*
