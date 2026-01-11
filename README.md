> **You are viewing the `feature/api-integration` branch (Pre-Alpha)**
> This branch contains experimental Atlassian API integration. For the stable version, see the [main branch](https://github.com/CPAtoCybersecurity/csf_profile).

# Simply Cyber Academy - CSF Profile Assessment Database v2.1

A tool designed to help organizations implement and assess their cybersecurity posture using the NIST Cybersecurity Framework (CSF). This application provides a structured approach to:

* Track and manage CSF outcomes
* Assign ownership and stakeholders to controls
* Document observations and findings
* Score current and desired security states
* Export to csv for data visualization in Excel (find a companion Excel template in public/Sample_Artifacts)
* Track remediation progress

The is an open source project, and improvement ideas to drive cyber risk reduction with CSF assessments are welcome from the Simply Cyber and other awesome communities.

![Simply Cyber Academy Logo](public/SC_SimplyCyberAcademy_color.png)

Find in depth videos for CSF profile assessments and this tool in Simply Cyber Academy here: [https://academy.simplycyber.io/p/accrp](https://academy.simplycyber.io/p/accrp)

**[View Screenshots](SCREENSHOTS.md)** - See the application in action

**[View Explainer Slides](public/screenshots/CSF-Profile-Assessment-Explainer-Slides.pdf)** - Learn how CSF Profile assessments work

<img src="public/as_seen_on_nist.jpeg" alt="As Seen on NIST" width="340">

## Disclaimer

This software is provided under the MIT License. [https://github.com/CPAtoCybersecurity/csf_profile/blob/main/LICENSE](https://github.com/CPAtoCybersecurity/csf_profile/blob/main/LICENSE)

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

As a demonstration of how to conduct CSF profile assessment, fictional company "Alma Security" is used, inspired by Daniel Miessler's open source Telos project here: [https://github.com/danielmiessler/Telos/blob/main/corporate_telos.md](https://github.com/danielmiessler/Telos/blob/main/corporate_telos.md)

## Installation and Setup

### Walkthrough:

[![CSF Profile Assessment Tool Demo](https://img.youtube.com/vi/xWo9owjk75c/0.jpg)](https://youtu.be/xWo9owjk75c)

### Installation:

[![Video Title](https://img.youtube.com/vi/h206z7wIYqY/0.jpg)](https://youtu.be/h206z7wIYqY)

### Prerequisites by Operating System

#### macOS

macOS typically comes with Git pre-installed. You only need to install Node.js:

1. Download and install Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Verify installation by opening Terminal and running:

   ```
   node --version
   npm --version
   ```

#### Windows

1. **Install Git first**: Download and install Git from [git-scm.com](https://git-scm.com/download/win)

   * During installation, you can accept the default options
2. **Install Node.js**: Download the MSI installer from [nodejs.org](https://nodejs.org/) (LTS version recommended)

   * Run the MSI installer and follow the prompts
3. **Open PowerShell** to run the installation commands below

   * Press `Win + X` and select "Windows PowerShell" or search for "PowerShell" in the Start menu

#### Kali Linux / Debian-based Linux

1. Update your package manager and install Node.js:

   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   ```

### Installation Steps

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

### Environment Variables Configuration (Optional)

The application supports integration with JIRA and Confluence for enhanced tracking capabilities. To enable these integrations, you'll need to configure environment variables with your API credentials.

#### Setting Up Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** and add your credentials:
   - `REACT_APP_JIRA_INSTANCE_URL` - Your JIRA instance URL (e.g., https://your-domain.atlassian.net)
   - `REACT_APP_JIRA_API_TOKEN` - Your JIRA API token
   - `REACT_APP_CONFLUENCE_INSTANCE_URL` - Your Confluence URL (e.g., https://your-domain.atlassian.net/wiki)
   - `REACT_APP_CONFLUENCE_API_TOKEN` - Your Confluence API token

3. **Generate API tokens** at: https://id.atlassian.com/manage-profile/security/api-tokens

#### Windows-Specific Instructions

For local development on Windows, you can set environment variables using PowerShell or Command Prompt:

**Using PowerShell:**
```powershell
# Set environment variables for current session
$env:REACT_APP_JIRA_INSTANCE_URL="https://your-domain.atlassian.net"
$env:REACT_APP_JIRA_API_TOKEN="your-jira-token"
$env:REACT_APP_CONFLUENCE_INSTANCE_URL="https://your-domain.atlassian.net/wiki"
$env:REACT_APP_CONFLUENCE_API_TOKEN="your-confluence-token"

# Then start the app
npm start
```

**Using Command Prompt:**
```cmd
set REACT_APP_JIRA_INSTANCE_URL=https://your-domain.atlassian.net
set REACT_APP_JIRA_API_TOKEN=your-jira-token
set REACT_APP_CONFLUENCE_INSTANCE_URL=https://your-domain.atlassian.net/wiki
set REACT_APP_CONFLUENCE_API_TOKEN=your-confluence-token
npm start
```

**Recommended: Using a `.env` file (All platforms)**

The easiest approach for all platforms is to use a `.env` file in the project root:

1. Copy `.env.example` to `.env`
2. Edit `.env` and fill in your values
3. The `.env` file is automatically excluded from version control
4. Run `npm start` as normal

**Important Security Notes:**
- Never commit your `.env` file to version control
- Never share your API tokens publicly
- Rotate tokens periodically for security
- The `.env` file is already listed in `.gitignore` to prevent accidental commits

### Troubleshooting (Kali Linux)

If you encounter issues with `react-scripts` not installing correctly on Kali Linux:

1. **Delete node_modules and reinstall:**

   ```bash
   cd csf_profile
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **If issues persist**, try installing with the `--legacy-peer-deps` flag:

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Verify react-scripts is installed:**

   ```bash
   ls node_modules/.bin/ | grep react-scripts
   ```

## Confluence Cloud Integration

This application supports fetching control documentation from **Confluence Cloud** using a secure backend integration.

### Required Environment Variables

Set the following environment variables in your backend `.env` file:

```env
CONFLUENCE_BASE_URL=https://your-company.atlassian.net
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_API_TOKEN=your-api-token
```
## Integration Options

This project supports two paths depending on your infrastructure needs:

### Standard Path (Main Branch)
File-based exports for users without backend infrastructure:
- **CSV Export**: Import into Excel, Google Sheets, or any spreadsheet tool
- **JSON Export**: Import into Jira via Jira Importers plugin, or use with other tools
- **No backend required** - runs entirely in the browser

### Advanced Path (feature/api-integration Branch) - *Pre-Alpha*
> **Status**: In active development. Not recommended for production use.

Real-time API integration for teams with infrastructure support:
- **Jira Cloud API**: Create issues directly from assessment findings
- **Confluence Cloud API**: Link control documentation and sync content
- **Requires backend service** for OAuth/token handling

See the [feature/api-integration branch](https://github.com/CPAtoCybersecurity/csf_profile/tree/feature/api-integration) for development progress.

## Contributors

Thank you to our amazing contributors! See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list.

## Features

### CSV Import and Export

#### Export CSV

The Export CSV function allows you to:

* Export your entire assessment database to a CSV file
* Include all control details, observations, scores, and action plans
* Generate date-stamped files for version control
* Add it to the companion Excel template for reporting

To export your data, click the "Export CSV" button in the controls view. The file will be automatically downloaded with a filename that includes the current date.

#### Import CSV

The Import CSV function allows you to:

* Import assessment data from a CSV file
* Update your assessment with data from external sources
* Restore from a previous export
* Collaborate by sharing and merging assessment files

**Important Note:** Importing a CSV will overwrite all data currently in the database. Make sure to export your current data first if you want to preserve it. CSV files are particularly useful for creating charts and visualizations in Excel or other spreadsheet applications.

## Navigation

The application includes several key sections:

* **Subcategories**: View and manage all CSF controls
* **Dashboard**: Visualize assessment data and progress
* **Scoring**: Reference the scoring legend and methodology
* **Artifacts**: Audit artifacts with links, to map to CSF subcategories for "test once - assure many" efficiencies
* **User Management**: Manage users involved in the assessment

## Scoring System

The tool uses a scoring system from 0-10 to assess the current and desired state of each control. It comes from the Mastering Cyber Resilience textbook by AKYLADE.

* **0-1.9**: Insecurity - Organization rarely or never implements this control
* **2.0-4.9**: Some Security - Organization sometimes implements this control, but unreliably
* **5.0-5.9**: Minimally Acceptable Security - Organization consistently implements this control with minor flaws
* **6.1-6.9**: Optimized Security - Organization consistently implements this control with great effectiveness
* **7.0-7.9**: Fully Optimized Security - Organization implements this control with fully optimized effectiveness
* **8.1-10.0**: Too Much Security - Organization implements this control at excessive financial cost

## Jira / Confluence Setup and Configuration

### Proof-of-Concept (Free Tier)

1. **Obtain API Tokens**

   * Jira Cloud: [https://id.atlassian.com/manage/api-tokens](https://id.atlassian.com/manage/api-tokens)
   * Confluence Cloud: same token can be used
2. **Required Permissions**

   * Jira: Browse Projects, Edit Issues, Create Issues
   * Confluence: View and Add Content, Edit Pages
3. **Environment Variables (.env)**

```
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
```

### Production Setup (Company Instances)

1. **Service Account** with minimum required permissions
2. Store API tokens securely (do not commit to repo)
3. Set environment variables on server

### Optional: EntraID / SSO Integration

* Configure SSO in Jira/Confluence if company uses Microsoft EntraID

### Common API Troubleshooting

* `401 Unauthorized`: Invalid token or email mismatch
* `403 Forbidden`: Missing permissions
* `Invalid URL`: Ensure `/wiki` path is included for Confluence
* `Rate Limits`: Reduce request frequency or batch requests
