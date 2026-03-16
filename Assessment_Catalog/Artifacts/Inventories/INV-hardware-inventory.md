# Alma Security Hardware Inventory
**Last Updated:** 2026-02-15
**Source:** ServiceNow CMDB + Nmap Scan

| Asset ID | Device Type | Hostname | IP Address | Location | Owner | Status |
|----------|-------------|----------|------------|----------|-------|--------|
| HW-001 | Server | alma-db-prod-01 | 10.0.1.50 | DC-East | Infrastructure | Active |
| HW-002 | Server | alma-web-prod-01 | 10.0.1.51 | DC-East | Infrastructure | Active |
| HW-003 | Workstation | ws-jsmith-01 | 10.0.2.105 | HQ-Floor2 | Desktop Support | Active |
| HW-004 | Network Switch | sw-core-01 | 10.0.0.1 | DC-East | Network Ops | Active |
| HW-005 | Laptop | lt-mwilson-01 | DHCP | Remote | Desktop Support | Active |

**Reconciliation Notes:**
- 3 devices found on network scan not in inventory (flagged for investigation)
- 2 inventory items marked Active but not responding to scan (verify status)



