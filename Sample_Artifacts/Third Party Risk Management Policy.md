# Third Party Risk Management Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2023-009 |
| **Version** | 2.1 |
| **Effective Date** | January 15, 2024 |
| **Next Review Date** | January 15, 2025 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

Alma Security's Third Party Risk Management (TPRM) Program guards against security threats posed by third parties who access Alma Security data or customer data. These risks include data breaches, unauthorized disclosure, and data loss. This policy ensures third parties implement appropriate safeguards and enables Alma Security to meet contractual, regulatory, and compliance obligations.

---

## 2. Scope

This policy applies to all third party providers that access, store, process, or transmit Alma Security data, including:

- Cloud and SaaS providers hosting Alma Security data
- Professional services firms with access to confidential information
- Software vendors integrated with Alma Security systems
- Contractors and consultants accessing internal networks or facilities

**Out of Scope:** Third parties with no access to confidential data, internal systems, or facilities.

---

## 3. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| **Security Risk Team** | Assess third party inherent and residual risk; inform Business Owners of assessment results |
| **Business Owner** | Describe the third party relationship; facilitate TPRM review and remediation activities; ensure vendor responsiveness |
| **CISO** | Approve significant changes and exceptions to this policy |

---

## 4. Risk Classification

Third party risk tier is determined by the level of access granted:

| Tier | Risk | Criteria | Approval Window |
|:----:|:----:|----------|-----------------|
| 🔴 **Tier 1** | Critical | Access to confidential data (customer data, IP, financials) OR privileged network access | 12 months |
| 🔴 **Tier 2** | High | Access to internal data or non-privileged network access | 12 months |
| 🟡 **Tier 3** | Medium | Access to internal systems with no sensitive data; limited integration | 24 months |
| 🟢 **Tier 4** | Low | No data access; public information only; no system integration | No assessment required |

Residual risk is determined after evaluating the third party's security controls against Alma Security's minimum standards.

---

## 5. Due Diligence Requirements

All in-scope third parties must undergo risk assessment prior to being granted access. Assessment depth is based on tier classification:

| Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|-------------|:------:|:------:|:------:|:------:|
| Third party attestation (SOC 2 Type 2, ISO 27001) | ✓ | ✓ | — | — |
| Security questionnaire | Full | Full | Abbreviated | — |

---

## 6. Minimum Security Standards

Third parties must demonstrate adequate controls in the following areas:

- **Access Management:** Role-based access, MFA for privileged accounts, SSO integration where applicable
- **Data Protection:** Encryption in transit and at rest, secure data handling procedures
- **Incident Response:** Documented incident response plan with notification requirements
- **Security Attestation:** Valid third party audit (SOC 2 Type 2, ISO 27001, or equivalent)
- **Personnel Security:** Background checks for employees and contractors with data access

Deficiencies in these areas may result in denial of the vendor requisition or issuance of a Security Notice.

---

## 7. Contractual Requirements

Contracts with third parties must include:

- Data security responsibilities and minimum control requirements
- Right to audit third party security practices
- Prompt notification of security incidents affecting Alma Security
- Liability provisions for security failures
- Data destruction requirements upon contract termination

---

## 8. Ongoing Monitoring

- Tier 1 and Tier 2 vendors are reassessed annually
- Continuous security rating monitoring for Tier 1 vendors
- Material changes in services or data handling trigger reassessment
- Security incidents involving third parties may trigger immediate review

---

## 9. Exceptions

Exceptions to this policy require written approval from the CISO. Business Owners accepting risk must:

- Acknowledge understanding of the risk
- Provide business justification
- Document a time-bound remediation plan
- Obtain approval from their VP and the CISO

---

## 10. Compliance

Violations may result in termination of third party relationships. Employee violations are subject to the Human Resources Policy.

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2023-001 |
| Data Classification Policy | ALMA-POL-2023-003 |
| Vendor Onboarding Procedure | ALMA-SOP-2023-012 |
| TPRM Assessment Procedure | ALMA-SOP-2023-013 |
| Security Notice Template | ALMA-FORM-2023-015 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2023 | J. Martinez | Initial policy release |
| 1.1 | June 15, 2023 | J. Martinez | Added risk classification tiers |
| 2.0 | October 1, 2023 | S. Chen | Added continuous monitoring requirements; updated attestation standards |
| 2.1 | January 15, 2024 | S. Chen | Clarified exception approval process; added approval windows |

---

*This is a fictional example created for educational purposes.*
