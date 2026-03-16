# Quarterly Access Recertification Procedure

| Field | Value |
|-------|-------|
| **Procedure ID** | ALMA-SOP-2025-006 |
| **Version** | 1.2 |
| **Effective Date** | March 1, 2025 |
| **Last Reviewed** | February 16, 2026 |
| **Procedure Owner** | IT Security Manager |
| **Approved By** | CISO |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This procedure defines the steps for conducting quarterly access recertification campaigns to verify that user access to Alma Security systems remains appropriate, compliant with least privilege, and aligned with current job responsibilities.

---

## 2. Scope

This procedure covers recertification of:

- Application access (all production applications)
- Privileged accounts (domain admins, application admins, database admins)
- Third-party and contractor access
- Service accounts (semi-annual)

---

## 3. Schedule

| Quarter | Campaign Launch | Certification Deadline | Remediation Deadline |
|---------|----------------|----------------------|---------------------|
| Q1 | January 15 | January 29 (14 days) | February 12 (5 business days) |
| Q2 | April 15 | April 29 | May 13 |
| Q3 | July 15 | July 29 | August 12 |
| Q4 | October 15 | October 29 | November 12 |

---

## 4. Procedure Steps

### Step 1: Campaign Preparation (IT Security, Days -5 to 0)

1. Extract current access entitlements from Okta, CyberArk, AWS IAM, and application-level role assignments
2. Cross-reference against HR active employee roster from Workday to identify terminated or transferred users
3. Flag accounts with no activity in the past 90 days for certifier attention
4. Configure certification campaign in ServiceNow with the following parameters:
   - Reviewer assignments (managers for standard access, asset owners for application-specific access, CISO for privileged access)
   - 14-day completion window
   - Automated daily reminders starting at day 7
   - Escalation to CISO at day 12 for incomplete certifications

### Step 2: Campaign Launch (IT Security, Day 0)

1. Notify all certifiers via email and Slack with campaign instructions and deadline
2. Provide certifiers with their review queue in ServiceNow including:
   - User name and department
   - Entitlements to review
   - Last login date
   - Risk flags (inactive accounts, separation of duty conflicts)
3. Open certification portal for certifier access

### Step 3: Certification Review (Certifiers, Days 1-14)

For each user entitlement, the certifier must select one of:

| Decision | Meaning | Action |
|----------|---------|--------|
| **Certify** | Access is appropriate and required | No change |
| **Revoke** | Access is no longer needed | IT Security deprovisions within 5 business days |
| **Modify** | Access level needs adjustment | IT Security adjusts per certifier instructions |
| **Flag for Review** | Certifier is unsure; needs investigation | IT Security investigates and follows up |

**Requirements:**
- Each entitlement must be individually reviewed (bulk "certify all" is not permitted)
- Certifiers must document justification for any flagged items
- Privileged account certifications require explicit written justification for continued access

### Step 4: Privileged Account Deep Review (IT Security + CISO, Days 1-14)

In parallel with the general campaign:

1. IT Security pulls complete privileged account inventory from CyberArk
2. Cross-reference against approved privileged access list
3. Verify each privileged account has:
   - Named individual owner
   - Documented business justification
   - Separate from standard user account
   - MFA enabled
   - Session logging active
4. CISO reviews and certifies all privileged accounts
5. Identify any privileged accounts not in CyberArk and remediate

### Step 5: Third-Party Access Review (Vendor Manager + IT Security, Days 1-14)

1. Review all active third-party accounts against current contract status
2. Verify account expiration dates align with contract terms
3. Confirm third-party AUP acknowledgments are current
4. Verify session logging is active for third-party privileged access

### Step 6: Remediation (IT Security, Days 14-19)

1. Process all revocation decisions within 5 business days:
   - Disable account in Okta (immediate)
   - Remove application-level roles
   - Revoke CyberArk privileged access
   - Update ServiceNow ticket with completion confirmation
2. Process modification requests per certifier instructions
3. Investigate and resolve all flagged items
4. Document any accounts where revocation is delayed with justification

### Step 7: Campaign Closure and Reporting (IT Security, Day 20)

1. Generate campaign completion report including:
   - Total entitlements reviewed
   - Completion rate by certifier
   - Revocations and modifications made
   - Flagged items and resolution status
   - Non-compliant certifiers (if any)
2. Submit report to CISO
3. File report in the assessment evidence repository

---

## 5. Escalation

| Condition | Escalation |
|-----------|------------|
| Certifier has not started by day 7 | Automated email + Slack reminder |
| Certifier has not completed by day 12 | Escalation to certifier's manager and CISO |
| Certifier has not completed by day 14 | CISO reviews outstanding items directly |
| Revocation not completed by day 19 | Escalation to IT Security Manager |

---

## 6. Metrics

| Metric | Target | Q4 2025 Actual |
|--------|--------|----------------|
| Campaign completion rate | 100% | 96% |
| Completion within 14-day window | 95% | 92% |
| Revocations processed within SLA | 100% | 100% |
| Accounts revoked per campaign | N/A (informational) | 23 |

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Access Management Policy | ALMA-POL-2025-002 |
| Information Security Policy | ALMA-POL-2025-001 |
| Third-Party Risk Management Policy | ALMA-POL-2025-007 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2025 | IT Security Team | Initial procedure |
| 1.1 | August 1, 2025 | IT Security Team | Added privileged account deep review; expanded metrics |
| 1.2 | February 16, 2026 | S. Chen | Updated Q4 2025 metrics; clarified escalation timelines |

---

*This is a fictional example created for educational purposes.*
