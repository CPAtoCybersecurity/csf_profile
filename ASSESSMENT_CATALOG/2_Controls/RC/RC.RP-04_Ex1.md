# RC.RP-04_Ex1: Business Impact-Driven Recovery Priorities

**Subcategory:** RC.RP-04 — Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms

**NIST SP 800-53 Ref:** IR-01, IR-08, PM-08, PM-09, PM-11

## Implementation Example

> Ex1: Use business impact and system categorization records (including service delivery objectives) to determine the priority of restoring systems and services

## Alma Security Implementation

Alma prioritizes restoration of the continuous authentication SaaS platform as the highest-impact system, given its direct revenue and customer-facing nature. AWS multi-AZ architecture supports service delivery objectives by providing infrastructure-level redundancy. Formal RTO and RPO values are being defined through the Cloud Security Optimization DR plan project ($100K) but are not yet documented for all critical systems.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
