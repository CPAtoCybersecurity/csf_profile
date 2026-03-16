# PR.AA-03: Authentication Controls — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed authentication policy, MFA enrollment report from Windows Authenticator SSO, Active Directory GPO password policy settings, SSH key risk register entry, Palo Alto 802.1X configuration, SentinelOne device compliance report |
| Interview | Yes | Interviewed Nadia Khan on authentication event monitoring and SSH key risk assessment; Chris Magann on MFA rollout timeline and phishing-resistant authentication strategy; Cloud Platform team lead on AWS authentication federation |
| Test | Yes | Verified MFA enforcement by testing SSO login flow for 3 applications; tested AD password policy enforcement against GPO settings; reviewed AWS IAM credential report for long-lived access keys; inspected port 45001 session logs on Palo Alto firewall |

---

## Findings

Alma Security's authentication posture shows significant investment through the MFA Rollout project ($80K) alongside persistent high-risk gaps that require urgent remediation. The Windows Authenticator SSO enforces MFA for cloud application access and VPN connections, with enrollment at approximately 85% of the employee population as of Q1 2026. Testing confirmed MFA enforcement is active: login attempts to 3 sampled applications (ServiceNow, GitHub, AWS Console) all required second-factor authentication. The authentication policy prohibits SMS-based MFA due to SIM-swapping risk, a decision Nadia Khan made based on threat intelligence specific to companies in the authentication SaaS space.

However, the AWS root account for the production environment lacks MFA entirely. This was confirmed through the AWS IAM credential report, which shows the root account has console access enabled with password-only authentication. Gerry acknowledged this finding during the interview and committed to immediate remediation by enabling a hardware security key on the root account, with the physical key to be stored in the office safe. This represents a critical-severity finding given that root account compromise would grant unrestricted control over all AWS resources including the production Kubernetes cluster.

The shared developer SSH key on port 45001 bypasses all MFA controls. Developers authenticating via this key are not required to present a second factor, and the key itself has never been rotated since creation. Palo Alto firewall logs on port 45001 show an average of 12 SSH sessions per day, all originating from internal IP addresses. While the firewall logging provides forensic capability, it does not prevent unauthorized use of the key.

Active Directory password policy enforces 14-character minimum length with complexity requirements, 5-attempt lockout with 30-minute duration, and 90-day password history (12 passwords remembered). NTLMv1 and LM authentication protocols are disabled through GPO. Device authentication on the office network uses 802.1X through the Palo Alto firewall for wired connections, with certificate-based authentication for corporate devices.

Five AWS IAM accounts still use long-lived access keys rather than SSO-federated temporary credentials. The oldest key was created 14 months ago and has never been rotated. These accounts bypass MFA enforcement since access key authentication does not support MFA natively through the CLI.

### Strengths

- MFA enforcement active at 85% enrollment with SMS prohibition policy
- FIDO2 hardware keys deployed for security team members (phishing-resistant MFA)
- AD password policy aligned with CIS Benchmarks (14-char minimum, NTLMv1 disabled)
- 802.1X device authentication operational on office network via Palo Alto
- SentinelOne providing device health attestation across managed endpoints
- Authentication event monitoring operational with SIEM alerting for anomalies

### Gaps

- AWS root account lacks MFA (critical-severity finding)
- Shared developer SSH key on port 45001 bypasses all authentication controls including MFA
- MFA enrollment at 85%, not 100%; 15% of users authenticate with password only
- 5 AWS IAM accounts using long-lived access keys (14 months oldest, no rotation)
- No automated network quarantine for SentinelOne non-compliant devices
- Phishing-resistant MFA (FIDO2) limited to security team; not extended to all privileged users

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 6 |

---

## Evidence Reviewed

- Authentication and password policy documentation
- Windows Authenticator SSO MFA enrollment report (March 2026)
- MFA enforcement test results (3 application login flows)
- Active Directory GPO password policy settings export
- AWS IAM credential report (root account MFA status, access key ages)
- Palo Alto firewall port 45001 SSH session logs (30-day sample)
- SentinelOne device compliance report
- 802.1X configuration on Palo Alto Panorama
- MFA Rollout project Phase 2 status report
- Shared SSH key risk register entry (R-SSH-001)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Enable hardware MFA on AWS root account immediately; store key in office safe | Critical | Gerry |
| 2 | Remediate shared developer SSH key; deploy HashiCorp Vault SSH CA with MFA-backed certificate issuance | Critical | Chris Magann |
| 3 | Complete MFA Phase 2 enrollment to reach 100%; enforce conditional access policy blocking password-only login | High | Chris Magann |
| 4 | Rotate and migrate 5 long-lived AWS IAM access keys to SSO-federated temporary credentials | High | Tigan Wang |
| 5 | Extend FIDO2 hardware key requirement to all IT administrators and engineering leads (Phase 3) | Medium | Chris Magann |
| 6 | Integrate SentinelOne compliance API with Palo Alto for automated network quarantine of unhealthy devices | Medium | Nadia Khan |
