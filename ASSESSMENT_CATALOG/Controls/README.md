# Controls (Implementation Descriptions)

One file per CSF implementation example, organized by function. Each file describes how Alma Security implements a specific implementation example and links to supporting artifacts.

Maturity scores, gaps, and remediation plans belong in [Observations](../Observations/), not here. Controls describe *what is implemented*, observations describe *what was found*.

## Template

```markdown
# {ID}: {Implementation Example Title}

**Subcategory:** {Subcategory ID} — {Subcategory Description}
**NIST SP 800-53 Ref:** {Control references}

## Implementation Example

> {Official NIST implementation example text}

## Alma Security Implementation

{2-4 concise sentences: what the control mechanism is, what tools are used, and the scope.}

## Artifacts

- [{Artifact name}](../../Artifacts/{Type}/{filename}.md)
```

## File Naming

Files are named `{Subcategory-ID}_Ex{N}.md` (e.g., `PR.AA-01_Ex1.md`).

The ID maps directly to the `ID` column in `../../public/tblProfile_Demo.csv` and `../Case_Study/alma-controls.csv`.
