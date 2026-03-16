# Acceptable Use Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-003 |
| **Version** | 2.0 |
| **Effective Date** | January 15, 2025 |
| **Next Review Date** | January 15, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy defines acceptable and prohibited uses of Alma Security information systems, networks, devices, and data. All personnel are expected to exercise good judgment and use company resources responsibly to protect Alma, its customers, and their data.

---

## 2. Scope

This policy applies to all employees, contractors, and third-party personnel who use Alma Security systems, networks, or data, including:

- Company-issued laptops, workstations, and mobile devices
- Cloud infrastructure and SaaS applications
- Corporate network (wired, wireless, VPN)
- Email, messaging, and collaboration tools
- Source code repositories and CI/CD systems

---

## 3. Acceptable Use

### 3.1 General Principles

- Alma systems are provided for business use; limited personal use is permitted provided it does not interfere with work duties, violate policy, or consume significant resources
- Users are responsible for the security of their accounts and devices
- All activity on Alma systems may be monitored and logged in accordance with applicable law

### 3.2 Authorized Software

- Only software on the approved software inventory may be installed on Alma devices
- Software requests are submitted through ServiceNow and reviewed by IT Security before approval
- SentinelOne application control enforces the approved software list on managed endpoints
- Open-source libraries used in development must be reviewed for license compatibility and known vulnerabilities before inclusion

### 3.3 Internet and Email Use

- Internet access is provided for business purposes; incidental personal use is acceptable
- Web filtering blocks known malicious and prohibited site categories
- Email must not be used to transmit Tier 1 (Biometric) data under any circumstances
- Tier 2 (Customer PII) data may only be emailed with encryption and legal review per the Data Classification Policy

---

## 4. Prohibited Activities

The following activities are prohibited on Alma systems and networks:

### 4.1 Security Violations

- Attempting to access systems, data, or areas without authorization
- Sharing credentials, tokens, or SSH keys with others
- Disabling or circumventing security controls (antivirus, firewall, DLP, application control)
- Installing unauthorized software or browser extensions
- Connecting unauthorized devices to the corporate network

### 4.2 Data Handling Violations

- Storing Alma data on personal devices, personal cloud storage, or unauthorized platforms
- Transferring Alma data to removable media without CISO exception approval
- Sharing confidential information with unauthorized parties
- Emailing sensitive data to personal email accounts

### 4.3 Network and System Violations

- Running network scanning, packet capture, or penetration testing tools without written authorization from IT Security
- Using company systems for cryptocurrency mining
- Hosting unauthorized services on the corporate network
- Using the network for illegal activities

### 4.4 Communication Violations

- Sending threatening, harassing, or discriminatory messages
- Impersonating another person or system
- Mass distribution of unsolicited messages

---

## 5. Removable Media

### 5.1 Policy

- Use of removable media (USB drives, external hard drives, SD cards) is restricted by default
- SentinelOne device control blocks unauthorized removable media on all managed endpoints
- Exceptions require CISO approval, documented business justification, and are time-limited

### 5.2 Current Exceptions

Approved removable media exceptions are tracked and reviewed quarterly. As of Q1 2026, three active exceptions exist for specific hardware engineering lab use cases. All excepted devices are encrypted and logged.

---

## 6. Personal Devices (BYOD)

- Personal devices may not be used to access Tier 1 or Tier 2 data
- Personal devices connecting to Alma systems must meet minimum security requirements (current OS, screen lock, full-disk encryption)
- Personal devices must not store Alma data locally
- Alma reserves the right to remotely wipe company data from personal devices used for business purposes

---

## 7. Remote Work

- Remote access requires VPN connection with MFA authentication
- Company-issued devices must be used for all work activities involving sensitive data
- Work in public spaces requires awareness of shoulder surfing and must not involve Tier 1 or Tier 2 data displayed on screen in uncontrolled environments
- Home network security guidance is provided during onboarding

---

## 8. Monitoring and Privacy

- Alma Security monitors system activity including email, web browsing, application usage, and file transfers for security purposes
- SentinelOne EDR provides continuous endpoint monitoring
- DLP tools monitor for unauthorized data exfiltration
- Users should have no expectation of privacy when using Alma systems
- Monitoring data is accessed only by authorized IT Security personnel and used solely for security and compliance purposes

---

## 9. Acknowledgment Requirement

- All employees must acknowledge this policy annually through Workday
- New hires must acknowledge this policy during onboarding before receiving system access
- Contractors must acknowledge this policy through the vendor onboarding process
- Acknowledgment records are retained by HR for the duration of employment plus 3 years

---

## 10. Consequences of Violations

Violations of this policy are addressed through a progressive disciplinary process:

| Severity | Example | Consequence |
|----------|---------|-------------|
| Minor (first offense) | Unauthorized software installation | Mandatory retraining; software removed |
| Moderate | Sharing credentials; repeated minor violations | Written warning; enhanced monitoring |
| Serious | Unauthorized data transfer; disabling security controls | Suspension pending investigation |
| Critical | Intentional data exfiltration; facilitating unauthorized access | Termination; potential legal action |

All violations are documented and tracked. Repeat minor violations escalate to the next severity level.

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Access Management Policy | ALMA-POL-2025-002 |
| Data Classification Policy | ALMA-POL-2025-004 |
| Remote Work Guidelines | ALMA-GDL-2025-001 |
| Software Procurement Procedure | ALMA-SOP-2025-015 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2024 | A. Johnson | Initial policy release |
| 1.5 | August 1, 2024 | S. Chen | Added removable media and BYOD sections |
| 2.0 | January 15, 2025 | S. Chen | Major revision: added consequences matrix, remote work section, monitoring disclosure |

---

*This is a fictional example created for educational purposes.*
