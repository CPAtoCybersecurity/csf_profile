# PR.IR-01: Network Protection from Unauthorized Logical Access

**CSF Subcategory:** PR.IR-01 - Networks and network services are protected from unauthorized logical access and usage

---

## Test Procedures

1. **Review network architecture and segmentation design**
   - Obtain current network topology diagrams for AWS VPC and on-premises Redwood City data center
   - Identify network segments, VLANs, subnets, and trust boundaries
   - Verify that production, development, and management networks are logically separated
   - Confirm VPC architecture uses private subnets for backend services and public subnets only where required

2. **Examine firewall and gateway security controls**
   - Review Palo Alto firewall rulebase for the Redwood City data center perimeter
   - Verify rules follow least-privilege deny-by-default principles
   - Check for overly permissive rules (any/any, broad CIDR ranges, unused rules)
   - Review AWS Security Group and Network ACL configurations for production VPCs
   - Confirm 2FA enforcement via Windows Authenticator for administrative access to network devices

3. **Assess network integrity monitoring capabilities**
   - Verify VPC Flow Logs are enabled on all production VPCs and subnets
   - Confirm DNS query logging is active and forwarded to centralized logging
   - Check for network-based intrusion detection or anomaly detection capabilities
   - Review alerting thresholds and response procedures for network anomalies
   - Evaluate whether a WAF is deployed for internet-facing applications

4. **Evaluate network access control for device connectivity**
   - Determine whether Network Access Control (NAC) is implemented
   - Review how devices are authenticated before obtaining network access
   - Check whether rogue device detection exists on the corporate network
   - Verify Kubernetes pod network policies restrict east-west traffic between namespaces

5. **Test segmentation effectiveness**
   - Review evidence of segmentation testing or penetration test results targeting lateral movement
   - Verify that cross-segment traffic is logged and monitored
   - Confirm that Kubernetes network policies enforce namespace isolation
   - Check that on-premises Windows domain controllers are segmented from general user networks

---

## Evidence Requests

- [ ] Network topology diagrams (AWS VPC and on-premises)
- [ ] Palo Alto firewall rulebase export and change management logs
- [ ] AWS Security Group and Network ACL configurations
- [ ] VPC Flow Log configuration and sample output
- [ ] DNS query logging configuration
- [ ] Kubernetes network policy manifests
- [ ] NAC solution documentation (if implemented)
- [ ] Most recent penetration test report (network segmentation findings)
- [ ] WAF deployment status and project documentation
- [ ] Windows Authenticator 2FA configuration for network device access

---

## Notes

This test procedure evaluates how Alma Security protects its hybrid network environment — spanning AWS multi-AZ Kubernetes infrastructure and the Redwood City on-premises data center — from unauthorized logical access. Key areas of focus include the Palo Alto firewall configuration, VPC segmentation design, the absence of a WAF (currently a funded project at $112K), and network monitoring through VPC Flow Logs and DNS query logging. The presence of a Windows Server 2012 R2 fileserver scheduled for Q3 upgrade represents a legacy risk factor that should be examined for network exposure.
