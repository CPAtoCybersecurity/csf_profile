# SentinelOne Application Control Configuration Evidence

| Field | Value |
|-------|-------|
| **Document ID** | ALMA-EVD-S1AC-2026-Q1 |
| **Export Date** | March 14, 2026 |
| **Source System** | SentinelOne Management Console |
| **Exported By** | Nadia Khan, D&R Lead |
| **Classification** | Internal Use Only |

---

## Overview

This document captures the SentinelOne application control configuration as deployed across the Alma Security endpoint fleet. Application control restricts execution of unauthorized software, enforcing the authorized software inventory (INV-software-inventory). This evidence supports the PR.PS-05 (software installation restriction) assessment.

---

## Deployment Summary

| Parameter | Value |
|-----------|-------|
| SentinelOne agent version | 24.1.2.8967 |
| Total managed endpoints | 287 |
| Application control enabled | 287 (100%) |
| Enforcement mode | Detect and Block |
| Policy last updated | February 28, 2026 |

---

## Policy Configuration

### Global Application Control Policy: ALMA-Production

| Setting | Value |
|---------|-------|
| Policy name | ALMA-Production |
| Policy scope | All managed endpoints (Site: Alma Security) |
| Enforcement mode | Detect and Block |
| Hash-based allowlist | Enabled |
| Certificate-based allowlist | Enabled |
| Path-based rules | Enabled (limited) |
| Notification to user on block | Enabled ("Contact IT Security for software approval") |
| Logging | All block events logged to SIEM |

### Application Control Rules

| Rule Type | Count | Description |
|-----------|-------|-------------|
| Allowlisted by certificate | 42 | Trusted publisher certificates (Microsoft, Apple, Google, JetBrains, Docker, etc.) |
| Allowlisted by SHA-256 hash | 156 | Specific application binaries verified by IT Security |
| Allowlisted by path | 8 | Approved installation directories (e.g., Program Files, approved dev tool paths) |
| Blocklisted by hash | 34 | Known malicious or prohibited application hashes |
| Blocklisted by name | 12 | Prohibited application names (e.g., cryptocurrency miners, unauthorized remote access tools) |

### Blocklisted Applications (Sample)

| Application Name | Reason | Date Added |
|-----------------|--------|------------|
| NiceHash Miner | Cryptocurrency mining software | March 2024 |
| TeamViewer (unlicensed) | Unauthorized remote access | March 2024 |
| AnyDesk | Unauthorized remote access | March 2024 |
| uTorrent | P2P file sharing | March 2024 |
| CCleaner | Unapproved system utility | June 2024 |
| Wireshark (non-Security) | Network capture tool (approved only for Security team devices) | September 2024 |

---

## Device Control Configuration

### Removable Media Policy

| Setting | Value |
|---------|-------|
| Policy name | ALMA-RemovableMedia-Block |
| USB mass storage | Blocked (all endpoints) |
| USB keyboard/mouse | Allowed |
| Bluetooth file transfer | Blocked |
| CD/DVD write | Blocked |
| MTP devices (phones) | Blocked for file transfer |
| Exception process | CISO approval via ServiceNow |

### Active Exceptions

| Exception ID | Device Type | Justification | Approved By | Expiration |
|-------------|------------|---------------|-------------|------------|
| EXC-2025-007 | USB drive (encrypted, specific serial) | Hardware engineering lab data transfer | CISO | June 30, 2026 |
| EXC-2025-011 | USB drive (encrypted, specific serial) | QA test device provisioning | CISO | April 30, 2026 |
| EXC-2026-001 | SD card reader (specific serial) | Marketing media import (trade show) | CISO | March 31, 2026 |

---

## DLP Monitoring Configuration

| Setting | Value |
|---------|-------|
| File type monitoring | Enabled for sensitive file types (.pem, .key, .sql, .csv, .xlsx with PII indicators) |
| Clipboard monitoring | Disabled (privacy consideration) |
| Screen capture monitoring | Disabled |
| External drive write monitoring | Enabled (block + log) |
| Network share monitoring | Enabled (log only) |
| Cloud upload monitoring | Enabled for non-approved destinations |

---

## Block Events Summary (Last 30 Days)

| Category | Events | Top Blocked Items |
|----------|--------|-------------------|
| Unauthorized application execution | 47 | Unlicensed utilities (23), browser extensions with executables (12), developer tools not in allowlist (8), unknown (4) |
| Removable media block | 18 | USB mass storage insertion (14), Bluetooth transfer attempts (3), MTP device (1) |
| Blocklisted application | 3 | AnyDesk installation attempt (2), cryptocurrency miner (1) |
| **Total** | **68** | |

### Notable Events

| Date | Event | Endpoint | User | Action Taken |
|------|-------|----------|------|-------------|
| Feb 3, 2026 | AnyDesk installation attempt | ws-rjones-01 | R. Jones (Sales) | Blocked; user counseled on AUP; documented |
| Feb 18, 2026 | Cryptocurrency miner detected | lt-kpatel-01 | K. Patel (Engineering) | Blocked; investigation found it was a misconfigured dev dependency, not intentional; resolved |
| Mar 7, 2026 | AnyDesk installation attempt | ws-lchen-01 | L. Chen (Marketing) | Blocked; user redirected to approved remote access (GlobalProtect) |

---

## Agent Health

| Metric | Value |
|--------|-------|
| Agents online (last 24 hours) | 271 / 287 (94.4%) |
| Agents offline > 7 days | 3 (employees on extended leave; devices powered off) |
| Agent version current | 282 / 287 (98.3%) |
| Agent version outdated (> 1 release behind) | 5 (auto-update pending next login) |
| Policy sync status | 287 / 287 (100% synced within 24 hours) |

---

## Configuration Change Log (Last 90 Days)

| Date | Change | Changed By | Approval |
|------|--------|-----------|----------|
| Feb 28, 2026 | Added 4 new application hashes to allowlist (VS Code update, Terraform 1.8) | IT Security | Standard change |
| Feb 15, 2026 | Added blocklist entry for unauthorized Chrome extension installer | N. Khan | Standard change |
| Jan 20, 2026 | Updated certificate allowlist for JetBrains 2025.1 release | IT Security | Standard change |
| Jan 10, 2026 | Added removable media exception EXC-2026-001 | IT Security | CISO approval |
| Dec 22, 2025 | Quarterly review: removed 8 obsolete hash allowlist entries | IT Security | Standard change |

---

*This is a fictional example created for educational purposes.*
