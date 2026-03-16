# Information Security Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-001 |
| **Version** | 2.1 |
| **Effective Date** | January 15, 2025 |
| **Next Review Date** | January 15, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy establishes the information security requirements for Alma Security to protect the confidentiality, integrity, and availability of company data, customer information, and biometric authentication assets. As a provider of continuous authentication services, Alma has an elevated duty of care for the data entrusted to us by our customers and their end users.

---

## 2. Scope

This policy applies to:

- All employees, contractors, and third-party personnel with access to Alma Security systems or data
- All information systems, applications, cloud infrastructure, and on-premises environments
- All data processed, stored, or transmitted by Alma Security, including customer biometric data, PII, and intellectual property

**Out of Scope:** Publicly available marketing materials and open-source code published under approved licenses.

---

## 3. Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| **CISO** | Accountable for the information security program; reports to CEO; approves policy exceptions; owns risk register |
| **IT Security Team (15 staff)** | Implement and operate security controls; conduct access reviews; manage detection and response; perform vulnerability management |
| **Engineering Leadership** | Ensure secure development practices; review code for security defects; maintain CI/CD pipeline security |
| **Department Managers** | Approve access requests; complete quarterly access certifications; ensure team compliance with training requirements |
| **Human Resources** | Administer security awareness training via Workday; notify IT of personnel changes within SLA; manage AUP acknowledgments |
| **All Personnel** | Comply with security policies; report incidents via phishing@almasecurity.com or #security-alerts Slack; complete required training |

---

## 4. Information Security Principles

### 4.1 Defense in Depth

Alma Security employs layered controls across network, endpoint, application, and data tiers. No single control failure should result in a complete security compromise.

### 4.2 Least Privilege

All access to systems, data, and facilities is granted based on demonstrated business need and limited to the minimum necessary for job function. Privileged access requires separate accounts, MFA, and just-in-time provisioning where feasible.

### 4.3 Data Protection

Data is classified according to the Data Classification Policy (ALMA-POL-2025-004) and protected with controls proportional to sensitivity. Biometric data receives the highest level of protection, including application-layer encryption before storage and enhanced key management controls.

### 4.4 Continuous Monitoring

Security monitoring operates continuously through SentinelOne (endpoint detection and response), AWS GuardDuty (cloud threat detection), and centralized SIEM correlation. The Detection and Response team triages alerts in accordance with defined SLAs.

---

## 5. Access Control

### 5.1 Authentication

- Multi-factor authentication is required for all remote access, privileged access, and access to systems containing sensitive data
- Password standards are defined in the Password Standard (ALMA-STD-2025-002)
- SSH keys must be individually assigned, inventoried, and rotated annually

### 5.2 Authorization

- Role-based access control (RBAC) governs system access
- Access requests follow the ServiceNow approval workflow (manager + asset owner)
- Quarterly access certification campaigns verify continued appropriateness of all entitlements

### 5.3 Privileged Access

- Privileged accounts are managed through CyberArk PAM
- Administrative access to production requires justification, time-bound sessions, and session logging
- Privileged access is reviewed quarterly by the CISO

Detailed requirements are defined in the Access Management Policy (ALMA-POL-2025-002).

---

## 6. Data Protection and Encryption

### 6.1 Encryption Standards

- **Data at rest:** AES-256 encryption using AWS KMS customer-managed keys (cloud) and BitLocker (on-premises)
- **Data in transit:** TLS 1.2 or higher for all network communications; internal service-to-service communication uses mTLS
- **Key management:** Keys are rotated per the Encryption Standards Policy (ALMA-POL-2025-005); biometric data keys evaluated for 90-day rotation

### 6.2 Data Handling

- Data is classified and handled per the Data Classification Policy
- Removable media use is restricted and monitored via SentinelOne device control
- Data loss prevention monitoring covers email, cloud storage, and endpoint channels

---

## 7. Network and Infrastructure Security

### 7.1 Network Segmentation

Production, staging, development, and corporate networks are segmented. Crown jewel systems (biometric processing, authentication engine, customer database) reside in restricted network segments with enhanced monitoring.

### 7.2 Configuration Management

- AWS infrastructure is managed through infrastructure-as-code (Terraform) stored in GitOps repositories
- AWS Config rules enforce baseline security configurations
- Configuration drift is detected and remediated automatically where possible

### 7.3 Vulnerability Management

- Automated vulnerability scanning runs weekly (daily for crown jewel systems)
- Remediation SLAs: critical vulnerabilities within 14 days, emergency patches within 72 hours
- Monthly patch compliance reporting to CISO

---

## 8. Security Awareness and Training

- All personnel complete quarterly security awareness training through Workday
- New hire access provisioning is gated on training completion
- Quarterly phishing simulations test employee resilience; repeat clickers receive supplemental training
- Acceptable Use Policy acknowledgment is required annually

Detailed requirements are in the Acceptable Use Policy (ALMA-POL-2025-003).

---

## 9. Incident Response

- All employees must report suspected security incidents immediately via phishing@almasecurity.com, #security-alerts Slack, or direct escalation to the D&R team
- The Incident Response Playbook defines detection, containment, eradication, and recovery procedures
- Post-incident reviews are conducted for all Severity 1 and 2 incidents within 5 business days
- Incident metrics (TTD, TTI) are tracked and reported to the CISO monthly

---

## 10. Physical Security

- Redwood City headquarters access requires badge authentication
- Visitors must be escorted and logged
- Data center areas require additional authorization beyond standard badge access
- Physical access is reviewed semi-annually

Detailed requirements are in the Physical Security Policy (ALMA-POL-2025-006).

---

## 11. Compliance and Audit

This policy supports Alma Security's alignment with:

- NIST Cybersecurity Framework 2.0
- SOC 2 Type II
- GDPR and CCPA (for customer data handling)

Internal security assessments are conducted quarterly. External penetration testing is performed annually.

---

## 12. Enforcement

Violations of this policy are addressed in accordance with the HR Policies and Procedures manual. Consequences range from mandatory retraining through formal disciplinary action, up to and including termination, depending on severity and intent.

---

## 13. Exceptions

Policy exceptions require:

- Written business justification
- Risk assessment by IT Security
- CISO approval
- Time-bound duration (maximum 12 months)
- Documented compensating controls
- Tracking in the security risk register

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Access Management Policy | ALMA-POL-2025-002 |
| Acceptable Use Policy | ALMA-POL-2025-003 |
| Data Classification Policy | ALMA-POL-2025-004 |
| Encryption Standards Policy | ALMA-POL-2025-005 |
| Physical Security Policy | ALMA-POL-2025-006 |
| Password Standard | ALMA-STD-2025-002 |
| Incident Response Playbook | ALMA-SOP-2025-010 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2024 | A. Johnson | Initial policy release |
| 1.5 | August 15, 2024 | S. Chen | Added biometric data protections, updated encryption standards |
| 2.0 | January 15, 2025 | S. Chen | Major revision: CSF 2.0 alignment, expanded cloud security requirements |
| 2.1 | February 16, 2026 | S. Chen | Annual review; updated team headcount, added KMS rotation language |

---

*This is a fictional example created for educational purposes.*
