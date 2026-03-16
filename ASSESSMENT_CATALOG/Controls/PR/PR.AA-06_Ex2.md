# PR.AA-06 Ex2: Visitor Management and Temporary Physical Access

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-8

## Implementation Example

> Managing visitor access through registration, identification, escort requirements, and temporary badge issuance to ensure non-employees are tracked and supervised within the facility

## Alma Security Implementation

Alma Security operates a visitor management process at the Redwood City headquarters reception desk. Visitors are required to sign in at the front desk, present government-issued identification, and identify their host employee. The receptionist issues a temporary visitor badge that is visually distinct from employee badges (bright orange with "VISITOR" prominently displayed and the date printed). The host employee is notified and must physically meet the visitor at reception before they can proceed beyond the lobby.

Visitors are escorted at all times in work areas and are prohibited from entering restricted zones (server room, security operations area) without pre-approved authorization from the zone owner. The visitor log captures name, company, host, purpose of visit, entry time, and exit time. Visitor badges include a one-day expiration and do not provide electronic access through badge readers; all doors beyond the lobby require the escort's badge for entry. Visitor badges are collected at the end of the visit and reconciled daily by the reception team.

The visitor management process is documented in the Physical Security Policy, which was updated in Q2 2025 to include requirements for vendor technicians who require unescorted server room access. These technicians undergo a pre-approval process: the vendor company provides background check documentation, the visit is scheduled through ServiceNow with the infrastructure team's approval, and the technician receives a temporary badge with server room access that expires at the scheduled visit end time. Three vendor technician visits occurred in Q1 2026 (two for Palo Alto firewall maintenance and one for HVAC system servicing), all following the pre-approval process.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Physical Security Policy (visitor management section) | SharePoint > Policies > Physical Security | 2025-06-15 |
| Visitor log (last 30 days) | Reception Desk > Visitor Log | 2026-03-10 |
| Visitor badge issuance and reconciliation records | Facilities > Badge Management | 2026-03-10 |
| Vendor technician pre-approval records | ServiceNow > Vendor Access Requests | 2026-03-01 |
| Temporary badge access configuration (server room) | ACS Management Console | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 5 | On Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Visitor log is paper-based; no digital visitor management system | Paper logs difficult to search for historical visits; no automated host notification or badge tracking | Evaluate digital visitor management system (Envoy, SwipedOn) with automated host notification and photo capture | Gerry | 2026-08-31 |
| No visitor background check requirement for non-vendor visitors | Standard visitors (clients, partners, candidates) are not background-checked before facility access | Assess risk-based visitor vetting requirements; implement pre-registration for visits to sensitive areas | Chris Magann | 2026-09-30 |
