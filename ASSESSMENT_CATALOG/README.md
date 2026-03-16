# Assessment Catalog

Comprehensive NIST CSF 2.0 assessment reference materials for the **Alma Security** case study. This catalog provides test procedures, control implementation descriptions, observations, and evidence artifacts across all 6 CSF functions, 22 categories, and 106 subcategories.

## Structure

```
Assessment_Catalog/
├── 1_Case_Study/          Alma Security business context, financials, and master data
├── 3_Test_Procedures/     How to assess each subcategory (1 file per subcategory)
│   └── {GV,ID,PR,DE,RS,RC}/
├── 2_Controls/            Control implementation descriptions (1 file per implementation example)
│   └── {GV,ID,PR,DE,RS,RC}/
├── 4_Observations/        Assessment findings per subcategory per quarter
│   └── {GV,ID,PR,DE,RS,RC}/
└── 5_Artifacts/           Evidence documents organized by type
    ├── Policies/        POL-  Governance and policy documents
    ├── Procedures/      PROC- Operational procedures
    ├── Reports/         RPT-  Scan results, compliance reports
    ├── Inventories/     INV-  Asset and system inventories
    ├── Tickets/         TKT-  Incident and change tickets
    └── Evidence/        EVD-  Other supporting evidence
```

## Coverage Target

| Function | Subcategories | Implementation Examples |
|----------|--------------|----------------------|
| GOVERN (GV) | 31 | 118 |
| IDENTIFY (ID) | 21 | 74 |
| PROTECT (PR) | 22 | 77 |
| DETECT (DE) | 11 | 37 |
| RESPOND (RS) | 13 | 38 |
| RECOVER (RC) | 8 | 18 |
| **Total** | **106** | **362** |

## File Naming Conventions

| Content Type | Pattern | Example |
|---|---|---|
| Test Procedures | `{Subcategory-ID}.md` | `PR.AA-01.md` |
| Controls | `{Subcategory-ID}_Ex{N}.md` | `PR.AA-01_Ex1.md` |
| Observations | `{Subcategory-ID}-Q{N}.md` | `PR.AA-01-Q1.md` |
| Artifacts | `{TYPE}-{description}.md` | `POL-access-management.md` |

CSF IDs use **official NIST dot notation** (e.g., `PR.AA-01`, not `PR-AA-01`).

## How to Contribute

1. Pick a subcategory that needs coverage (check the function subdirectory for gaps)
2. Use the template in the relevant README (each content type has its own)
3. Ground all content in the [Alma Security case study](1_Case_Study/)
4. Reference NIST SP 800-53 Rev 5 and SP 800-171 mappings where applicable
5. Submit a PR with your additions

## Related

- [CSF Profile App](../src/) — React application for interactive assessment
- [CSF Taxonomy Data](../public/tblProfile_Demo.csv) — Complete 362 implementation examples
- [Cross-Framework Mappings](../src/data/csfMappings.js) — CSF to ISO 27001 / SP 800-53
