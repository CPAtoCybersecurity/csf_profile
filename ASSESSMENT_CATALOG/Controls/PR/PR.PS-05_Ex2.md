# PR.PS-05_Ex2: Restrict Administrative Installation Privileges

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), AC-06 (Least Privilege)

## Implementation Example

> Restrict the ability to install software to authorized administrators, preventing standard users from installing applications without IT approval and elevated privileges.

## Alma Security Implementation

Alma Security enforces privilege restrictions that prevent standard users from installing software on Windows workstations. Windows endpoints are domain-joined to the on-premises Active Directory, and Group Policy Objects (GPOs) restrict local administrator access. Standard users cannot install Windows applications, modify system settings, or run installers that require UAC elevation. When employees require software not in the standard image, they submit a ServiceNow request that routes through the IT helpdesk for installation.

For macOS laptops (the majority of the endpoint fleet), Alma uses a combination of Jamf Pro for device management and SentinelOne for application control. Jamf enforces a managed configuration that requires IT approval for applications outside the self-service catalog. However, macOS users with admin rights on their machines can install applications from the App Store or downloaded DMG files without IT intervention. Approximately 40% of users (primarily engineering and product teams) have local admin rights on their macOS devices to support development workflows.

The elevated privilege on developer machines represents the primary gap in this control. While SentinelOne monitors application execution on these devices, the combination of local admin rights and application control in detection-only mode means developers can install and run virtually any software. The security team compensates through quarterly reviews of SentinelOne's application inventory for developer machines and Slack-based reporting of newly observed applications.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Active Directory GPO restricting local admin on Windows endpoints | AD Group Policy Management Console | 2026-03-10 |
| Jamf Pro device management configuration | Jamf Pro Console | 2026-03-14 |
| ServiceNow software installation request workflow | ServiceNow | 2026-03-12 |
| Local admin privilege audit report (showing 40% engineering/product have admin) | Jamf Pro / AD audit report | 2026-03-10 |
| Quarterly developer workstation application review | SentinelOne Console / Confluence | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 40% of users (engineering/product) have local admin rights on macOS | High --- these users can install arbitrary software bypassing IT controls | Evaluate privilege elevation tools (e.g., Jamf Connect Privilege, Privileges.app) to provide just-in-time admin access | Chris Magann | Q2 2026 |
| No automated blocking of unauthorized installations on admin-enabled machines | Medium --- reliance on detection-only monitoring for admin users | Enable SentinelOne enforcement mode for unauthorized application categories on admin machines | Chris Magann | Q3 2026 |
