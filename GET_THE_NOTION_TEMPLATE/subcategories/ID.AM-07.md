---
id: 'ID.AM-07'
function_id: 'ID'
function_name: 'IDENTIFY'
category_id: 'ID.AM'
category_name: 'Asset Management'
in_scope: 'Yes'
owner: 'chris.magann <chris.magann@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CM-12,CM-13,SI-12'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'chris.magann <chris.magann@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# ID.AM-07 — Inventories of data and corresponding metadata for designated data types are maintained

## Description

Inventories of data and corresponding metadata for designated data types are maintained

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | No | 09-Feb |
| Q2 | 3 | 5 | Complete | Yes | Yes | Yes | 05-May |
| Q3 | 3 | 5 | Not Started | No | No | No | — |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Data classification policy approved. Biometric data classified as highest sensitivity (SG1). Tagging implementation in pilot phase.

**Q2 observations**

Classification schema operationalized. Sensitive data types tagged in production systems. Data scanning tool selected and deployment scheduled.

## NIST 800-53 References

CM-12,CM-13,SI-12

## Test Procedures

1. Inquiry: CISO, Data Governance, 2. Inspect data classification policy, 3. Observe data scanning tool

## Implementation Examples

- **Ex1:** Maintain a list of the designated data types of interest (e.g., personally identifiable information, protected health information, financial account numbers, organization intellectual property, operational technology data)

  CM-12,CM-13,SI-12
- **Ex2:** Continuously discover and analyze ad hoc data to identify new instances of designated data types

  CM-12,CM-13,SI-12
- **Ex3:** Assign data classifications to designated data types through tags or labels

  Data classification uses a tiered schema with biometric data classified as highest sensitivity per SG1. Classification tags are applied through: (1) data classification policy defining categories, (2) tagging implementation in production systems, (3) data scanning tool deployment (selected, scheduling underway). Metadata inventories track designated data types.
- **Ex4:** Track the provenance, data owner, and geolocation of each instance of designated data types

  CM-12,CM-13,SI-12

## Remediation / Action Plan

Complete data scanning tool deployment. Extend classification tagging to all production data stores. Implement automated classification for new data assets. Address biometric data inventory gaps.
