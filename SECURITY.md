# Security Policy

## Supported Versions

We aim to provide security updates for the latest version of CSF Profile Assessment Database.

We recommend always using the latest version for security fixes and improvements.

## Reporting Security Vulnerabilities

Please **DO NOT** report security vulnerabilities through public GitHub issues.

### Preferred Reporting Method

Send security reports directly to: **info@cpatocybersecurity.com**

### What to Include

Please provide the following information:

- **Vulnerability Type**: What kind of security issue (e.g., XSS, injection, data exposure, etc.)
- **Affected Components**: Which parts of the application are affected
- **Impact Assessment**: What could an attacker accomplish
- **Reproduction Steps**: Clear steps to reproduce the vulnerability
- **Proposed Fix**: If you have suggestions for remediation
- **Disclosure Timeline**: Your preferred timeline for public disclosure

### Example Report Format

```
Subject: [SECURITY] Brief description of vulnerability

Vulnerability Type: Cross-Site Scripting (XSS)
Affected Component: Control observation input field
Impact: Potential script execution in user's browser
Severity: High

Reproduction Steps:
1. Navigate to...
2. Enter payload: ...
3. Observe...

Evidence:
[Screenshots, logs, or proof of concept]

Suggested Fix:
Sanitize input using DOMPurify before rendering...
```

## Security Considerations

### Data Storage

- All assessment data is stored locally in the browser (IndexedDB/localStorage)
- No data is transmitted to external servers by default
- Users are responsible for securing their local machines
- Exported CSV files may contain sensitive assessment data

### Input Validation

- User inputs are sanitized using DOMPurify before rendering
- CSV imports are validated before processing
- Markdown content is safely rendered to prevent XSS

### Assessment Data Protection

- Assessment data may contain sensitive organizational security information
- Control observations and findings could reveal vulnerabilities
- Action plans may reference confidential remediation strategies
- Score data indicates organizational security posture

**Recommendation**: Treat all exported data as confidential and apply appropriate access controls.

### Browser Security

- Application runs entirely client-side
- No authentication required (single-user local application)
- Browser security policies apply
- Local storage accessible only from the same origin

## Vulnerability Response Process

1. **Report Received**: We'll acknowledge receipt within 48 hours
2. **Initial Assessment**: We'll evaluate severity and impact within 72 hours
3. **Investigation**: We'll investigate and develop fixes
4. **Fix Development**: We'll create and test patches
5. **Coordinated Disclosure**: We'll work with reporter on disclosure timeline
6. **Release**: We'll release patched version with security advisory

### Timeline Expectations

| Severity | Target Resolution |
|----------|-------------------|
| Critical | 1-7 days |
| High | 7-30 days |
| Medium | 30-90 days |
| Low | Next scheduled release |

## Bug Bounty

We don't currently offer a formal bug bounty program, but we deeply appreciate security research and will:

- Acknowledge contributors in release notes
- Provide credit in security advisories

## Security Best Practices for Users

### Installation

- Clone/download only from the official [GitHub repository](https://github.com/CPAtoCybersecurity/csf_profile)
- Keep your installation up to date
- Verify you're using the latest release

### Configuration

- Run the application in a secure browser environment
- Keep your browser updated
- Be cautious when importing CSV files from untrusted sources

### Data Handling

- Regularly back up your assessment data via CSV export
- Store exported files securely with appropriate access controls
- Do not share assessment exports containing sensitive findings publicly
- Clear browser data when assessments are complete if using shared machines

### Network Considerations

- The application runs locally and doesn't require network access
- If deploying to a server, ensure proper authentication and HTTPS
- Consider network segmentation if hosting assessment data centrally

## Known Security Limitations

### Client-Side Storage

- Browser storage is not encrypted at rest by default
- Anyone with physical access to the machine can access stored data
- Browser developer tools can inspect stored assessment data

**Mitigation**: Use full-disk encryption and secure your workstation.

### CSV Import/Export

- Imported CSV files could contain malicious formulas (CSV injection)
- Exported data is unencrypted plain text

**Mitigation**: Only import CSV files from trusted sources. Handle exports as confidential documents.

### No Authentication

- The application has no built-in user authentication
- All users of the same browser profile share the same data

**Mitigation**: Use separate browser profiles or machines for different assessments.

## Security Updates

Security updates are distributed through:

- GitHub Releases with security tags
- Security advisories on GitHub
- README and documentation updates

**Subscribe** to the repository to receive notifications about security updates.

## Contact

- For **non-security issues**: Use [GitHub Issues](https://github.com/CPAtoCybersecurity/csf_profile/issues)
- For **security concerns**: Email the security contact directly (do not use public issues)

We take security seriously and appreciate the community's help in keeping CSF Profile Assessment Database secure for cybersecurity professionals.
