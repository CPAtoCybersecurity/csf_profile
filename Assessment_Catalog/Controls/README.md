# Controls (Implementation Descriptions)

One file per CSF implementation example, organized by function. Each file describes how Alma Security implements a specific implementation example, including current maturity, evidence, and gaps.

## Template

```markdown
# {ID}: {Implementation Example Title}

**Subcategory:** {Subcategory ID} — {Subcategory Description}
**Category:** {Category ID} — {Category Name}
**NIST SP 800-53 Ref:** {Control references}

## Implementation Example

> {Official NIST implementation example text}

## Alma Security Implementation

{Detailed narrative of how Alma Security implements this example.
Reference specific tools, processes, teams, and infrastructure.}

## Control Owner

- **Owner:** {Name and role}
- **Stakeholders:** {Names and roles}

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| {Document/config/log} | {Where to find it} | {Date} |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 | {Score} | {Score} | {Not Started / In Progress / Complete} |

## Gaps & Remediation

{Known gaps between current and target state.}

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| {Gap} | {Impact} | {Plan} | {Owner} | {Date} |
```

## File Naming

Files are named `{Subcategory-ID}_Ex{N}.md` (e.g., `PR.AA-01_Ex1.md`).

The ID maps directly to the `ID` column in `../../public/tblProfile_Demo.csv` and `../Case_Study/alma-controls.csv`.
