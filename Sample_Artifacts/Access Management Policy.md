# Access Management Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-002 |
| **Version** | 1.3 |
| **Effective Date** | March 1, 2025 |
| **Next Review Date** | March 1, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy establishes requirements for managing access to Alma Security information systems, applications, and data. It ensures access is granted based on business need, follows least privilege principles, and is regularly reviewed to prevent unauthorized access.

---

## 2. Scope

This policy applies to:

- All employees, contractors, and third parties requiring access to Alma Security systems
- All information systems, applications, and data repositories
- Physical access to facilities containing information assets

**Out of Scope:** Public-facing websites and applications that do not require authentication.

---

## 3. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| **IT Security Team** | Administer access controls; conduct access reviews; manage identity provider |
| **Managers** | Approve access requests for direct reports; complete access certifications; report terminations promptly |
| **Asset Owners** | Define role requirements; approve access to owned systems; maintain entitlement documentation |
| **Human Resources** | Notify IT of new hires, transfers, and terminations within SLA |
| **Users** | Request only necessary access; protect credentials; report suspicious activity |

---

## 4. Access Control Principles

### 4.1 Least Privilege

Users receive only the minimum access required to perform their job functions. Access is not granted based on job title alone but on specific, documented business requirements.

### 4.2 Separation of Duties

Critical functions are divided among multiple individuals to prevent fraud and error. No single user should have end-to-end control over sensitive processes.

### 4.3 Role-Based Access Control

Access is assigned through predefined roles that map to job functions. Role definitions are maintained by Asset Owners and reviewed annually.

---

## 5. Access Request Process

| Step | Actor | Timeline |
|------|-------|----------|
| 1. Submit request | User | Via ServiceNow |
| 2. Manager approval | Direct Manager | 2 business days |
| 3. Asset Owner approval | System Owner | 2 business days |
| 4. Provisioning | IT Security | 1 business day |

**Emergency Access:** Break-glass procedures require CISO or delegate approval and are subject to post-incident review within 48 hours.

---

## 6. Privileged Access Management

### 6.1 Privileged Account Requirements

- Privileged accounts must be separate from standard user accounts
- MFA is mandatory for all privileged access
- Privileged sessions must be logged and monitored
- Administrative access to production systems requires just-in-time (JIT) provisioning where feasible

### 6.2 Privileged Account Review

| Account Type | Review Frequency | Reviewer |
|--------------|------------------|----------|
| Domain Administrators | Quarterly | CISO |
| Application Administrators | Quarterly | Asset Owner |
| Database Administrators | Quarterly | Asset Owner |
| Service Accounts | Semi-annually | IT Security |

---

## 7. Authentication Requirements

### 7.1 Multi-Factor Authentication

MFA is required for:

- All remote access (VPN, cloud applications)
- All privileged access
- Access to systems containing sensitive or regulated data
- All externally-facing applications

### 7.2 Password Standards

| Parameter | Requirement |
|-----------|-------------|
| Minimum length | 14 characters |
| Complexity | 3 of 4 character types |
| History | 12 passwords remembered |
| Maximum age | 365 days (or passwordless) |
| Lockout threshold | 5 failed attempts |

### 7.3 SSH Key Management

- SSH keys must be inventoried with assigned owners
- Keys must be rotated annually or upon personnel change
- Shared keys are prohibited

---

## 8. Access Recertification

### 8.1 Certification Schedule

| Access Type | Frequency | Owner |
|-------------|-----------|-------|
| Application access | Quarterly | Asset Owner |
| Privileged access | Quarterly | IT Security |
| Third-party access | Quarterly | Vendor Manager |
| File share access | Semi-annually | Data Owner |

### 8.2 Certification Requirements

- Certifiers must review each user's access individually
- Certifications must be completed within 14 days of campaign start
- Revocations must be implemented within 5 business days
- Non-completion triggers escalation to CISO

---

## 9. Third-Party Access

### 9.1 Requirements

- Third-party accounts require contract documentation and business justification
- Accounts must have expiration dates aligned with contract terms
- Third-party sessions must be logged and reviewed
- Third parties must acknowledge the Acceptable Use Policy

### 9.2 Monitoring

Third-party access is subject to enhanced monitoring including:

- Session recording for privileged access
- Anomaly detection for unusual access patterns
- Quarterly access reviews regardless of contract duration

---

## 10. Termination and Transfer

### 10.1 Termination Timeline

| Termination Type | Access Revocation |
|------------------|-------------------|
| Involuntary | Within 1 hour of notification |
| Voluntary | End of last business day |
| Contractor end | Contract end date |

### 10.2 Transfer Requirements

- Current access must be reviewed and adjusted for new role
- Previous role access must be removed within 5 business days
- Manager must certify appropriate access for new role

---

## 11. Exceptions

Exceptions to this policy require:

- Written business justification
- Risk assessment by IT Security
- Approval by CISO
- Time-bound duration (maximum 12 months)
- Compensating controls documentation

---

## 12. Compliance

Violations of this policy will be managed in accordgance with the HR Policies and Procedures manual. 

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Acceptable Use Policy | ALMA-POL-2025-003 |
| Password Standard | ALMA-STD-2025-002 |
| Access Request Procedure | ALMA-SOP-2025-005 |
| Access Certification Procedure | ALMA-SOP-2025-006 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 15, 2025 | A. Johnson | Initial policy release |
| 1.1 | February 1, 2025 | A. Johnson | Added SSH key management requirements |
| 1.2 | March 1, 2025 | S. Chen | Enhanced privileged access and third-party sections |
| 1.3 | February 16, 2026 | S. Chen | Annual review; no substantive changes |

---

*This is a fictional example created for educational purposes.*
