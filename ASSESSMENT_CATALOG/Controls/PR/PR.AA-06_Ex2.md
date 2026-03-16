# PR.AA-06 Ex2: Visitor Management and Temporary Physical Access

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-8

## Implementation Example

> Managing visitor access through registration, identification, escort requirements, and temporary badge issuance to ensure non-employees are tracked and supervised within the facility

## Alma Security Implementation

Alma Security manages visitor access at the Redwood City headquarters through a reception-based process requiring sign-in, government-issued ID presentation, and host employee escort. Visitors receive a visually distinct temporary badge (one-day expiration, no electronic access) and must be escorted at all times in work areas, with restricted zones prohibited without pre-approved zone-owner authorization. The visitor log captures name, company, host, purpose, and entry/exit times, with badges collected and reconciled daily. Vendor technicians requiring unescorted server room access undergo a pre-approval process through ServiceNow including background check documentation and time-limited badge provisioning.

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
