# PR.DS-10_Ex2: Prevent Unauthorized Access to Data in Use

**Subcategory:** PR.DS-10 -- The confidentiality, integrity, and availability of data-in-use are protected

**NIST SP 800-53 Ref:** SC-39 (Process Isolation), SC-43 (Usage Restrictions)

## Implementation Example

> Implement controls to prevent unauthorized access to data during active processing, including process isolation, interprocess communication restrictions, and runtime monitoring to detect and prevent unauthorized access attempts.

## Alma Security Implementation

Alma enforces process isolation through Kubernetes namespace separation, Pod Security Standards (non-root, dropped capabilities, no privilege escalation), and Linux namespace isolation with IPC blocked by default between containers. The biometric processing namespace has the most restrictive network policies, allowing only API gateway ingress and database/auth service egress. SentinelOne provides runtime behavioral monitoring for process injection and unauthorized data access, supplemented by WDAC and Exploit Guard on the Windows DC.

## Artifacts

- [Data Classification Policy](../../Artifacts/Policies/POL-data-classification.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
