# PR.AA-06: Physical Access Management — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Physical Security Policy, badge access matrix, ACS badge logs for server room (30 days), visitor log (30 days), security camera coverage map, environmental monitoring system configuration, offboarding badge deactivation records |
| Interview | Yes | Interviewed Gerry on physical security governance and server room access authorization; facilities manager on badge lifecycle management, visitor procedures, and environmental controls; Nadia Khan on physical-logical access correlation requirements |
| Test | Yes | Sampled 6 Q4 2025 terminations for badge deactivation timing; physically inspected server room access controls (badge-plus-PIN); verified visitor badge collection reconciliation for last 30 days; tested environmental monitoring alert by reviewing January 2026 quarterly test results |

---

## Findings

Alma Security's physical access controls for the Redwood City headquarters are well-structured with a defined zone classification system and electronic badge-based access enforcement. The facility has 8 classified access zones mapped to 6 role categories in a physical access matrix maintained by the facilities team. The server room housing the Windows Domain Controller, Palo Alto firewall appliances, and network switching infrastructure is classified as a high-security zone requiring badge-plus-PIN authentication. Access is restricted to 11 authorized individuals and reviewed monthly.

Badge lifecycle management is integrated into the employee onboarding and offboarding workflows through ServiceNow. Testing of 6 Q4 2025 terminations revealed that 4 badges were deactivated within the required SLA, but 2 badges remained active for 3 and 5 business days after the employee's last day respectively. Both were voluntary terminations where the manual handoff between IT and the facilities team caused the delay. The facilities manager confirmed this gap and reported that a ServiceNow automation to directly trigger badge deactivation is under development for deployment by May 2026.

The visitor management process is operational with consistent adherence to procedures. Visitor logs for the past 30 days showed 47 visitor entries, all with complete registration data (name, company, host, purpose, entry/exit time). Visitor badges are visually distinct (bright orange, date-printed) and reconciliation records confirm 100% badge return. Three vendor technician visits to the server room (two for Palo Alto maintenance, one for HVAC) followed the pre-approval process with ServiceNow documentation.

Environmental controls in the server room are operational. Temperature and humidity sensors, water leak detection, and smoke detection are active with appropriate alert thresholds. The January 2026 quarterly environmental test confirmed all systems functioning within parameters. UPS provides 30 minutes of battery runtime with automatic transfer to the building backup generator.

AWS physical security for production Kubernetes workloads is inherited through the shared responsibility model. The most recent AWS SOC 2 Type II report review (November 2025) confirmed adequate physical controls at AWS data centers with no concerns raised.

Physical access logs are retained in the ACS but are not forwarded to the SIEM for correlation with logical access events. Nadia Khan highlighted this as a gap: the inability to correlate physical entry to the server room with concurrent Active Directory or AWS authentication events limits investigation capability for insider threat scenarios.

### Strengths

- 8-zone physical access classification with role-based access matrix
- Server room protected by badge-plus-PIN multi-factor physical authentication
- Monthly review of server room access authorization (11 authorized individuals)
- Visitor management achieves 100% badge return and complete registration data
- Vendor technician visits follow pre-approval process with ServiceNow documentation
- Environmental monitoring operational with quarterly testing cadence
- AWS physical security validated through annual SOC 2 Type II report review

### Gaps

- 2 of 6 sampled terminations had delayed badge deactivation (3-5 business days)
- Badge deactivation relies on manual handoff between IT and facilities
- Physical access logs not forwarded to SIEM for logical-physical correlation
- No anti-tailgating measures at main building entrance
- Visitor log is paper-based with no digital visitor management system
- Server room camera footage not integrated with ACS badge logs for automated correlation

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 6 |

---

## Evidence Reviewed

- Physical Security Policy (updated Q2 2025)
- Physical access zone map and 8-zone classification
- Badge access matrix (6 role categories)
- ACS server room badge logs (February 10 - March 10, 2026)
- 6 termination badge deactivation records (Q4 2025)
- Visitor log (February 15 - March 15, 2026, 47 entries)
- Visitor badge reconciliation records (30-day period)
- 3 vendor technician pre-approval records from ServiceNow
- Server room environmental monitoring configuration and Q1 2026 test results
- Security camera coverage map
- AWS SOC 2 Type II report review notes (November 2025)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Automate badge deactivation through ServiceNow offboarding workflow; eliminate manual facilities handoff | High | Gerry |
| 2 | Forward ACS physical access logs to SIEM for correlation with logical access events | High | Nadia Khan |
| 3 | Implement anti-tailgating measures at main building entrance (turnstiles or optical sensors) | Medium | Chris Magann |
| 4 | Migrate from paper visitor log to digital visitor management system (Envoy, SwipedOn) | Medium | Gerry |
| 5 | Integrate server room camera footage with ACS badge events for automated video retrieval | Low | Chris Magann |
| 6 | Evaluate biometric authentication (fingerprint or palm) for server room entry | Low | Gerry |
