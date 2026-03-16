# Encryption Standards Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-005 |
| **Version** | 1.3 |
| **Effective Date** | January 15, 2025 |
| **Next Review Date** | January 15, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy defines the encryption standards for protecting Alma Security data at rest, in transit, and during processing. These standards ensure that cryptographic controls are consistently applied across cloud, on-premises, and endpoint environments in proportion to data sensitivity.

---

## 2. Scope

This policy applies to all systems that store, process, or transmit Alma Security data, including:

- AWS cloud infrastructure (S3, RDS, EBS, EKS, Lambda)
- On-premises servers (Windows Domain Controller, legacy file server)
- Endpoint devices (laptops, workstations)
- Removable media (where exceptionally approved)
- Third-party integrations that receive Alma data

---

## 3. Encryption at Rest

### 3.1 Standards by Platform

| Platform | Algorithm | Key Management | Notes |
|----------|-----------|---------------|-------|
| AWS S3 | AES-256 (SSE-KMS) | KMS customer-managed keys (CMK) | Migration from SSE-S3 to SSE-KMS ~60% complete |
| AWS RDS PostgreSQL | AES-256 | KMS CMK | All production instances encrypted |
| AWS EBS | AES-256 | KMS CMK | Default encryption enforced via SCP |
| Kubernetes PV | AES-256 | KMS CMK via EBS CSI driver | Velero backups also encrypted |
| On-premises servers | AES-256 (BitLocker) | TPM + Active Directory recovery | Windows DC and legacy servers |
| Endpoints | AES-256 (BitLocker/FileVault) | MDM-managed recovery keys | Enforced via endpoint management |
| Biometric data | AES-256 application-layer | Dedicated KMS CMK | Encrypted before storage; defense-in-depth |

### 3.2 Requirements

- All production data stores must use AES-256 encryption or equivalent
- AWS KMS customer-managed keys are required for all Tier 1 and Tier 2 data (per Data Classification Policy)
- AWS-managed keys (SSE-S3) are acceptable only for Tier 4 and Tier 5 data
- New S3 buckets must be created with SSE-KMS encryption by default (enforced via SCP)
- Biometric data must receive application-layer encryption prior to storage, in addition to infrastructure encryption

---

## 4. Encryption in Transit

### 4.1 Standards

| Communication Path | Minimum Standard | Preferred |
|-------------------|-----------------|-----------|
| External client to Alma services | TLS 1.2 | TLS 1.3 |
| Internal service-to-service | TLS 1.2 | mTLS with certificate rotation |
| VPN connections | IPSec or WireGuard | WireGuard |
| Database connections | TLS 1.2 with certificate verification | TLS 1.3 |
| API integrations (third-party) | TLS 1.2 | TLS 1.3 with certificate pinning |

### 4.2 Requirements

- TLS 1.0 and 1.1 are prohibited across all environments
- SSL certificates must use RSA 2048-bit minimum or ECDSA P-256 minimum
- Certificate expiration monitoring must alert at 30 days before expiry
- Internal Kubernetes service mesh uses mTLS for all pod-to-pod communication
- Biometric data in transit requires TLS 1.3

### 4.3 Cipher Suite Requirements

Approved cipher suites (in preference order):

1. TLS_AES_256_GCM_SHA384
2. TLS_AES_128_GCM_SHA256
3. TLS_CHACHA20_POLY1305_SHA256
4. ECDHE-RSA-AES256-GCM-SHA384
5. ECDHE-RSA-AES128-GCM-SHA256

Weak cipher suites (RC4, DES, 3DES, export-grade) are prohibited.

---

## 5. Key Management

### 5.1 Key Lifecycle

| Phase | Requirement |
|-------|-------------|
| Generation | AWS KMS for cloud workloads; HSM-backed where available |
| Storage | KMS key store; never in application code, config files, or version control |
| Distribution | Via KMS API grants and key policies; no manual key distribution |
| Rotation | Automatic rotation per schedule (see 5.2) |
| Revocation | Immediate disable via KMS; schedule deletion with 7-day waiting period |
| Destruction | KMS scheduled deletion; CloudTrail logging of destruction events |

### 5.2 Key Rotation Schedule

| Key Purpose | Rotation Period | Method |
|-------------|----------------|--------|
| General infrastructure (Tier 3-4 data) | 365 days | AWS KMS automatic rotation |
| Customer PII (Tier 2 data) | 365 days | AWS KMS automatic rotation |
| Biometric data (Tier 1 data) | Under evaluation for 90-day rotation | Manual rotation pending automation |
| TLS certificates | 90 days (internal), 1 year (external) | Automated via cert-manager |
| SSH keys | 365 days | Manual; tracked in inventory |

### 5.3 Key Access Controls

- KMS key policies restrict usage to specific IAM roles and services
- Key administration and key usage permissions are separated (duty segregation)
- All KMS key usage is logged to CloudTrail and retained for 12 months
- Emergency key access requires CISO approval and post-use review

---

## 6. Prohibited Practices

- Storing encryption keys in source code, environment variables, or configuration files
- Using self-signed certificates for external-facing services
- Disabling encryption on any production data store without CISO exception approval
- Using deprecated algorithms (MD5, SHA-1, DES, RC4, RSA-1024)
- Sharing KMS keys across AWS accounts without documented architecture review

---

## 7. Monitoring and Compliance

- AWS Config rules monitor encryption configuration compliance across all accounts
- Monthly encryption compliance reporting to CISO includes cross-environment coverage
- Centralized encryption compliance dashboard is in development (currently requires manual cross-environment verification)
- Quarterly audits sample storage resources to verify encryption status

---

## 8. Exceptions

Exceptions to encryption standards require:

- Written business and technical justification
- Risk assessment documenting residual risk
- CISO approval
- Compensating controls (e.g., network segmentation, enhanced monitoring)
- Time-bound duration with remediation plan
- Entry in the security risk register

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Data Classification Policy | ALMA-POL-2025-004 |
| Access Management Policy | ALMA-POL-2025-002 |
| AWS Security Baseline | ALMA-STD-2025-003 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 15, 2025 | S. Chen | Initial policy release |
| 1.1 | May 1, 2025 | C. Magann | Added cipher suite requirements; updated S3 migration status |
| 1.2 | September 1, 2025 | C. Magann | Added biometric encryption requirements; TLS 1.3 preference |
| 1.3 | February 16, 2026 | S. Chen | Annual review; updated S3 SSE-KMS migration status to 60%; added 90-day key rotation evaluation |

---

*This is a fictional example created for educational purposes.*
