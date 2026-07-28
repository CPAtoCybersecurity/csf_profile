# Evidence Preservation Guide (Excerpt)

| Field | Value |
|-------|-------|
| **Procedure ID** | ALMA-SOP-2025-010b |
| **Version** | 1.0 |
| **Effective Date** | March 1, 2025 |
| **Last Reviewed** | February 16, 2026 |
| **Procedure Owner** | Nadia Khan, Detection & Response Lead |
| **Approved By** | CISO |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This guide defines how the Detection & Response team collects, preserves, and documents evidence
during incident investigations, so that investigation actions and collected data remain complete,
attributable, and defensible after the fact. It is the companion procedure to the [Incident Response
Playbook](PROC-incident-response-playbook.md) (ALMA-SOP-2025-010), referenced there under Related
Documents but not previously written up as a standalone guide.

---

## 2. Scope

Applies to all evidence gathered during Phase 1 (Detection and Triage) through Phase 3 (Eradication)
of the Incident Response Playbook, across Alma's detection and response tooling: SentinelOne EDR, AWS
GuardDuty, CloudTrail, VPC Flow Logs, and ServiceNow incident tickets. Does not cover litigation-hold
or law-enforcement chain-of-custody requirements, which are handled jointly with Legal on a
case-by-case basis per the playbook's Communication section.

---

## 3. Evidence Types and Collection Priority

Evidence is collected in order of volatility — the most perishable state first:

| Priority | Evidence Type | Example Source |
|----------|---------------|-----------------|
| 1 (most volatile) | Active memory, running processes, active network connections | SentinelOne Deep Visibility live query |
| 2 | Volatile network state | VPC Flow Logs, active GuardDuty findings |
| 3 | Authentication and API activity | CloudTrail, corporate SSO (Active Directory) authentication logs |
| 4 | Persistent host artifacts | SentinelOne endpoint file/registry snapshots |
| 5 (least volatile) | Ticket and communication records | ServiceNow incident ticket, Slack #soc-alerts export |

Responders capture Priority 1–2 evidence during the Investigation step (Playbook §4.2) before any
containment action that could disrupt it — for example, before a SentinelOne network quarantine or an
IAM deny-all policy attachment, both of which can end an active session before its state is captured.

---

## 4. Collection Procedures

1. **SentinelOne evidence** — export the Deep Visibility query results (process tree, network
   connections, file modifications) for the affected endpoint as a timestamped report attached
   directly to the ServiceNow incident ticket.
2. **GuardDuty evidence** — export the full finding JSON, not a summary screenshot, so the original
   metadata (finding ID, severity, resource ARN, first/last observed timestamps) is preserved intact.
3. **CloudTrail evidence** — query API activity for the affected IAM identity across the incident
   window and export the result set; note the query parameters used alongside the export so the
   collection is reproducible.
4. **Ticket and communication evidence** — attach exports directly to the ServiceNow incident ticket
   rather than linking to a source system that may later be modified, quarantined, or expire logs
   under its own retention schedule.

---

## 5. Integrity Controls

- Every exported evidence file is hashed (SHA-256) at the time of collection, and the hash is recorded
  in the ServiceNow ticket alongside the file.
- Evidence attached to a ServiceNow ticket inherits ServiceNow's audit logging — any modification to
  an attachment is recorded with the modifying user and timestamp, satisfying the tamper-evidence
  requirement without a separate storage system.
- Access to closed-incident tickets and their evidence attachments is restricted to the Detection &
  Response team and Internal Audit; access is logged.

---

## 6. Chain of Custody and Provenance Documentation

For each evidence item, the collecting analyst records directly on the ServiceNow ticket:

- **Source system** the evidence was collected from
- **Collector** — the analyst's identity
- **Timestamp** of collection
- **Method** — the specific export/query used (Section 4)
- **Hash** at time of collection (Section 5)

If an evidence item is later transferred between personnel (for example, from the initial responder
to whoever performs root-cause analysis under the playbook's §8.2 Post-Incident Review), the transfer
is logged as a ServiceNow ticket comment naming both parties and the timestamp, so the custody trail
has no gap between collection and analysis.

---

## 7. Retention

Evidence attached to a ServiceNow incident ticket is retained per the ticket's own record retention
schedule, which follows the [Information Security Policy](../Policies/POL-information-security.md)
(ALMA-POL-2025-001). Evidence relevant to an incident still under active review by Internal Audit or
Legal is held past the standard schedule until that review closes, consistent with the Business
Continuity Plan (ALMA-SOP-2025-013).

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Incident Response Playbook | ALMA-SOP-2025-010 |
| Information Security Policy | ALMA-POL-2025-001 |
| Business Continuity Plan | ALMA-SOP-2025-013 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2025 | N. Khan | Initial guide |

---

*This is a fictional example created for educational purposes.*
