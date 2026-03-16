# RS.AN-07: Incident Data and Metadata Collection — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident evidence collection procedures, SentinelOne forensic data export capabilities, CloudTrail log preservation settings, evidence storage repository configuration |
| Interview | Yes | Interviewed Nadia Khan on evidence collection and preservation standards; SOC analyst on forensic data acquisition workflow during active incidents |
| Test | Yes | Verified CloudTrail log immutability configuration; tested SentinelOne forensic data export for a sample endpoint; reviewed evidence repository access controls and integrity verification |

---

## Findings

Alma Security collects incident data and metadata from multiple sources during investigations. SentinelOne provides forensic data export capabilities including process trees, file system activity, network connections, and registry changes from affected endpoints. CloudTrail logs are stored in an S3 bucket with versioning enabled and server-side encryption, providing integrity protection for cloud-level event data. GuardDuty findings include metadata on detection context, severity, and related resources.

Evidence preservation relies on the immutability of source systems (CloudTrail log integrity validation, S3 versioning) rather than a dedicated forensic evidence management system. The incident response playbook defines evidence collection as a required step, but there is no standardized evidence catalog or manifest that tracks what data was collected for each incident. SentinelOne's Deep Visibility provides rich endpoint telemetry retention for 14 days, after which historical data must be explicitly exported and preserved if needed for longer-term investigation.

### Strengths

- CloudTrail log integrity validation and S3 versioning protect evidence immutability
- SentinelOne Deep Visibility provides 14 days of rich endpoint forensic telemetry
- Evidence collection defined as a required step in the incident response playbook
- Multiple data sources (SentinelOne, CloudTrail, GuardDuty) provide comprehensive incident metadata

### Gaps

- No dedicated forensic evidence management system or evidence locker
- No standardized evidence catalog or manifest per incident
- SentinelOne telemetry retention limited to 14 days without manual export
- Evidence provenance documentation (who collected, when, how) not formalized

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

---

## Evidence Reviewed

- CloudTrail log integrity validation configuration
- S3 evidence bucket versioning and encryption settings
- SentinelOne Deep Visibility retention and export settings
- Incident response playbook evidence collection section
- Evidence repository access control configuration
- Sample forensic data export from SentinelOne

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Implement standardized evidence manifest template to track all collected data per incident | High | Nadia Khan |
| 2 | Extend SentinelOne telemetry retention or implement automated export for active investigations | High | Nadia Khan |
| 3 | Deploy dedicated forensic evidence repository with chain-of-custody tracking | Medium | Nadia Khan |
| 4 | Document evidence provenance requirements (collector identity, timestamp, collection method, hash verification) | Medium | Nadia Khan |
