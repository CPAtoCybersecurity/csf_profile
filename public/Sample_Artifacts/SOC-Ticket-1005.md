# SOC Incident Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | SOC-Ticket-1005 |
| **Status** | Open |
| **Priority** | Medium |
| **Assigned To** | Security Analyst Team |
| **Date Opened** | May 19, 2025 |
| **Last Updated** | May 19, 2025 - 10:30 AM PST |

---

## Incident Details

| Field | Value |
|-------|-------|
| **Reported By** | Automated SIEM Alert |
| **Date Detected** | May 19, 2025 |
| **Time Detected** | 9:45 AM PST |
| **Incident Type** | Account Lockout - Suspicious Login Attempts |
| **Affected User** | `jdoe@alma.com` |
| **Source IP** | 203.0.113.47 (non-standard location) |
| **Alert Rule Triggered** | SIEM-Rule-2015: Multiple Failed Authentication Attempts |

### Description

SIEM generated an alert for multiple failed login attempts resulting in account lockout for `jdoe@alma.com`. The failed attempts originated from an IP address not associated with the user's normal location, indicating a possible brute force or credential stuffing attack.

---

## Impact Assessment

- Potential account compromise attempt in progress
- Temporary loss of access for legitimate user
- Possible brute force or password spraying attack targeting organization

---

## Evidence / Artifacts

| Artifact | Details |
|----------|---------|
| SIEM Alert ID | SIEM-ALT-2025-05-19-0312 |
| Failed Login Count | 12 attempts in 3 minutes |
| Source IP | 203.0.113.47 |
| GeoIP Location | Outside normal user location |
| Authentication Logs | Exported to `auth-log-jdoe-20250519.csv` |

---

## Remediation Steps

1. ✅ Block suspicious IP address at the firewall
2. ⬜ Contact user to verify if login attempts were legitimate
3. ⬜ Unlock user account once confirmed not compromised
4. ⬜ Force password reset if compromise suspected
5. ⬜ Review authentication logs for similar patterns across other accounts
6. ⬜ Verify user MFA enrollment status
7. ⬜ Notify user's manager of incident

---

## Current Status

- [x] Suspicious IP address blocked at firewall
- [x] User contacted - voicemail left
- [x] Authentication log review initiated
- [ ] User verification pending

---

## Next Steps

| Action | Target Date | Owner |
|--------|-------------|-------|
| Follow up with user to verify login attempts | May 19, 2025 EOD | Security Analyst Team |
| Complete log review for related activity | May 20, 2025 | Security Analyst Team |
| Reset password if unable to verify with user | May 20, 2025 - 9:00 AM | IT Support |
| Coordinate additional response if confirmed compromise | May 20, 2025 | Security Analyst Team / IT |

---

## Additional Notes

Monitor for additional alerts related to this user account and source IP. If pattern of account lockouts identified, consider implementing CAPTCHA or risk-based authentication controls.

---

*This is a fictional scenario created for educational purposes.*
