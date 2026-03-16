# GV.OC-04: Critical Objectives and Services Test Procedures

**CSF Subcategory:** GV.OC-04 - Critical objectives, capabilities, and services that external stakeholders depend on or expect from the organization are understood and communicated

---

## Test Procedures

1. **Review business impact analysis (BIA)**
   - Request current BIA or equivalent criticality assessment
   - Verify continuous authentication platform identified as mission-critical service
   - Confirm recovery time objectives (RTOs) and recovery point objectives (RPOs) documented
   - Check that dependencies are mapped for critical services

2. **Validate critical service identification**
   - Verify customer-facing services are cataloged with criticality ratings
   - Confirm API uptime and authentication service availability targets are defined
   - Check SLA commitments against documented RTOs

3. **Interview engineering leadership on resilience objectives**
   - Ask how critical service requirements inform architecture decisions
   - Verify awareness of customer-facing SLA obligations
   - Confirm disaster recovery planning covers identified critical services

4. **Examine customer communication on service expectations**
   - Review customer-facing status page or trust center
   - Verify incident communication protocols for critical service disruptions
   - Check that service level commitments are documented and measurable

## Evidence Requests

- [ ] Business impact analysis or criticality assessment
- [ ] RTO/RPO documentation for critical services
- [ ] Customer-facing SLA documentation
- [ ] Service catalog with criticality ratings

## Notes

As a continuous authentication provider, Alma's platform availability is directly tied to customer security posture. Downtime in Alma's service could leave customer environments without authentication enforcement.
