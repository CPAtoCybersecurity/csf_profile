# CSF Profile Assessment Database - Screenshots

## Dashboard

The Dashboard provides visual analytics including:
- **Function Scores by Quarter** - Pivot table showing Actual, Target, and Variance scores for each CSF function
- **Function Actual vs Target** - Bar chart comparing actual scores against targets with gap visualization
- **CSF Subcategories** - Radar chart and detailed subcategory breakdown

![Dashboard](public/screenshots/Dashboard.png)
![Dashboard](public/screenshots/Darkmode_Dashboard.png)
---

## Requirements & Implementation Descriptions

The Requirements page is the primary interface for managing CSF assessment data. Features include:
- Sortable and filterable table of all implementation examples
- Quick status indicators for In Scope and completion status
- Import/Export CSV functionality
- Detailed side panel for viewing and editing individual items

![Requirements Overview](public/screenshots/Darkmode_Requirements.png)

---

## Assessment Observations

A dedicated view for reviewing all documented observations across the assessment. Filter by quarter to see observation dates, auditors, and detailed notes.

![Requirements Detail Panel](public/screenshots/Assessment.png)

![Requirements Detail Panel](public/screenshots/Observations.png)

---

## Encrypted Exports (Optional Password Protection)

Some exports support optional password protection. When you choose to encrypt an export, the app prompts you for a password and downloads an encrypted file with an `.enc.csv` suffix. This is intended for secure storage/backup and will not open directly in Excel or a text editor until it is decrypted.

![Encrypted Export Password Dialog](public/screenshots/Encrypted_Export_Password_Dialog.png)

---
## Scoring Legend (Reference Tab)

The Scoring Legend provides guidance for evaluating security controls using the scoring system from Mastering Cyber Resilience by AKYLADE. Color-coded rows indicate security posture: yellow for "Some Security," green for "Just Right," and red for insufficient or excessive security.

![Scoring Legend](public/screenshots/References.png)

---

## Evidence

The Evidence page manages audit artifacts that support assessment findings. Features include:
- Artifact ID, Name, and Description
- External links to evidence documents
- Linked Subcategory IDs for "test once, assure many" efficiency
- Import/Export functionality

![Evidence](public/screenshots/Darkmode_Artifacts.png)

---

## Remediation Plans

Track remediation activities for controls that need improvement:
- Remediation Owner assignment
- Due dates for completion
- Detailed action plans

![Remediation Plans](public/screenshots/Remediation_Plans.png)

---

## User Management

Manage users involved in the assessment process:
- Add new users with Name, Title, and Email
- Import/Export user lists via CSV
- Users can be assigned as Owners, Stakeholders, Auditors, or Remediation Owners

![User Management](public/screenshots/User_Management.png)
