# ID.AM-01: Hardware-Inventory Test Procedures

**Assessment Scope:** Alma Security 2026 CSF Assessment <br>
**Control:** ID.AM-01 - Inventories of hardware managed by the organization are maintained <br>
**Assessor:** [Your Name]

---

## Inquiry

- [x] **IT Desktop Manager** - Interviewed regarding endpoint inventory processes, refresh cycles, and tracking methods for laptops/workstations
- [x] **IT Infrastructure Manager** - Interviewed regarding server inventory, network device tracking, and data center asset management
- [x] **Cloud Platform Principal Architect** - Interviewed regarding AWS resource inventory, tagging standards, and automated discovery mechanisms

**Sample Interview Questions:**

* How frequently is the hardware inventory updated?
* What triggers an inventory update (new purchases, decommissions, audits)?
* Who owns the asset management process?
* What tagging standards are enforced for cloud resources?
* How do you detect untagged or orphaned resources?

---

## Inspection

### Review Hardware Inventory (On-Premises)

1. Obtain the most recent hardware inventory list from the IT department or asset management system
2. Use network scanning tools (e.g., Nmap) to discover all connected devices on the network
3. Cross-reference the scanned results with the documented inventory
4. Document any discrepancies (devices on network not in inventory, inventory items not found on network)
5. **Sampling:** Select 5 assets from the inventory at random. For each sampled asset:
    * Verify the device exists at the documented location
    * Confirm serial number matches inventory record
    * Validate owner/custodian information is current
    * Check that asset tag is physically present on device

**Evidence to Collect:**

* Hardware Inventory Spreadsheet
* Nmap scan results
* Reconciliation report
* Sampling walkthrough documentation (5 assets inspected)

### Review AWS Tagging Completeness

1. Access AWS Config and review the `required-tags` rule compliance status
2. Verify the following minimum tags are enforced across EC2, RDS, S3, and Lambda resources:
    * `Environment` (prod / staging / dev / test)
    * `Owner` (team or individual responsible)
    * `Application` (system/service the resource supports)
    * `Name` (resource identifier)
3. Pull list of non-compliant resources missing required tags
4. Validate tag values are meaningful (not garbage data like "test" or "asdf")
5. Cross-reference Cost Explorer to identify untagged spend

**Evidence to Collect:**

* AWS Config Rules dashboard screenshot
* Non-compliant resources export
* Cost Explorer tag coverage report

#### Why Cloud Inventory is Different:
Cloud environments have a built-in advantage for inventory - the pay-per-use model means organizations *have* to track what's running or the bill gets ugly. AWS Config, tagging policies, and Cost Explorer become your inventory validation tools instead of Nmap.

## Linked Artifacts
* [Alma Security Hardware Inventory](https://github.com/greetingsog/csf_profile/blob/greetingsog-patch-1/Sample_Artifacts/Hardware_Inventory_Sample.md)
* [Network Discovery Scan Results](https://github.com/greetingsog/csf_profile/blob/greetingsog-patch-1/Sample_Artifacts/Nmap_Scan_Results.md)
* [AWS Tag Compliance Report](https://github.com/greetingsog/csf_profile/blob/greetingsog-patch-1/Sample_Artifacts/AWS_Tag_Compliance_Report.md)
* [Hardware Inventory Sampling Walkthrough](https://github.com/greetingsog/csf_profile/blob/greetingsog-patch-1/Sample_Artifacts/Sampling_Walkthrough.md)

