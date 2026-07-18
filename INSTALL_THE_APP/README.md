# INSTALL THE APP

The full-featured way to use the CSF Profile Assessment Database: run the React + Tauri desktop app locally and assess directly inside it. Best when you want the polished UI, live scoring, CSV export, and the built-in assessment workflow.

This is one of three ways to use the CSF Profile Assessment Database:

| Folder | When to use it |
|---|---|
| **`INSTALL_THE_APP/`** *(you are here)* | Run the desktop app locally. Recommended for active assessments. |
| `GET_THE_SPREADSHEETS/` | You just want CSV/Excel artifacts to work in spreadsheets. |
| `GET_THE_NOTION_TEMPLATE/` | You prefer to assess inside Notion. Quick-start bundle and import guide. |

## Quick start

See the main [README — Installation and Setup](../README.md#installation-and-setup) for the full walkthrough. Short version:

```bash
# Clone
git clone https://github.com/CPAtoCybersecurity/csf_profile.git
cd csf_profile

# Install dependencies
npm install

# Run the web app
npm start

# Dev (Tauri desktop)
npm run tauri dev

# Production build
npm run tauri build
```

## Requirements

- Node.js 18+
- npm or pnpm

**Desktop builds only** (skip these if you're running the web app with `npm start`):

- Rust toolchain (for Tauri desktop builds — `rustup` recommended)
- Platform tooling: Xcode CLI tools (macOS), build-essential + webkit2gtk (Linux), MSVC + WebView2 (Windows)

Full prerequisites and per-platform notes live in the main [README](../README.md).

## Troubleshooting

If the install or build fails, open an issue at <https://github.com/CPAtoCybersecurity/csf_profile/issues> with your OS, Node version, and the full error output.
