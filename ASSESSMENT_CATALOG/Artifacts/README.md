# Artifacts

Evidence documents supporting CSF assessments. Organized by artifact type rather than CSF function, since artifacts often support multiple subcategories across functions.

## Artifact Types

| Folder | Prefix | Description | Examples |
|--------|--------|-------------|----------|
| `Policies/` | `POL-` | Governance and policy documents | Information security policy, access management policy |
| `Procedures/` | `PROC-` | Operational procedures and runbooks | Sampling walkthrough, incident response playbook |
| `Reports/` | `RPT-` | Scan results, compliance reports, assessments | Nmap scan, AWS compliance report |
| `Inventories/` | `INV-` | Asset, system, and data inventories | Hardware inventory, software inventory |
| `Tickets/` | `TKT-` | Incident, change, and service tickets | SOC tickets, change requests |
| `Evidence/` | `EVD-` | Other supporting evidence | Phishing campaign data, assessment workbooks |

## File Naming

`{TYPE}-{descriptive-name}.{ext}`

Examples:
- `POL-access-management.md`
- `RPT-nmap-scan-results.md`
- `TKT-SOC-1001-phishing.md`
- `EVD-phish-campaign-2025-05-26.xlsx`

## Linking Artifacts to Assessments

Artifacts are referenced from:
- **Test Procedures** → "Evidence Requirements" section
- **Observations** → "Evidence Reviewed" section
- **Controls** → "Evidence of Implementation" section

Use relative paths when linking (e.g., `../../Artifacts/Policies/POL-access-management.md`).
