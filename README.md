# CSF Profile Assessment Tool

A comprehensive tool to manage assessment details, document observations, and track progress during NIST Cybersecurity Framework (CSF) assessments.

## Overview

The CSF Profile Assessment Tool is designed to help organizations implement and assess their cybersecurity posture using the NIST Cybersecurity Framework. This application provides a structured approach to:

- Track and manage CSF controls
- Document observations and findings
- Assign ownership and stakeholders to controls
- Score current and desired security states
- Generate reports and visualize assessment data
- Track remediation progress

## Credit

This tool is based on the NIST Cybersecurity Framework (CSF), developed by the National Institute of Standards and Technology. The framework and implementation examples that make up the basis of this assessment are sourced from [NIST.gov](https://www.nist.gov/cyberframework). We acknowledge and appreciate NIST's work in creating this valuable resource for improving cybersecurity risk management.

## Welcome

Welcome to the CSF Profile Assessment Tool! This application is designed to streamline your cybersecurity assessment process by providing a structured, user-friendly interface for working with the NIST Cybersecurity Framework. Whether you're conducting a full assessment, tracking remediation efforts, or building a target profile, this tool will help you manage the process efficiently.

## Installation and Setup

Follow these steps to get the CSF Profile Assessment Tool up and running:

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd csf-audit-app
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the development server**
   ```
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Features

### CSV Import and Export

#### Export CSV

The Export CSV function allows you to:
- Export your entire assessment database to a CSV file
- Include all control details, observations, scores, and action plans
- Generate date-stamped files for version control
- Create reports that can be shared with stakeholders
- Use the data in Excel for further analysis and charting

To export your data, click the "Export CSV" button in the controls view. The file will be automatically downloaded with a filename that includes the current date.

#### Import CSV

The Import CSV function allows you to:
- Import assessment data from a CSV file
- Update your assessment with data from external sources
- Restore from a previous export
- Collaborate by sharing and merging assessment files

**Important Note:** Importing a CSV will overwrite all data currently in the database. Make sure to export your current data first if you want to preserve it. CSV files are particularly useful for creating charts and visualizations in Excel or other spreadsheet applications.

## Navigation

The application includes several key sections:

- **Subcategories**: View and manage all CSF controls
- **Dashboard**: Visualize assessment data and progress
- **Scoring**: Reference the scoring legend and methodology
- **User Management**: Manage users involved in the assessment

## Scoring System

The tool uses a scoring system from 0-10 to assess the current and desired state of each control:

- **0-1.9**: Insecurity - Organization rarely or never implements this control
- **2.0-4.9**: Some Security - Organization sometimes implements this control, but unreliably
- **5.0-5.9**: Minimally Acceptable Security - Organization consistently implements this control with minor flaws
- **6.1-6.9**: Optimized Security - Organization consistently implements this control with great effectiveness
- **7.0-7.9**: Fully Optimized Security - Organization implements this control with fully optimized effectiveness
- **8.1-10.0**: Too Much Security - Organization implements this control at excessive financial cost

## License

This project is licensed under the terms of the license included in the repository.
