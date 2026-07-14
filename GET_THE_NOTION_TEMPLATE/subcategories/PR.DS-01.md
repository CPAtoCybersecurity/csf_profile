---
id: 'PR.DS-01'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.DS'
category_name: 'Data Security'
in_scope: 'Yes'
owner: 'chris.magann <chris.magann@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07'
score: 6
target_score: 5
minimum_target: 5
remediation_owner: 'chris.magann <chris.magann@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# PR.DS-01 — The confidentiality, integrity, and availability of data-at-rest are protected

## Description

The confidentiality, integrity, and availability of data-at-rest are protected

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 3 | 5 | Complete | Yes | Yes | No | 30-Jan |
| Q2 | 4 | 5 | Complete | Yes | Yes | Yes | 25-Apr |
| Q3 | 6 | 5 | Submitted | No | Yes | No | 21-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Encryption policy documented and approved. S3 bucket security project in progress. Removable media restrictions planned for endpoint deployment.

**Q2 observations**

Data encryption upgrade project approved ($95K). Removable media controls deployed on managed endpoints. S3 bucket encryption enforced.

## NIST 800-53 References

CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07

## Test Procedures

1. Inquiry: CISO, 2. Inspect encryption policy, 3. Inspect endpoint config standards

## Implementation Examples

- **Ex1:** Use encryption, digital signatures, and cryptographic hashes to protect the confidentiality and integrity of stored data in files, databases, virtual machine disk images, container images, and other resources

  CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07
- **Ex2:** Use full disk encryption to protect data stored on user endpoints

  CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07
- **Ex3:** Confirm the integrity of software by validating signatures

  CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07
- **Ex4:** Restrict the use of removable media to prevent data exfiltration

  Data-at-rest protection includes: (1) encryption policy requiring AES-256 for sensitive data, (2) S3 bucket encryption enforced via bucket policies (S3 Bucket Security project), (3) removable media controls deployed through SentinelOne endpoint policy. The Data Encryption Upgrade project ($95K) enhances encryption across all data stores.
- **Ex5:** Physically secure removable media containing unencrypted sensitive information, such as within locked offices or file cabinets

  CA-03,CP-09,MP-08,SC-04,SC-07,SC-12,SC-13,SC-28,SC-32,SC-39,SC-43,SI-03,SI-04,SI-07

## Remediation / Action Plan

Execute Data Encryption Upgrade project ($95K). Extend removable media controls to all managed endpoints including servers. Verify S3 bucket encryption enforcement across all buckets.
