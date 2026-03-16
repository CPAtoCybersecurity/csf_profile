# DE.AE-02 Ex2: Cyber Threat Intelligence in Log Analysis

**Subcategory:** DE.AE-02 — Potentially adverse events are analyzed to better understand associated activities

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, SI-04

## Implementation Example

> Utilize up-to-date cyber threat intelligence in log analysis tools to improve detection accuracy and enrich event context

## Alma Security Implementation

AWS GuardDuty integrates Amazon-curated threat intelligence feeds including known malicious IPs, domains, and cryptomining indicators to enrich detection findings. O365 Advanced Threat Protection applies Alma-specific threat rules incorporating Microsoft's global threat intelligence for email-borne threats. The SOC team supplements automated intelligence with manual threat briefings from industry ISACs relevant to the SaaS authentication sector.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
