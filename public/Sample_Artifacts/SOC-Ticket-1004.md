# SOC Incident Ticket

**Ticket ID**: SOC-Ticket-1004
**Status**: Open 
**Priority**: Medium
**Assigned To**: Security Analyst Team

## Incident Details

**Reported By**: Automated DLP Alert
**Date Detected**: May 19, 2025  
**Time Detected**: 2:15 PM PST

**Incident Type**: Unauthorized BitTorrent Traffic 
**Incident Description**:
The Data Loss Prevention (DLP) system detected BitTorrent traffic originating from a company-issued laptop assigned to user Sarah Johnson (sjohnson@alma.com). The traffic was detected on the corporate network and violates company policy prohibiting the use of peer-to-peer file sharing software.

## Impact Assessment  
- Potential download of unauthorized or copyrighted material
- Risk of malware infection from untrusted torrents
- Consumption of network bandwidth for non-business purposes
- Violation of corporate acceptable use policy

## Remediation Steps
1. Identify the specific laptop and user associated with the alert
2. Remotely block BitTorrent traffic at the firewall for the identified laptop
3. Request IT to uninstall any BitTorrent software found on the laptop
4. Interview the user to determine intent and knowledge of policy violation
5. Reinforce policy awareness through employee training
6. Determine if additional disciplinary action is warranted based on investigation

## Current Status
- BitTorrent traffic blocked for the specific laptop at the firewall
- User contacted to schedule interview with manager and HR
- IT ticket opened to remove unauthorized software from laptop

## Next Steps  
- Complete user interview and document findings - May 20, 2025
- Uninstall BitTorrent software from laptop - May 20, 2025 EOD
- Determine any necessary disciplinary action - May 27, 2025
- Schedule user for refresher training on acceptable use - June 1, 2025

## Additional Notes
Review network DLP alert thresholds and consider expanding automated blocking for high-confidence events. Determine if additional user education is needed to reinforce policies prohibiting file sharing software on corporate assets.
