# PR.IR-04: Adequate Resource Capacity Maintenance

**CSF Subcategory:** PR.IR-04 - Adequate resource capacity to ensure availability is maintained

---

## Test Procedures

1. **Review capacity planning processes and documentation**
   - Determine whether a formal capacity planning process exists
   - Review capacity planning documentation, models, or forecasts for production systems
   - Verify whether capacity thresholds and growth projections are documented
   - Check whether capacity planning is integrated into change management and product roadmap processes
   - Assess whether historical utilization data informs capacity decisions

2. **Evaluate auto-scaling and elastic capacity mechanisms**
   - Review Kubernetes Horizontal Pod Autoscaler (HPA) configurations
   - Verify auto-scaling triggers, thresholds, minimum/maximum pod counts, and cooldown periods
   - Check AWS Auto Scaling Group or node auto-scaling configurations
   - Confirm that scaling policies account for both CPU/memory and application-specific metrics
   - Test whether auto-scaling responds appropriately to load changes

3. **Assess DDoS mitigation capabilities**
   - Determine whether AWS Shield (Standard or Advanced) is enabled
   - Review any DDoS mitigation strategy or runbook
   - Check whether rate limiting is configured at the load balancer or application layer
   - Verify DNS-level protections (e.g., Route 53 health checks, CloudFront distribution)
   - Assess the WAF project's ($112K) scope regarding DDoS mitigation capabilities
   - Review incident response procedures specific to volumetric or application-layer attacks

4. **Review infrastructure monitoring for capacity events**
   - Verify monitoring dashboards track CPU, memory, storage, and network utilization
   - Check alerting thresholds for capacity-related metrics (disk space, connection pools, queue depths)
   - Confirm trending and forecasting capabilities for resource utilization
   - Review on-call escalation procedures for capacity-related alerts
   - Verify log storage capacity and retention are adequate for audit and investigation needs (AU-04)

5. **Evaluate power and environmental capacity**
   - Review power capacity planning for Redwood City data center
   - Verify UPS capacity meets current and projected load
   - Confirm cooling capacity is adequate for current equipment density
   - Check whether power and cooling capacity are considered in hardware procurement decisions

---

## Evidence Requests

- [ ] Capacity planning documentation or forecasting models
- [ ] Kubernetes HPA configurations and auto-scaling policies
- [ ] AWS Auto Scaling configuration for node groups
- [ ] DDoS mitigation strategy or runbook
- [ ] AWS Shield configuration status
- [ ] Infrastructure monitoring dashboards (CPU, memory, storage, network)
- [ ] Capacity alerting thresholds and escalation procedures
- [ ] Historical resource utilization reports (3-6 months)
- [ ] WAF project scope documentation (DDoS components)
- [ ] Power and cooling capacity documentation for Redwood City data center

---

## Notes

Alma Security leverages Kubernetes auto-scaling for elastic capacity in its AWS environment, which provides reactive capacity management for production workloads. However, the assessment should determine whether proactive capacity planning exists beyond auto-scaling — including growth forecasting, capacity modeling, and planned capacity reviews. The absence of a WAF creates exposure to application-layer DDoS attacks that auto-scaling alone cannot mitigate cost-effectively. The Redwood City data center introduces physical capacity planning requirements (power, cooling, rack space) that differ from cloud elastic capacity. The Windows Server 2012 R2 fileserver planned for Q3 upgrade may also present capacity constraints given its age.
