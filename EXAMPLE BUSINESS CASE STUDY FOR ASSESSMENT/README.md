# Alma Security - Example Business Case Study for Assessment

This folder contains supplementary materials for the **Alma Security** fictional business case study. These materials are designed for students and practitioners to practice NIST CSF 2.0 control assessments using realistic organizational context.

## About Alma Security

Alma Security is a fictional biometric authentication company whose mission is "to ensure businesses can continuously authenticate their users using their whole selves." The case study materials provide a comprehensive organizational context including:

- Company background and mission
- Security team structure and roles
- Technology environment (AWS, Kubernetes, on-premises infrastructure)
- Risk register and security initiatives
- Key Performance Indicators (KPIs) and goals

## Contents

### CSV Data Files

These CSV files contain the default data that is pre-loaded into the CSF Profile Assessment Database:

| File | Description |
|------|-------------|
| `alma_controls.csv` | 38 control implementations with descriptions, owners, and stakeholders |
| `alma_assessments.csv` | Complete Q1 assessment observations with quarterly tracking support |

**Importing into the Tool:**
1. Navigate to **Settings** in the application
2. Use the **Import Controls CSV** or **Import Assessments CSV** options
3. Select the corresponding CSV file

### Supporting Documents

Additional case study materials (Word documents and spreadsheets) provide organizational context including:

- Business background and organizational structure
- Security policies and procedures
- Risk register and strategic goals
- Technology environment details

## Using This Case Study

1. **Review the Context**: Read through the supporting documents to understand Alma Security's business, technology environment, and security posture

2. **Explore Pre-loaded Data**: The CSF Profile tool comes pre-loaded with Alma Security's controls and Q1 assessment data

3. **Practice Assessments**:
   - Use Q2, Q3, and Q4 tabs to practice additional assessment periods
   - Create new assessments with different scope
   - Add your own test procedures and observations

4. **Export/Import Workflow**: Practice the import/export workflow using these CSV files as templates

## Data Structure

### Controls CSV Columns
- Control ID, Implementation Description
- Control Owner, Stakeholders
- Linked Requirements, Created Date, Last Modified

### Assessments CSV Columns
- ID, Assessment Name, Scope Type
- Auditor, Test Procedures
- Quarterly data (Q1-Q4): Actual Score, Target Score, Observations, Date, Status, Examine/Interview/Test methods
- Remediation: Owner, Action Plan, Due Date

## License

This case study is provided for educational purposes as part of the CSF Profile Assessment Database project.
