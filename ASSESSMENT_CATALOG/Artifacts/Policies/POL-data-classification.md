# Data Classification Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-004 |
| **Version** | 1.2 |
| **Effective Date** | January 15, 2025 |
| **Next Review Date** | January 15, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy establishes a data classification framework for Alma Security to ensure that information assets are identified, categorized by sensitivity, and protected with controls proportional to their risk. As a continuous authentication provider handling biometric data, Alma must maintain the highest standards of data stewardship.

---

## 2. Scope

This policy applies to all data created, received, processed, stored, or transmitted by Alma Security, regardless of format (electronic, paper, verbal) or location (cloud, on-premises, endpoint, third-party).

---

## 3. Classification Tiers

### Tier 1: Biometric (Highest Sensitivity)

**Description:** Biometric templates, behavioral authentication models, raw biometric inputs, and associated processing metadata.

| Requirement | Standard |
|-------------|----------|
| Encryption at rest | AES-256 with application-layer encryption before storage; KMS CMK with 90-day rotation evaluation |
| Encryption in transit | TLS 1.3 required; mTLS between services |
| Access control | Named individuals only; CISO approval required; MFA mandatory; session logging |
| Retention | Per customer contract; minimum 90-day post-deletion verification |
| Backup | Encrypted daily backups with cross-region replication |
| Monitoring | Real-time DLP monitoring; enhanced audit logging; anomaly detection |
| Third-party sharing | Prohibited without explicit customer consent and legal review |

### Tier 2: Customer PII

**Description:** Customer end-user personally identifiable information including names, email addresses, device identifiers, authentication logs, and session data.

| Requirement | Standard |
|-------------|----------|
| Encryption at rest | AES-256; KMS CMK with 365-day rotation |
| Encryption in transit | TLS 1.2+ required |
| Access control | Role-based; manager and asset owner approval; MFA for remote access |
| Retention | Per customer data processing agreement; default 12 months post-contract |
| Backup | Encrypted daily backups |
| Monitoring | DLP monitoring; quarterly access reviews |
| Third-party sharing | Requires DPA and legal review |

### Tier 3: Alma Intellectual Property

**Description:** Source code, product roadmaps, authentication algorithms, security architecture documentation, penetration test results, and vulnerability assessments.

| Requirement | Standard |
|-------------|----------|
| Encryption at rest | AES-256 on storage platforms |
| Encryption in transit | TLS 1.2+ required |
| Access control | Role-based; need-to-know basis |
| Retention | Indefinite for active IP; 3 years post-deprecation |
| Backup | Standard backup schedule |
| Monitoring | Code repository access logging; DLP for outbound transfers |
| Third-party sharing | NDA required; CISO approval for security documentation |

### Tier 4: General Business

**Description:** Internal communications, meeting notes, HR records (non-sensitive), marketing materials (pre-release), financial reports, vendor contracts.

| Requirement | Standard |
|-------------|----------|
| Encryption at rest | Platform-level encryption (SSE-S3 minimum) |
| Encryption in transit | TLS 1.2+ required |
| Access control | Department-level RBAC |
| Retention | Per department retention schedule; default 7 years for financial records |
| Backup | Standard backup schedule |
| Monitoring | Standard audit logging |
| Third-party sharing | Per business need; standard NDA for confidential materials |

### Tier 5: Public

**Description:** Published marketing materials, open-source code, public documentation, press releases.

| Requirement | Standard |
|-------------|----------|
| Encryption at rest | Not required |
| Encryption in transit | TLS recommended |
| Access control | None required |
| Retention | Indefinite |
| Monitoring | Not required |
| Third-party sharing | Unrestricted |

---

## 4. Classification Responsibilities

| Role | Responsibility |
|------|----------------|
| **Data Owner** | Assign classification tier to data under their stewardship; review classification annually |
| **CISO** | Approve Tier 1 access requests; adjudicate classification disputes; maintain this policy |
| **IT Security Team** | Enforce technical controls per tier; monitor compliance; assist with classification questions |
| **All Personnel** | Handle data according to its classification; label documents when practical; report misclassification |

---

## 5. Labeling Requirements

- Electronic documents containing Tier 1 or Tier 2 data should include classification in the header or metadata where the platform supports it
- Email containing Tier 1 or Tier 2 data must include "[BIOMETRIC]" or "[CUSTOMER PII]" in the subject line
- Shared drives, S3 buckets, and database schemas handling Tier 1 or Tier 2 data must be tagged with the classification tier in the resource tagging standard

---

## 6. Data Handling Matrix

| Action | Tier 1 (Biometric) | Tier 2 (Customer PII) | Tier 3 (Alma IP) | Tier 4 (General) |
|--------|--------------------|-----------------------|-------------------|-------------------|
| Print | Prohibited | Manager approval | Permitted | Permitted |
| Email externally | Prohibited | Encrypted + legal review | NDA required | Permitted |
| Removable media | Prohibited | Prohibited | CISO exception only | CISO exception only |
| Personal devices | Prohibited | Prohibited | Read-only via approved MDM | Per AUP |
| Cloud storage | Approved platforms only | Approved platforms only | Approved platforms | Approved platforms |
| Disposal | Cryptographic erasure + verification | Cryptographic erasure | Secure delete | Standard delete |

---

## 7. Classification Review

- Data owners must review classifications annually or when business context changes
- The IT Security team conducts quarterly sampling audits to verify classification accuracy
- New data types introduced through product changes must be classified before entering production

---

## 8. Current Status

**Note:** As of Q1 2026, the data classification schema is actively being formalized. Tier definitions and handling requirements above represent the target state. Encryption requirements for Tier 1 and Tier 2 data are fully implemented. Classification labeling and automated enforcement tooling are in development as part of the Data Encryption Upgrade project.

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Encryption Standards Policy | ALMA-POL-2025-005 |
| Acceptable Use Policy | ALMA-POL-2025-003 |
| Data Retention Schedule | ALMA-STD-2025-004 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 15, 2025 | S. Chen | Initial policy establishing four-tier framework |
| 1.1 | June 1, 2025 | S. Chen | Added Tier 5 (Public); expanded handling matrix |
| 1.2 | February 16, 2026 | S. Chen | Annual review; added current status section reflecting formalization project |

---

*This is a fictional example created for educational purposes.*
