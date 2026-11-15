# Contributing to CSF Profile Assessment Database

Thanks for helping. A test procedure is a real contribution, and so is a code fix. A first draft is enough to start the conversation.

| Track | You will | Start |
| --- | --- | --- |
| Test procedures | Write Markdown for one CSF subcategory. No programming. | [Test procedures](#test-procedures) |
| Application code | Fix a bug or add a feature in the React app. | [Set up the app](#set-up-the-app) |

Longer walkthrough, from creating a GitHub account through a merged pull request: [Your First Contribution to the CSF Profile Assessment Database](https://www.cpatocybersecurity.com/p/your-first-contribution-to-the-simply-cyber-csf-profile-assessment-database).

## Claim an issue

Browse open [`good first issue`](https://github.com/CPAtoCybersecurity/csf_profile/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) issues. Each catalog issue covers one CSF category and lists its subcategories. Pick one subcategory.

Comment on the issue and name what you are taking. That comment claims it, so the next person can see it is taken. A claim with no activity for about 30 days is released, and someone else may pick the issue up.

Bug reports, test procedure ideas, and feature ideas each have a template in the issue chooser. Pick the one that fits.

## Test procedures

Catalog test procedures live here:

`ASSESSMENT_CATALOG/3_Test_Procedures/<FUNCTION>/<ID>.md`

`<FUNCTION>` is `GV`, `ID`, `PR`, `DE`, `RS`, or `RC`. `<ID>` is the subcategory id, such as `DE.CM-03`. A full path looks like `ASSESSMENT_CATALOG/3_Test_Procedures/DE/DE.CM-03.md`.

You can edit the file on GitHub and open a pull request. A Markdown-only change can stay on GitHub the whole way.

1. Claim the subcategory on its issue.
2. Read the fictional Alma Security case study in [ASSESSMENT_CATALOG/1_Case_Study/](ASSESSMENT_CATALOG/1_Case_Study/).
3. Add or edit that one subcategory file.
4. Open a pull request that links the issue. One subcategory per pull request is the right size.

### House format

Use the headings in [ASSESSMENT_CATALOG/3_Test_Procedures/README.md](ASSESSMENT_CATALOG/3_Test_Procedures/README.md). A filled-in example is [ASSESSMENT_CATALOG/3_Test_Procedures/DE/DE.CM-03.md](ASSESSMENT_CATALOG/3_Test_Procedures/DE/DE.CM-03.md).

Each procedure includes:

- A title line: `# {Subcategory ID}: {Subcategory Description}`
- Function, category, NIST SP 800-53 references, and implementation example count
- Scope & Applicability
- Continuous Monitoring Indicators
- Test Procedures, with Examine, Interview, and Test tables
- Evidence Requirements
- Pass/Fail Criteria
- Alma Security Context
- Related links to artifacts, controls, and observations

Other welcome catalog work: artifacts, observations, documentation fixes, and the on-ramp guides in [GET_THE_SPREADSHEETS/](GET_THE_SPREADSHEETS/) and [GET_THE_NOTION_TEMPLATE/](GET_THE_NOTION_TEMPLATE/).

### Generated data

The app does not read the catalog Markdown directly. Two scripts regenerate the data:

```bash
node scripts/generate-procedure-bank.mjs
node scripts/generate-comprehensive-assessment.mjs
```

The first writes `src/data/communityProcedures.json`. The second writes `src/stores/comprehensiveAssessmentData.js`. CI runs both with `--check` and fails when those files drift from the catalog.

You can run the scripts and commit the result if you want the checks green. If you forget, that is fine. A maintainer will run them before merge.

## Set up the app

CI uses Node.js 20. Install that version, then:

```bash
git clone https://github.com/YOUR_GITHUB_USER/csf_profile.git
cd csf_profile
npm ci --legacy-peer-deps
npm start
```

`npm ci --legacy-peer-deps` is the install command CI uses. The app opens at [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test -- --watchAll=false
```

That is the same non-interactive command CI runs. `npm test` by itself stays in watch mode.

### Build

```bash
CI=false npm run build
```

That is the build command CI runs. `CI=false` is there because some older files still have eslint warnings. New JavaScript should still be lint-clean.

### Lint

Lint the JavaScript you changed. This is the same eslint invocation CI uses:

```bash
npx eslint --env es2022 --env browser --env node --env jest --max-warnings=0 path/to/your-file.js
```

Catalog wording has a separate check:

```bash
node scripts/coherence-lint.mjs
```

CI also checks that the generated catalog data matches, checks Markdown links, and rejects private data files. Keep real assessment packs out of the repo. [PRIVATE_DATA.md](PRIVATE_DATA.md) explains where those files belong.

App code lives under `src/` (components, pages, hooks, stores, utils). Use a short commit message that says what changed, for example `fix: correct CSV export encoding`.

Keep a pull request to one fix, one feature, or one subcategory. If the idea is large, open an issue first so a maintainer can help you split it.

## After you open a pull request

1. CI runs tests, the build, lint on changed JavaScript, the catalog checks, a Markdown link check, and a guard that blocks private data files.
2. A maintainer reads the pull request and may leave comments. Questions and small change requests are normal.
3. Maintainers are volunteers, so a review can take a little while.
4. When the pull request merges, you are added to the [Contributors](README.md#contributors) list in the README. You can add your own row in that pull request if you prefer.

A draft pull request is a fine way to ask for an early look.

## Other guides

These files already cover their topics. Follow them instead of copying them into a pull request:

- [CSF_Wiki/CONTRIBUTING.md](CSF_Wiki/CONTRIBUTING.md) explains how to add pages to the CSF wiki.
- [SECURITY.md](SECURITY.md) explains how to report a vulnerability. Use the email contact there.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) is the community standard for this project.

Questions are welcome on the issue you are working, or in the [Simply Cyber Discord](https://simplycyber.io/discord).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
