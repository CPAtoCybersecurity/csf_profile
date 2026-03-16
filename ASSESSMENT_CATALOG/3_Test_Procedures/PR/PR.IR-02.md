# PR.IR-02: Environmental Threat Protection

**CSF Subcategory:** PR.IR-02 - The organization's technology assets are protected from environmental threats

---

## Test Procedures

1. **Review physical environmental protection controls at Redwood City data center**
   - Inspect fire suppression system documentation, maintenance records, and last inspection date
   - Verify HVAC monitoring is active with alerting for temperature and humidity thresholds
   - Confirm flood detection and water intrusion sensors are deployed in the data center
   - Review uninterruptible power supply (UPS) configuration and generator backup arrangements
   - Check physical access controls protecting environmental systems from tampering

2. **Assess AWS infrastructure environmental resilience**
   - Verify production workloads are deployed across multiple Availability Zones
   - Confirm that AWS region selection accounts for geographic risk factors
   - Review the shared responsibility model understanding documented by the infrastructure team
   - Validate that critical data is replicated across AZs or regions for environmental disaster scenarios

3. **Evaluate environmental monitoring and alerting**
   - Review HVAC monitoring system dashboards and alert configurations
   - Verify alert escalation paths for environmental anomalies (temperature spikes, humidity changes, water detection)
   - Check whether environmental monitoring data is retained for trend analysis
   - Confirm 24/7 notification capabilities for environmental events at Redwood City
   - Review AWS health monitoring and region-level incident notification procedures

4. **Examine environmental controls maintenance program**
   - Obtain fire suppression system inspection and testing schedule
   - Review HVAC maintenance records and service agreements
   - Verify generator testing schedule and fuel management procedures (if applicable)
   - Confirm UPS battery replacement and testing schedule

---

## Evidence Requests

- [ ] Fire suppression system inspection reports and maintenance records
- [ ] HVAC monitoring system configuration and alerting thresholds
- [ ] Data center environmental monitoring dashboard screenshots
- [ ] UPS and power backup configuration documentation
- [ ] AWS multi-AZ deployment architecture documentation
- [ ] Flood/water detection sensor placement diagrams
- [ ] Environmental incident response procedures
- [ ] Maintenance contracts for environmental systems
- [ ] Generator testing logs (if applicable)

---

## Notes

Alma Security operates a hybrid infrastructure model. The Redwood City on-premises data center has documented fire suppression and HVAC monitoring capabilities, which provides a baseline for environmental threat protection. The AWS multi-AZ architecture inherently provides environmental resilience through geographic distribution of availability zones. The assessment should focus on verifying that on-premises environmental controls are maintained, tested, and monitored continuously, and that the team understands AWS's shared responsibility model for environmental protection at the cloud infrastructure layer.
