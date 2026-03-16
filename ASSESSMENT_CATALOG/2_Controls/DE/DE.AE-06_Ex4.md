# DE.AE-06 Ex4: Manual Ticket Creation for Adverse Events

**Subcategory:** DE.AE-06 — Information on adverse events is provided to authorized staff and tools

**NIST SP 800-53 Ref:** IR-04, PM-15, PM-16, RA-04, RA-10

## Implementation Example

> Manually create and assign tickets in the organization's ticketing system when technical staff discover adverse events during their work that were not automatically detected

## Alma Security Implementation

SOC analysts and engineering staff are trained to manually create security tickets when they observe suspicious activity not captured by automated detection tools. This includes anomalies discovered during Slack workspace monitoring, unusual patterns identified during manual log reviews, and suspicious behavior reported by employees. The incident response playbook defines the required fields and severity classification criteria for manually created tickets, and the SOC Manager validates severity within 2 hours of creation.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
