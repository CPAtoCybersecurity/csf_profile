# SOC Incident Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | SOC-Ticket-1004 |
| **Status** | Open |
| **Priority** | High |
| **Assigned To** | Security Analyst Team |
| **Date Opened** | May 19, 2025 |
| **Last Updated** | May 19, 2025 - 4:30 PM PST |

---

## Incident Details

| Field | Value |
|-------|-------|
| **Reported By** | Automated DLP Alert |
| **Date Detected** | May 19, 2025 |
| **Time Detected** | 2:15 PM PST |
| **Incident Type** | Unauthorized Data Exfiltration via BitTorrent |
| **Affected User** | Sarah Johnson (`sjohnson@alma.com`) |
| **Source Hostname** | ALMA-LT-4521 |
| **Source IP** | 10.15.42.87 |
| **Alert Rule Triggered** | DLP-Rule-1042: Confidential data exfiltration via P2P |

### Description

DLP system detected **3 files matching "Confidential" classification labels** being shared via BitTorrent traffic from a company-issued laptop assigned to Sarah Johnson. Activity violates corporate policy prohibiting peer-to-peer file sharing software on company assets.

---

## Impact Assessment

- Potential exposure of proprietary engineering documents to unauthorized parties
- Possible NDA or regulatory compliance violation
- Risk of malware infection from untrusted torrent sources
- Violation of Corporate Acceptable Use Policy (AUP-2.3)

---

## Evidence / Artifacts

| Artifact | Details |
|----------|---------|
| DLP Alert ID | DLP-ALT-2025-05-19-0847 |
| Network Capture | `pcap-20250519-1415-alma-lt-4521.pcap` |
| Files Detected | `project-atlas-specs-v2.docx`, `q3-roadmap-draft.xlsx`, `sensor-calibration-data.csv` |
| File Classification | Confidential - Internal Engineering |

---

## Remediation Steps

1. ✅ Confirm asset assignment and validate alert accuracy
2. ✅ Block BitTorrent traffic at firewall for identified laptop
3. ⬜ Remove BitTorrent software from laptop
4. ⬜ Interview user to determine intent and policy awareness
5. ⬜ Assess scope of data exposure
6. ⬜ Determine disciplinary action based on investigation findings
7. ⬜ Schedule user for acceptable use policy refresher training

---

## Current Status

- [x] BitTorrent traffic blocked for laptop at firewall
- [x] User contacted - interview scheduled with manager and HR
- [x] IT ticket opened to remove unauthorized software (IT-TKT-78234)
- [ ] Data exposure assessment in progress

---

## Next Steps

| Action | Target Date | Owner |
|--------|-------------|-------|
| Complete user interview | May 20, 2025 | Security Analyst Team / HR |
| Uninstall BitTorrent software | May 20, 2025 EOD | IT Support |
| Complete data exposure assessment | May 22, 2025 | Security Analyst Team |
| Determine disciplinary action | May 27, 2025 | HR / Management |
| Schedule acceptable use refresher training | June 1, 2025 | Security Awareness |

---

## Additional Notes

Review DLP alert thresholds and consider automated blocking for high-confidence exfiltration events. Evaluate need for additional user education on file sharing policies.

---

*This is a fictional scenario created for educational purposes.*
