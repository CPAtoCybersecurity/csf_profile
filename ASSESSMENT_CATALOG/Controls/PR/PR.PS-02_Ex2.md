# PR.PS-02_Ex2: Monitor for End-of-Life and Unsupported Software

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SA-22 (Unsupported System Components), SI-02 (Flaw Remediation)

## Implementation Example

> Monitor for and identify software that has reached or is approaching end-of-life or end-of-support status, and plan for timely migration, replacement, or compensating controls.

## Alma Security Implementation

Alma Security tracks software end-of-life (EOL) and end-of-support (EOS) dates as attributes within the ServiceNow CMDB for operating systems and major middleware components. The IT operations team maintains a forward-looking EOL calendar that is reviewed monthly during the infrastructure planning meeting. Upcoming EOL milestones within 12 months are flagged and assigned to the responsible system owner for migration planning. AWS provides lifecycle notifications for managed services and AMIs, which the infrastructure team monitors.

The most significant EOL concern in Alma's environment is the Windows Server 2012 R2 fileserver, which reached end of extended support from Microsoft in October 2023. This system is still in production serving file sharing for the Redwood City office. The system has been operating without vendor security patches for over two years, creating elevated vulnerability exposure. Compensating controls include network segmentation (isolated VLAN), restricted access to authorized users only, SentinelOne endpoint protection, and enhanced monitoring. A migration project to replace this fileserver with SharePoint Online/OneDrive is planned for Q3 2026.

For containerized workloads, the team monitors base image EOL status through Amazon ECR image scanning, which flags images built on deprecated or EOL base distributions. However, there is no automated mechanism to block deployment of containers built on EOL base images, and the team relies on periodic manual review of ECR scan results to identify stale images.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| EOL tracking calendar in ServiceNow CMDB | ServiceNow | 2026-03-12 |
| Windows Server 2012 R2 risk acceptance documentation | Risk register / Confluence | 2026-01-15 |
| Windows 2012 R2 compensating controls documentation | Confluence operations wiki | 2026-02-20 |
| Windows 2012 R2 migration project plan (Q3 2026) | Jira project board | 2026-03-01 |
| Amazon ECR image scanning results with EOL flagging | AWS ECR Console | 2026-03-14 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Windows Server 2012 R2 running 2+ years past EOL | Critical --- no vendor patches, elevated vulnerability exposure | Complete migration to SharePoint Online/OneDrive | Chris Magann | Q3 2026 |
| No automated blocking of container deployments using EOL base images | Medium --- EOL container images may enter production undetected | Implement admission controller policy to reject EOL base images | Tigan Wang | Q2 2026 |
| EOL tracking limited to OS and major middleware; application-layer EOL not tracked | Medium --- framework and library EOL may be missed | Extend EOL tracking to include application frameworks and key libraries | Chris Magann | Q3 2026 |
