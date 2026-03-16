# DE.CM-01 Ex2: Unauthorized Endpoint Detection

**Subcategory:** DE.CM-01 — Networks and network services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, CA-07, CM-03, SC-05, SC-07, SI-04

## Implementation Example

> Monitor wired and wireless networks for connections from unauthorized endpoints

## Alma Security Implementation

VPC security groups and network ACLs restrict connectivity to authorized resources, with VPC Flow Log analysis identifying connection attempts from unexpected source IPs or unauthorized CIDR ranges. The Redwood City office network uses 802.1X port-based authentication for wired connections and WPA3-Enterprise for wireless, with RADIUS logs capturing authentication attempts from unregistered devices. SentinelOne endpoint inventory is cross-referenced weekly against the IT asset register to identify unmanaged devices connecting to corporate resources.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
