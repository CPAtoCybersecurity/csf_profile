# DE.AE-03 Ex3: Threat Intelligence for Event Correlation

**Subcategory:** DE.AE-03 — Information is correlated from multiple sources

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, IR-05, IR-08, PM-16, SI-04

## Implementation Example

> Utilize cyber threat intelligence to help correlate events among log sources

## Alma Security Implementation

GuardDuty threat intelligence feeds automatically enrich findings with known-bad indicators, enabling correlation of suspicious API calls with threat actor infrastructure. The SOC team manually cross-references GuardDuty findings against O365 ATP alerts when investigating incidents that span cloud and email vectors. Threat intelligence from SaaS-sector ISACs provides context for correlating authentication anomalies detected in Alma's continuous authentication platform with broader campaign indicators.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
