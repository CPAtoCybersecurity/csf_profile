# PR.DS-11_Ex3: Test Backup Restoration Procedures

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Regularly test backup restoration procedures to verify that backups can be successfully restored within defined Recovery Time Objectives (RTO) and that restored data maintains integrity and completeness.

## Alma Security Implementation

Alma Security conducts quarterly backup restoration tests to validate that critical systems can be recovered from backup within defined recovery objectives. The quarterly restore testing program covers PostgreSQL databases (RDS point-in-time recovery), S3 data restoration (versioned object recovery), and Kubernetes application state (Velero restore to a test namespace). Each test follows a documented restoration test plan that defines success criteria including data integrity verification, application functionality validation, and time-to-recovery measurement.

The most recent quarterly restore test (Q4 2025) successfully restored the PostgreSQL production database to a test environment within 45 minutes, verified data integrity through row count comparison and checksum validation, and confirmed application functionality against a subset of integration tests. S3 data restoration was completed within 15 minutes for a sample dataset. Velero Kubernetes restoration was completed within 30 minutes with all persistent volumes and application configurations intact. These results are documented in a formal test report with findings, measurements, and improvement recommendations.

Recovery objectives are currently defined informally based on system criticality: the continuous authentication platform has a target RTO of 1 hour and RPO of 5 minutes (supported by RDS continuous archiving), while supporting systems have a target RTO of 4 hours and RPO of 24 hours. The DR plan currently in development through the Cloud Security Optimization project ($100K) will formalize these objectives and establish a comprehensive recovery testing program that includes full-environment recovery scenarios beyond individual system restoration.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Quarterly restore test plan and schedule | IT operations documentation | 2026-02-15 |
| Q4 2025 restore test report with results | IT operations records | 2026-01-15 |
| RDS point-in-time recovery test evidence | AWS RDS Console / test environment | 2026-01-15 |
| Velero restore test evidence | Velero CLI output / test namespace | 2026-01-15 |
| RTO and RPO definitions by system criticality | IT operations / DR planning docs | 2026-02-15 |
| DR plan development status (Cloud Security Optimization project) | Jira project CLOUDSEC-2026 | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 7 | On Track - quarterly testing established, DR plan formalization in progress |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No full-environment DR recovery test (only individual system restores) | Cannot validate end-to-end recovery capability | Include full-environment recovery scenario in DR plan test program | Tigan Wang | 2026-08-31 |
| RTO/RPO targets not formally approved by business stakeholders | Recovery objectives may not align with business expectations | Formalize RTO/RPO through DR plan with business stakeholder sign-off | Tigan Wang | 2026-06-30 |
| Q1 2026 restore test not yet conducted | Testing cadence gap | Schedule and execute Q1 2026 quarterly restore test | Tigan Wang | 2026-03-31 |
