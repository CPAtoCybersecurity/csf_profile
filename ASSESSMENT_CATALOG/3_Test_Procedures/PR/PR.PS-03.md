# PR.PS-03: Hardware Maintenance and Lifecycle Test Procedures

**CSF Subcategory:** PR.PS-03 - Hardware is maintained, replaced, and removed commensurate with risk

---

## Test Procedures

1. **Review hardware lifecycle management policy**
   - Obtain the hardware lifecycle and asset management policy
   - Verify the policy defines requirements for hardware procurement, maintenance, replacement, and disposal
   - Confirm the policy establishes lifecycle timelines based on hardware type and criticality
   - Check that the policy addresses both on-premises and cloud-hosted infrastructure (including reserved instances and dedicated hosts)
   - Verify the policy includes secure disposal and data sanitization requirements

2. **Examine hardware asset inventory and tracking**
   - Obtain the hardware asset inventory or CMDB export
   - Verify the inventory includes servers, networking equipment, workstations, mobile devices, and IoT/OT devices
   - Confirm each hardware asset has a documented owner, location, warranty status, and expected end-of-life date
   - Cross-reference the physical inventory against the asset database for accuracy
   - For cloud infrastructure, verify instance types and reserved capacity are tracked alongside physical assets
   - Check that the inventory is updated when hardware is provisioned, moved, or decommissioned

3. **Validate hardware maintenance and warranty management**
   - Review maintenance schedules and vendor support contracts for critical infrastructure
   - Verify warranty and support coverage for production hardware systems
   - Confirm that hardware failures are tracked in a ticketing system with mean-time-to-repair metrics
   - Check that spare parts or replacement hardware is available for critical systems within defined SLAs
   - Review evidence of preventive maintenance activities (firmware updates, disk health checks, UPS battery tests)

4. **Assess end-of-life hardware tracking and replacement**
   - Obtain a list of hardware approaching or past end-of-life / end-of-support
   - Verify the organization maintains a replacement calendar or roadmap
   - Identify any production hardware running past vendor support dates
   - For unsupported hardware still in production, verify compensating controls and documented risk acceptance
   - Review capital expenditure plans or cloud migration strategies for hardware replacement

5. **Test secure hardware disposal and decommissioning**
   - Review the hardware decommissioning and disposal process
   - Verify data sanitization procedures comply with NIST SP 800-88 or equivalent standard
   - Obtain certificates of destruction or sanitization for recently decommissioned hardware
   - Confirm that decommissioned hardware is removed from the asset inventory and access control systems
   - Verify that leased equipment return processes include data wiping verification

---

## Evidence Requests

- [ ] Hardware lifecycle management policy
- [ ] Hardware asset inventory / CMDB export with warranty and EOL dates
- [ ] Vendor maintenance and support contracts for critical infrastructure
- [ ] Hardware failure and repair tickets (last 6 months)
- [ ] End-of-life hardware tracking report or replacement roadmap
- [ ] Risk acceptance documentation for any unsupported hardware in production
- [ ] Data sanitization procedures and certificates of destruction
- [ ] Capital expenditure plan or cloud migration strategy for hardware refresh
- [ ] Preventive maintenance schedule and completion records

---

## Notes

This test procedure evaluates hardware lifecycle management from procurement through disposal. For organizations with significant cloud infrastructure, the focus shifts from physical hardware maintenance to capacity planning, instance type lifecycle management, and cloud provider deprecation tracking. Hybrid environments require both physical and cloud hardware to be tracked in a unified inventory. Secure disposal is a frequently overlooked area that carries significant data breach risk if not properly managed.
