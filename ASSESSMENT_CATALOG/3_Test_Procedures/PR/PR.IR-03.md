# PR.IR-03: Resilience Mechanisms for Normal and Adverse Situations

**CSF Subcategory:** PR.IR-03 - Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

---

## Test Procedures

1. **Review redundancy and failover architecture**
   - Obtain architecture documentation for production systems showing redundancy design
   - Verify multi-AZ deployment configuration for AWS production workloads
   - Confirm Kubernetes pod redundancy with replica sets and anti-affinity rules
   - Review auto-scaling policies and triggers for Kubernetes workloads
   - Validate that single points of failure have been identified and addressed

2. **Assess disaster recovery planning and testing**
   - Obtain the current DR plan documentation (note: DR plan is reported as in development)
   - Review the Cloud Security Optimization project ($100K) scope related to DR capabilities
   - Determine recovery time objectives (RTO) and recovery point objectives (RPO) for critical systems
   - Check whether DR scenarios have been documented and prioritized
   - Verify backup strategy and retention policies for critical data

3. **Evaluate high-availability component implementation**
   - Review Kubernetes cluster configuration for high availability (control plane and worker nodes)
   - Verify database and storage tier redundancy (multi-AZ RDS, replicated storage)
   - Confirm load balancer configuration distributes traffic across healthy instances
   - Check that redundant storage and compute are provisioned for critical systems
   - Review service mesh or service discovery configuration for automatic failover

4. **Test failover capabilities**
   - Obtain results from completed failover testing
   - Review failover test scenarios, success criteria, and outcomes
   - Identify any failures or degraded performance observed during failover testing
   - Verify that failover testing is scheduled to recur on a defined cadence
   - Check whether chaos engineering or fault injection testing is practiced

5. **Review resilience monitoring and incident response integration**
   - Verify health check and readiness probe configuration for Kubernetes workloads
   - Confirm automated recovery actions (pod restart, node replacement) are configured
   - Review how resilience events are escalated to incident response
   - Check SLA/SLO definitions for availability and their measurement

---

## Evidence Requests

- [ ] Production architecture diagrams showing redundancy and failover design
- [ ] AWS multi-AZ deployment configuration evidence
- [ ] Kubernetes deployment manifests showing replica counts and auto-scaling policies
- [ ] Disaster recovery plan (current draft or in-development documentation)
- [ ] Cloud Security Optimization project scope and timeline
- [ ] RTO/RPO definitions for critical systems
- [ ] Failover test results and after-action reports
- [ ] Backup configuration and retention policy documentation
- [ ] SLA/SLO definitions and availability metrics
- [ ] Health check and readiness probe configurations

---

## Notes

Alma Security has demonstrated meaningful investment in resilience through multi-AZ AWS deployment, Kubernetes pod redundancy with auto-scaling, and completed failover testing. These are strong indicators of operational maturity. However, the DR plan is currently in development as part of the Cloud Security Optimization project ($100K), which represents a significant gap. The assessment should distinguish between the strong operational resilience already in place (high-availability components, tested failover) and the strategic resilience gap (incomplete DR planning). The completed failover testing is a positive signal that the organization tests its assumptions rather than relying on architectural promises alone.
