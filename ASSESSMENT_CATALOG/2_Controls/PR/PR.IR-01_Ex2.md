# PR.IR-01_Ex2: DMZ and Gateway Security

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex2: DMZ and gateway security mechanisms (e.g., firewalls, web application firewalls, proxies) are used to control traffic flows between network segments and to filter potentially harmful content.

## Alma Security Implementation

Alma uses a Palo Alto next-generation firewall with deny-by-default policies, 2FA-protected admin access, application-layer inspection, and IPS at the Redwood City perimeter. In AWS, ALBs with Security Groups restrict inbound traffic to ports 443/80, but no WAF is deployed -- the WAF Install project ($112K budget) is in progress. VPC Flow Logs and DNS query logging provide traffic visibility but do not filter at the gateway layer.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
