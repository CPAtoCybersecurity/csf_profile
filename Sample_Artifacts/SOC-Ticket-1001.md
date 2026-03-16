# SOC Incident Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | SOC-Ticket-1001 |
| **Status** | Open |
| **Priority** | High |
| **Assigned To** | Security Analyst Team |
| **Date Opened** | May 19, 2025 |
| **Last Updated** | May 19, 2025 - 10:15 AM PST |

---

## Incident Details

| Field | Value |
|-------|-------|
| **Reported By** | John Smith (`jsmith@alma.com`) |
| **Date Reported** | May 19, 2025 |
| **Time Reported** | 9:30 AM PST |
| **Incident Type** | Phishing Attack |
| **Alert Rule Triggered** | Manual Report - User Submission |

### Description

User reported receiving a suspicious email appearing to come from IT support requesting login credentials. The email contained a link to a fake login page designed to steal credentials. **User did not click the link or enter any information** and immediately reported the incident.

---

## Impact Assessment

- Potential compromise of user credentials if link had been clicked
- Risk of further phishing attacks targeting other employees
- Possible unauthorized access to company systems if credentials harvested

---

## Evidence / Artifacts

| Artifact | Details |
|----------|---------|
| Phishing Email | Preserved in quarantine - `MSG-2025-05-19-0930.eml` |
| Malicious Domain | Pending IOC extraction |
| Source IP | Pending IOC extraction |
| Screenshot | Fake login page screenshot captured |

---

## Remediation Steps

1. ✅ Analyze phishing email and extract IOCs (IP, domain, sender)
2. ⬜ Block malicious domain and IP at email gateway and firewall
3. ⬜ Scan for other instances of phishing email across employee mailboxes
4. ⬜ Delete all found instances of the phishing email
5. ⬜ Reset password for targeted user account as precaution
6. ⬜ Distribute employee awareness notification
7. ⬜ Review email security controls and phishing training procedures

---

## Current Status

- [x] Phishing email submitted to SecOps for analysis
- [ ] IOCs pending extraction and addition to threat intelligence watchlists
- [ ] Employee awareness notification drafted, pending distribution

---

## Next Steps

| Action | Target Date | Owner |
|--------|-------------|-------|
| Complete IOC analysis and blocking | May 19, 2025 EOD | SecOps |
| Delete all found phishing emails | May 19, 2025 EOD | SecOps |
| Distribute employee phishing alert | May 20, 2025 - 9:00 AM | Security Awareness |
| Conduct phishing response retrospective | May 27, 2025 | Security Analyst Team |

---

## Additional Notes

Include this incident in monthly phishing metrics report. Consider additional targeted phishing training if similar incidents increase.

---

*This is a fictional scenario created for educational purposes.*
