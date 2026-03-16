# Test Procedures

One file per CSF subcategory, organized by function. Each test procedure defines how an assessor verifies that an organization meets the subcategory's requirements across all of its implementation examples.

## Template

```markdown
# {Subcategory ID}: {Subcategory Description}

**Function:** {Function Name} | **Category:** {Category ID} — {Category Name}
**NIST SP 800-53 Ref:** {Control references}
**Implementation Examples:** {N} (Ex1–ExN)

## Scope & Applicability

{What systems, processes, and personnel are in scope for this assessment.}

## Continuous Monitoring Indicators

{Metrics and automated checks that provide ongoing assurance between assessments.
Focus on what can be measured continuously vs. point-in-time only.}

## Test Procedures

### Examine

{Document review steps — what policies, configurations, logs, and records to inspect.}

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | {Step} | {What you expect to find} |

### Interview

{Stakeholder discussions — who to speak with and what to ask.}

| # | Role | Key Questions |
|---|------|---------------|
| I1 | {Role} | {Questions} |

### Test

{Hands-on verification — what to execute and observe.}

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | {Step} | {What constitutes a pass} |

## Evidence Requirements

- [ ] {Artifact 1}
- [ ] {Artifact 2}

## Pass/Fail Criteria

{Clear criteria for determining whether the subcategory is adequately implemented.}

## Alma Security Context

{How this test procedure applies specifically to Alma Security's environment,
referencing their infrastructure, tools, and organizational context.}

## Related

- **Artifacts:** {Links to relevant artifacts in ../5_Artifacts/}
- **Controls:** {Links to implementation descriptions in ../2_Controls/}
- **Observations:** {Links to observation files in ../4_Observations/}
```

## Methodology

Test procedures follow NIST SP 800-53A assessment methodology with three testing methods:

- **Examine**: Review of documentation, configurations, and system artifacts
- **Interview**: Discussions with personnel responsible for implementation
- **Test**: Hands-on verification through execution and observation

Where possible, procedures emphasize **continuous control monitoring** — automated checks and metrics that provide ongoing assurance rather than point-in-time snapshots.

## Coverage Status

Subdirectories contain files for each CSF function. Check each function folder for current coverage vs. the full subcategory list in `../../public/tblProfile_Demo.csv`.
