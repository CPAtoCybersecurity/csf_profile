# Simply Cyber Academy - CSF Profile Assessment Database v1.0

![As Seen on NIST](public/as_seen_on_nist.jpeg)

A tool designed to help organizations implement and assess their cybersecurity posture using the NIST Cybersecurity Framework (CSF). This application provides a structured approach to:
- Track and manage CSF outcomes
- Assign ownership and stakeholders to controls
- Document observations and findings
- Score current and desired security states
- Export to csv for data visualization in Excel (find a companion Excel template in public/Sample_Artifacts)
- Track remediation progress

The is an open source project, and improvement ideas to drive cyber risk reduction with CSF assessments are welcome from the Simply Cyber and other awesome communities. 

![Simply Cyber Academy Logo](public/SC_SimplyCyberAcademy_color.png)

Find in depth videos for CSF profile assessments and this tool in Simply Cyber Academy here: https://academy.simplycyber.io/p/accrp

**[View Screenshots](SCREENSHOTS.md)** - See the application in action

## Disclaimer

This software is provided under the MIT License. https://github.com/CPAtoCybersecurity/csf_profile/blob/main/LICENSE

By using this tool, you agree to the following:

```
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
```
The CSF Profile Assessment Database is intended for educational and informational purposes only. While efforts have been made to ensure accuracy and functionality, this tool does not guarantee compliance with any regulatory requirements or complete protection against cybersecurity threats. Users implement this software at their own risk.

The creator and contributors of this project cannot be held liable for any damages, data loss, or security incidents that may occur through the use of this tool. Organizations should verify all assessment findings independently and consult with qualified cybersecurity professionals when making security decisions.

By downloading, installing, or using this tool, you acknowledge that you understand these risks and accept full responsibility for any outcomes resulting from its use.

## Credit

This tool is based on the NIST Cybersecurity Framework (CSF), developed by the National Institute of Standards and Technology. The framework and implementation examples that make up the basis of this assessment are sourced from [NIST.gov](https://www.nist.gov/cyberframework). We acknowledge and appreciate NIST's work in creating this valuable resource for improving cybersecurity risk management.

As a demonstration of how to conduct CSF profile assessment, fictional company "Alma Security" is used, inspired by Daniel Miessler's open source Telos project here: https://github.com/danielmiessler/Telos/blob/main/corporate_telos.md

## Installation and Setup

[![CSF Profile Assessment Tool Demo](https://img.youtube.com/vi/xWo9owjk75c/0.jpg)](https://youtu.be/xWo9owjk75c)
[![Video Title](https://img.youtube.com/vi/h206z7wIYqY/0.jpg)](https://youtu.be/h206z7wIYqY)

Follow these steps to get the CSF Profile Assessment Database up and running:

1. **Clone the repository**
   ```
   git clone https://github.com/CPAtoCybersecurity/csf_profile
   cd csf_profile
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
- Add it to the companion Excel template for reporting

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
- **Artifacts**: Audit artifacts with links, to map to CSF subcategories for "test once - assure many" efficiencies
- **User Management**: Manage users involved in the assessment

## Scoring System

The tool uses a scoring system from 0-10 to assess the current and desired state of each control. It comes from the Mastering Cyber Resilience textbook by AKYLADE.

- **0-1.9**: Insecurity - Organization rarely or never implements this control
- **2.0-4.9**: Some Security - Organization sometimes implements this control, but unreliably
- **5.0-5.9**: Minimally Acceptable Security - Organization consistently implements this control with minor flaws
- **6.1-6.9**: Optimized Security - Organization consistently implements this control with great effectiveness
- **7.0-7.9**: Fully Optimized Security - Organization implements this control with fully optimized effectiveness
- **8.1-10.0**: Too Much Security - Organization implements this control at excessive financial cost

