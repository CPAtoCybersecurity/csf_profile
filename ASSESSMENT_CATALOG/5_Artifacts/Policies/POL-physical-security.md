# Physical Security Policy

| Field | Value |
|-------|-------|
| **Policy ID** | ALMA-POL-2025-006 |
| **Version** | 1.1 |
| **Effective Date** | January 15, 2025 |
| **Next Review Date** | January 15, 2026 |
| **Policy Owner** | Chief Information Security Officer (CISO) |
| **Approved By** | Executive Leadership Team |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This policy establishes physical security requirements for Alma Security facilities, equipment, and restricted areas to protect personnel, information assets, and infrastructure from unauthorized physical access, theft, and environmental threats.

---

## 2. Scope

This policy applies to:

- Alma Security headquarters (Redwood City, California)
- On-premises server and network infrastructure
- All employees, contractors, visitors, and service providers accessing Alma facilities
- Company-owned equipment regardless of location

---

## 3. Facility Access Control

### 3.1 Badge Access System

| Zone | Access Level | Authentication | Personnel |
|------|-------------|----------------|-----------|
| Building perimeter | Standard badge | Badge tap | All employees |
| Office floors | Department badge | Badge tap | Department members + approved cross-department |
| Server room | Restricted | Badge + PIN | IT Infrastructure team (named list) |
| Network closets | Restricted | Badge + PIN | Network Operations team (named list) |
| Executive suite | Restricted | Badge | Executive team + EA staff |

### 3.2 Badge Provisioning

- Badges are issued by Facilities upon HR confirmation of employment start date
- Badge access levels are requested through ServiceNow and approved by the employee's manager
- Restricted area access requires additional approval from the area owner
- Temporary badges for contractors include an expiration date matching the contract term
- Lost or stolen badges must be reported to Facilities immediately; the badge is deactivated within 1 hour of report

### 3.3 Badge Deactivation

| Event | Deactivation Timeline |
|-------|----------------------|
| Involuntary termination | Within 1 hour of HR notification |
| Voluntary departure | End of last business day |
| Contractor end | Contract end date |
| Lost/stolen badge | Within 1 hour of report |
| Extended leave (>30 days) | Suspended for duration of leave |

---

## 4. Visitor Management

### 4.1 Visitor Procedures

1. All visitors must be pre-registered by their Alma host via the visitor management system
2. Visitors sign in at the front desk and receive a dated visitor badge
3. Visitors must be escorted by their Alma host at all times in the facility
4. Visitor badges are collected upon departure; front desk verifies sign-out
5. Visitor logs are retained for 12 months

### 4.2 Visitor Restrictions

- Visitors are prohibited from entering restricted areas (server room, network closets) unless accompanied by the area owner and approved in advance
- Visitor devices are not permitted on the corporate network; guest Wi-Fi is available
- Photography in restricted areas is prohibited
- Delivery and maintenance personnel follow the same escort requirements

---

## 5. Server Room and Data Center Controls

### 5.1 Physical Controls

| Control | Specification |
|---------|--------------|
| Access | Badge + PIN; access list maintained by IT Infrastructure Manager |
| Surveillance | CCTV with 90-day recording retention |
| Environmental | HVAC with redundancy; temperature monitoring with alerting (threshold: 75 degrees F) |
| Fire suppression | Clean agent (FM-200) system with smoke detection |
| Power | UPS with 30-minute runtime; diesel generator for extended outages |
| Water detection | Under-floor sensors with alerting |

### 5.2 Server Room Access Log Review

- Physical access logs are reviewed monthly by the IT Infrastructure Manager
- Anomalous access (after-hours, unusual frequency) is investigated within 48 hours
- Access list is reviewed quarterly and reconciled against current role assignments

---

## 6. Equipment Security

### 6.1 On-Premises Equipment

- All servers, network equipment, and storage devices are asset-tagged and tracked in the ServiceNow CMDB
- Equipment disposal follows secure media destruction procedures (NIST SP 800-88 guidelines)
- Equipment relocation requires an approved change ticket

### 6.2 Remote and Mobile Equipment

- Laptops must have full-disk encryption enabled (enforced via MDM)
- Lost or stolen devices must be reported within 4 hours; remote wipe initiated by IT Security
- Company equipment must not be left unattended in public spaces
- Screen locks must activate after 5 minutes of inactivity

---

## 7. Environmental Controls

| Threat | Control | Monitoring |
|--------|---------|------------|
| Temperature | Redundant HVAC; hot/cold aisle containment | Automated alerting at 75 degrees F |
| Humidity | HVAC humidity control (40-60% RH) | Automated alerting at thresholds |
| Water | Under-floor leak detection sensors | Automated alerting |
| Fire | FM-200 clean agent; smoke detectors | Automated alerting; fire panel monitored 24/7 |
| Power | UPS + generator; surge protection | Automated failover; monthly generator testing |

---

## 8. Compliance and Audit

- Physical access logs are available for audit upon request
- Annual physical security assessment is conducted by Facilities and IT Security
- Semi-annual access list review for all restricted areas
- CCTV footage is available for incident investigation (90-day retention)

---

## 9. Exceptions

Physical security exceptions require:

- Written business justification
- Risk assessment by IT Security and Facilities
- CISO approval
- Time-bound duration
- Compensating controls documentation

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Access Management Policy | ALMA-POL-2025-002 |
| Acceptable Use Policy | ALMA-POL-2025-003 |
| Incident Response Playbook | ALMA-SOP-2025-010 |
| Equipment Disposal Procedure | ALMA-SOP-2025-012 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 15, 2025 | Facilities Manager | Initial policy release |
| 1.1 | February 16, 2026 | S. Chen | Annual review; updated server room controls; added environmental monitoring thresholds |

---

*This is a fictional example created for educational purposes.*
