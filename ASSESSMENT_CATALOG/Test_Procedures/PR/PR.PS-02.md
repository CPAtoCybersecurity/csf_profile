# PR.PS-02: Software Maintenance and Lifecycle Test Procedures

**CSF Subcategory:** PR.PS-02 - Software is maintained, replaced, and removed commensurate with risk

---

## Test Procedures

1. **Review software lifecycle management policy**
   - Obtain the software maintenance and lifecycle management policy
   - Verify the policy defines requirements for patch management, end-of-life tracking, and software removal
   - Confirm the policy establishes risk-based timelines for patching (critical, high, medium, low)
   - Check that the policy addresses both operating system and application-layer software
   - Verify procurement requirements include software supportability and vendor lifecycle commitments

2. **Examine software asset inventory and tracking**
   - Obtain the organization's software inventory or CMDB export
   - Verify the inventory includes operating systems, middleware, applications, and container images
   - Confirm each software asset has a documented version, owner, and support status
   - Cross-reference the inventory against deployed systems to identify untracked software
   - Check that container image registries are included in the inventory scope

3. **Validate patch management operations**
   - Review the patch management process documentation and tooling (e.g., WSUS, yum/apt automation, container image rebuilds)
   - Obtain patch compliance reports for the most recent 90-day period
   - Verify critical and high-severity patches are applied within defined SLAs
   - Select a sample of 10-15 systems and verify current patch levels
   - Check that patching includes both OS-level and application-level updates
   - Verify container base images are rebuilt when upstream patches are available

4. **Assess end-of-life and unsupported software tracking**
   - Obtain a list of all software with known end-of-life or end-of-support dates
   - Verify the organization maintains a forward-looking calendar of upcoming EOL milestones
   - Identify any currently deployed software that has passed its EOL date
   - For EOL software still in production, verify compensating controls and documented risk acceptance
   - Review migration or replacement plans for software approaching EOL within 12 months

5. **Verify software authenticity and integrity controls**
   - Review processes for verifying software authenticity before deployment (digital signatures, checksums, trusted repositories)
   - Confirm container images are pulled only from approved registries with image signing
   - Verify software procurement processes include vendor security assessment
   - Check that package managers are configured to use only approved and verified sources

6. **Test unauthorized software detection and removal**
   - Review the process for identifying and removing unauthorized or unapproved software
   - Verify application control or software restriction policies are configured to detect unauthorized installations
   - Obtain records of unauthorized software discoveries and resulting remediation actions
   - Confirm that removed software is verified as fully uninstalled including residual configurations

---

## Evidence Requests

- [ ] Software lifecycle management policy
- [ ] Software asset inventory / CMDB export
- [ ] Patch management process documentation
- [ ] Patch compliance reports (last 90 days)
- [ ] Sample patch verification on 10-15 systems
- [ ] End-of-life software tracking report or calendar
- [ ] Risk acceptance documentation for any EOL software in production
- [ ] EOL migration/replacement project plans
- [ ] Software authenticity verification procedures
- [ ] Container image registry policies and signing configuration
- [ ] Unauthorized software detection logs and remediation tickets

---

## Notes

This test procedure covers the complete software lifecycle from procurement through decommissioning. A critical area of focus is the gap between patch management policy and actual compliance rates, particularly for legacy systems. Organizations running end-of-life software must demonstrate compensating controls and active migration plans. Container environments require special attention as traditional patch management approaches may not cover ephemeral workloads effectively.
