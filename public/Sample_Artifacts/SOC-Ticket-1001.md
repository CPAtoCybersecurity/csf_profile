# SOC Incident Ticket

**Ticket ID**: SOC-Ticket-1001 
**Status**: Open
**Priority**: High
**Assigned To**: Security Analyst Team

## Incident Details

**Reported By**: John Smith (jsmith@alma.com)  
**Date Reported**: May 19, 2025
**Time Reported**: 09:30 AM PST

**Incident Type**: Phishing Attack  
**Incident Description**: 
User reported receiving a suspicious email appearing to come from IT support requesting login credentials. The email contained a link to a fake login page designed to steal user credentials. User did not click the link or enter any information and immediately reported the incident to the SOC team.

## Impact Assessment
- Potential compromise of user credentials
- Possible unauthorized access to company systems and data
- Risk of further phishing attacks targeting other employees

## Remediation Steps
1. Analyze the phishing email and extract IOCs (IP, domain, etc)
2. Block the malicious domain and IP at the email gateway and firewall 
3. Scan for any other instances of the phishing email across employee mailboxes
4. Delete any found instances of the phishing email 
5. Reset password for the targeted user account as a precaution
6. Notify all employees of the phishing attempt and remind them to be vigilant
7. Review email security controls and phishing training procedures

## Current Status
- Phishing email and fake login page submitted to SecOps team for analysis
- IOCs pending to be added to threat intelligence watchlists
- Employee awareness notification drafted, pending distribution  

## Next Steps
- Complete IOC analysis and blocking - May 19, 2025 EOD
- Delete all found phishing emails - May 19, 2025 EOD
- Distribute employee phishing alert - May 20, 2025 9:00 AM PST
- Conduct phishing response retrospective - May 27, 2025

## Additional Notes
Ensure this incident is included in the next monthly phishing metrics report. Consider conducting additional targeted phishing training if similar incidents increase.
