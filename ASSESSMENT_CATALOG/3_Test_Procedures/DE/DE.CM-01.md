# DE.CM-01: Network Monitoring Test Procedures

**CSF Subcategory:** DE.CM-01 — Networks and network services are monitored to find potentially adverse events

**Scope:** Alma Security 2026 CSF Assessment

**Auditor:** Steve <steve@almasecurity.com>

---

## Test Procedures

1. **Verify network traffic monitoring coverage**
   - Confirm VPC Flow Logs are enabled for all VPCs and subnets across AWS accounts
   - Verify DNS query logging is active for all Route 53 resolvers
   - Assess network monitoring coverage for the Redwood City office network (wired and wireless)
   - Identify any network segments without active monitoring

2. **Evaluate network anomaly detection**
   - Review GuardDuty network-based finding types and detection coverage
   - Test VPC Flow Log analysis for volumetric anomalies and unexpected communication paths
   - Verify network flow baseline existence and deviation alerting
   - Assess detection capability for DNS tunneling, DGA domains, and C2 communication

3. **Test unauthorized endpoint detection**
   - Review 802.1X and WPA3-Enterprise authentication logs for unregistered device attempts
   - Cross-reference SentinelOne endpoint inventory against IT asset register
   - Verify VPC security group rules restrict access to authorized resources only
   - Test detection of connections from unauthorized IP ranges

4. **Assess rogue wireless monitoring**
   - Verify wireless controller rogue AP detection is active
   - Review quarterly wireless security assessment reports
   - Confirm policy enforcement for personal hotspot prohibition

---

## Evidence Requests

- [ ] VPC Flow Log configuration for all accounts
- [ ] DNS query logging configuration
- [ ] GuardDuty network finding type list and enabled detectors
- [ ] 802.1X and RADIUS authentication logs (sample)
- [ ] SentinelOne endpoint inventory vs. IT asset register reconciliation
- [ ] Wireless controller rogue AP detection configuration
- [ ] Quarterly wireless security assessment report

---

## Notes

This test procedure evaluates Alma's network monitoring capabilities across both AWS cloud infrastructure and the Redwood City office environment. VPC Flow Logs and GuardDuty provide strong cloud network monitoring, while office network monitoring relies on enterprise wireless controller capabilities and physical network access controls. No external attack surface monitoring (ASM) tool is currently deployed.
