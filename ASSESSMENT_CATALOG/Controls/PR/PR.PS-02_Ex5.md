# PR.PS-02_Ex5: Enforce Approved-Only Software in Procurement

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), SA-04 (Acquisition Process)

## Implementation Example

> Enforce the use of only approved and vetted software through procurement policies that require security assessment, license validation, and business justification before acquisition.

## Alma Security Implementation

Alma requires new software purchases to go through a ServiceNow workflow with business justification, manager approval, and security review (vendor questionnaire covering SOC 2, encryption, data handling). An approved software catalog in ServiceNow enables self-service provisioning for pre-vetted applications, reviewed semi-annually. Free/open-source developer tools bypass the procurement workflow, and an estimated 15-20% of SaaS tools in use have not been through the formal security review process.

## Artifacts

- [Acceptable Use Policy](../../Artifacts/Policies/POL-acceptable-use.md)
- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
