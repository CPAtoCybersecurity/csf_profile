# PR.IR-04_Ex2: DDoS Mitigation

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** CP-02, SC-05

## Implementation Example

> Ex2: Distributed Denial of Service (DDoS) mitigation capabilities are implemented to protect internet-facing services from volumetric and application-layer attacks that could exhaust resource capacity.

## Alma Security Implementation

Alma has AWS Shield Standard providing baseline Layer 3/4 DDoS protection across all accounts. No WAF is deployed for Layer 7 protection -- the WAF Install project ($112K, in progress) will add rate limiting and request filtering. No DDoS response runbook exists, rate limiting is not configured at the ALB layer, and AWS Shield Advanced has not been evaluated.

## Artifacts

- [Incident Response Playbook](../../Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup and Restore Procedure](../../Artifacts/Procedures/PROC-backup-restore.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
