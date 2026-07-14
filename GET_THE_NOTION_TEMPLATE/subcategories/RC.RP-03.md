---
id: 'RC.RP-03'
function_id: 'RC'
function_name: 'RECOVER'
category_id: 'RC.RP'
category_name: 'Incident Recovery Plan Execution'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CP-02,CP-04,CP-09'
score: 5.5
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-10-31'
artifact_name:
---

# RC.RP-03 — The integrity of backups and other restoration assets is verified before using them for restoration

## Description

The integrity of backups and other restoration assets is verified before using them for restoration

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | No | 03-Feb |
| Q2 | 3 | 5 | Complete | No | Yes | Yes | 29-Apr |
| Q3 | 5.5 | 5 | Submitted | No | Yes | No | 25-Jun |
| Q4 | 5.5 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Backup verification procedures documented. DR Manager validates backup integrity monthly. Manual integrity checks performed.

**Q2 observations**

Backup integrity verification improved with automated checksums. Restore testing scheduled quarterly. S3 bucket security project enhances backup protection.

## NIST 800-53 References

CP-02,CP-04,CP-09

## Test Procedures

1. Inquiry: CISO, DR Manager, 2. Inspect backup verification procedure, 3. Inspect sample of restores

## Implementation Examples

- **Ex1:** Check restoration assets for indicators of compromise, file corruption, and other integrity issues before use

  Backup integrity verification includes: (1) automated checksums for S3 backups, (2) monthly integrity validation by DR Manager, (3) quarterly restore testing to verify recoverability. The S3 Bucket Security project enhances backup protection with versioning and cross-region replication. Restoration assets are checked for IOCs before recovery use.

## Remediation / Action Plan

Implement automated IOC scanning for backup restoration assets. Expand quarterly restore testing to cover all critical systems. Complete S3 bucket security project backup protection enhancements.
