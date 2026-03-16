# DE.CM-09 Ex1: Common Attack Vector Monitoring

**Subcategory:** DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-04, AC-09, AU-12, CA-07, CM-03, CM-06, CM-10, CM-11, SC-34, SC-35, SI-04, SI-07

## Implementation Example

> Monitor email, web, file sharing, collaboration services, and other common attack vectors to detect malicious content and activity

## Alma Security Implementation

O365 Advanced Threat Protection with Alma-specific custom threat rules monitors inbound and outbound email for phishing, malware attachments, and business email compromise indicators. SentinelOne monitors web browser activity and file downloads on managed endpoints for malicious content. Slack monitoring detects shared malicious links and suspicious file uploads in workspace channels. The SOC team investigates alerts from all three platforms during business hours with PagerDuty escalation for critical detections after hours.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
