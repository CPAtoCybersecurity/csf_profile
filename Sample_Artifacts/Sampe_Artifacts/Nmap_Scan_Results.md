# Network Discovery Scan Results
**Scan Date:** 2026-02-14
**Scanner:** Nmap 7.94
**Scope:** 10.0.0.0/16 (Alma Security internal network)

## Scan Command
nmap -sn -oX scan_results.xml 10.0.0.0/16

## Summary
- **Hosts Up:** 342
- **Hosts in Inventory:** 339
- **Discrepancies:** 3 unknown devices

## Unknown Devices Detected
| IP Address | MAC Address | Vendor (OUI) | Notes |
|------------|-------------|--------------|-------|
| 10.0.2.201 | AA:BB:CC:11:22:33 | Unknown | Investigate - not in CMDB |
| 10.0.3.15 | DD:EE:FF:44:55:66 | Raspberry Pi | Shadow IT? |
| 10.0.1.99 | 00:11:22:33:44:55 | Dell Inc | Recently deployed? |

## Recommended Actions
1. IT Desktop team to investigate 10.0.2.201 and 10.0.3.15
2. Infrastructure team to verify 10.0.1.99 deployment status
3. Update CMDB with any legitimate new assets
