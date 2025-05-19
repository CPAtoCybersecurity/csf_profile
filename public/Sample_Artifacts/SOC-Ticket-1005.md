# SOC Incident Ticket

**Ticket ID**: SOC-Ticket-1005
**Status**: Open
**Priority**: Medium 
**Assigned To**: Security Operations Center

## Incident Details

**Reported By**: Automated SIEM Alert 
**Date Detected**: May 19, 2025
**Time Detected**: 9:45 AM PST

**Incident Type**: Account Lockout
**Incident Description**: 
The Security Information and Event Management (SIEM) system generated an alert for multiple failed login attempts resulting in a password lockout for user account jdoe@alma.com. The failed attempts originated from an IP address not associated with the user's normal location.

## Impact Assessment
- Potential account compromise attempt
- Temporary loss of access for legitimate user 
- Possible brute force or password spraying attack

## Remediation Steps  
1. Contact the user to verify if the login attempts were legitimate  
2. Unlock the user account if confirmed not a valid login attempt
3. Force a password reset if account compromise is suspected
4. Block the suspicious IP address at the firewall 
5. Review authentication logs for similar login patterns across other accounts
6. Notify the user's manager of the incident
7. Document the incident in the SIEM and case management system

## Current Status
- User contacted to verify login attempts, voicemail left
- Suspicious IP address blocked at the firewall as a precaution
- Authentication log review initiated for related login activity

## Next Steps
- Follow up with user to verify login attempts - May 19, 2025 EOD
- Complete log review for additional compromised accounts - May 20, 2025  
- Reset user password if unable to verify with user - May 20, 2025 9:00 AM
- Coordinate additional response steps with IT if confirmed account compromise  

## Additional Notes
Monitor for additional alerts related to this user account and source IP. If a pattern of account lockouts is identified, consider implementing controls such as CAPTCHA or risk-based authentication. Ensure the user has enrolled in multi-factor authentication for their account.
