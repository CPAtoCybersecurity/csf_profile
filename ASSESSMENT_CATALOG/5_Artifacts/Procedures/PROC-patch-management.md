# Patch Management Procedure

| Field | Value |
|-------|-------|
| **Procedure ID** | ALMA-SOP-2025-008 |
| **Version** | 1.3 |
| **Effective Date** | March 1, 2025 |
| **Last Reviewed** | February 16, 2026 |
| **Procedure Owner** | Chris Magann, Vulnerability Management |
| **Approved By** | CISO |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This procedure defines the operational process for identifying, prioritizing, testing, and deploying patches to Alma Security infrastructure. It ensures that vulnerabilities are remediated within defined SLAs based on severity and asset criticality.

---

## 2. Scope

| Environment | Patching Tool | Responsibility |
|-------------|--------------|----------------|
| AWS EC2 instances | AWS Systems Manager Patch Manager | IT Infrastructure (Tigan Wang) |
| Kubernetes nodes | Rolling node replacement (Karpenter) | IT Infrastructure (Tigan Wang) |
| Container images | Base image rebuild (GitLab CI) | Engineering + IT Infrastructure |
| Endpoints (Windows/Mac) | SentinelOne + OS native update | Desktop Support |
| On-premises servers | WSUS (Windows); manual (Linux) | IT Infrastructure |
| Application dependencies | Developer-initiated (npm, pip) | Engineering teams |

---

## 3. Vulnerability Scanning

### 3.1 Scan Schedule

| Asset Category | Scan Frequency | Tool |
|----------------|----------------|------|
| Crown jewel systems (auth engine, biometric processing, customer DB) | Daily | AWS Inspector + SentinelOne |
| Production infrastructure | Weekly | AWS Inspector + SentinelOne |
| Staging/development | Weekly | AWS Inspector |
| Container images | On build + weekly registry scan | Amazon ECR scanning |
| Endpoints | Continuous (agent-based) | SentinelOne |

### 3.2 Scan Output Processing

1. Scan results are automatically ingested into a consolidated vulnerability tracking system
2. Vulnerabilities are deduplicated and correlated across scanners
3. Findings are enriched with asset criticality from the crown jewel designations
4. Remediation tickets are auto-generated in Jira for new findings

---

## 4. Prioritization

### 4.1 Severity Classification

Vulnerabilities are prioritized using a combination of CVSS score and asset criticality:

| CVSS Score | Asset: Crown Jewel | Asset: Production | Asset: Non-Production |
|------------|--------------------|--------------------|----------------------|
| 9.0-10.0 (Critical) | Emergency | Critical | High |
| 7.0-8.9 (High) | Critical | High | Medium |
| 4.0-6.9 (Medium) | High | Medium | Low |
| 0.1-3.9 (Low) | Medium | Low | Scheduled |

### 4.2 Remediation SLAs

| Priority | Remediation Timeline | Escalation |
|----------|---------------------|------------|
| Emergency | 72 hours | Immediate CISO notification; war room if needed |
| Critical | 14 calendar days | Escalation to CISO at day 10 |
| High | 30 calendar days | Escalation to Security Manager at day 21 |
| Medium | 60 calendar days | Standard tracking |
| Low | 90 calendar days | Standard tracking |
| Scheduled | Next maintenance window | Standard tracking |

---

## 5. Patching Workflow

### Step 1: Assessment (Vulnerability Management, Day 0)

1. Review new scan findings and auto-generated Jira tickets
2. Validate severity classification and adjust if false positive or mitigated by compensating controls
3. Assign remediation owner based on asset ownership
4. For Emergency priority: immediately notify CISO and asset owner; convene war room if exploitation is active

### Step 2: Testing (Asset Owner, Days 1-3 for Emergency; Days 1-7 otherwise)

1. Identify affected systems and potential impact
2. Test patch in staging environment matching production configuration
3. Validate application functionality after patch application
4. Document test results in Jira ticket
5. For crown jewel systems: require secondary tester sign-off

### Step 3: Change Approval (Change Advisory Board or Emergency)

| Priority | Approval Path |
|----------|--------------|
| Emergency | CISO or delegate verbal approval; post-deployment CAB review within 48 hours |
| Critical/High | Standard change request via ServiceNow; CAB approval at next session |
| Medium/Low | Pre-approved standard change (no individual CAB review required) |

### Step 4: Deployment (IT Infrastructure / Engineering)

**AWS Systems Manager Patch Manager (servers):**
1. Create patch baseline targeting approved patches
2. Schedule maintenance window (Tuesday 2:00-6:00 AM PT for production)
3. Deploy to 10% canary group; monitor for 1 hour
4. Deploy to remaining systems in rolling batches
5. Verify patch compliance via Systems Manager compliance dashboard

**Container images:**
1. Update base image Dockerfile with patched packages
2. Trigger GitLab CI pipeline rebuild
3. Push updated image to Amazon ECR
4. Rolling deployment to Kubernetes via standard deployment pipeline
5. Verify new pods are running updated image

**Endpoints:**
1. Push patch via SentinelOne or OS update mechanism
2. Set compliance deadline in endpoint management
3. Non-compliant devices after deadline are flagged for follow-up

### Step 5: Verification (Vulnerability Management, Post-Deployment)

1. Run targeted vulnerability scan against patched systems
2. Confirm vulnerability is no longer detected
3. Update Jira ticket with verification evidence
4. Close ticket

---

## 6. Emergency Patching

For actively exploited zero-day vulnerabilities or Emergency priority findings:

1. CISO or delegate authorizes emergency patching verbally
2. Skip staging test if exploitation risk exceeds testing delay risk (CISO decision)
3. Deploy to crown jewel systems first, then remaining production
4. Post-deployment: submit retrospective change request within 48 hours
5. Conduct post-implementation review within 5 business days

---

## 7. Exceptions and Risk Acceptance

Systems that cannot be patched within SLA require:

- Documented business justification in Jira
- Compensating controls (network segmentation, enhanced monitoring, WAF rules)
- Risk acceptance signed by CISO
- Time-bound remediation plan with target date
- Entry in the security risk register

**Current exceptions:** Windows Server 2012 R2 file server (EOL, migration planned Q3 2026; compensating controls: network segmentation, enhanced monitoring, restricted access).

---

## 8. Reporting

| Report | Frequency | Audience |
|--------|-----------|----------|
| Weekly vulnerability scan summary | Weekly | IT Security team |
| Patch compliance dashboard | Continuous (Systems Manager) | IT Infrastructure |
| Monthly patch compliance report | Monthly | CISO |
| SLA breach report | As needed | CISO |
| Crown jewel patch status | Weekly | CISO |

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Change Management Procedure | ALMA-SOP-2025-009 |
| Vulnerability Scan Summary (weekly) | RPT-vulnerability-scan-summary |
| Risk Register | ALMA-RISK-2026 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2025 | C. Magann | Initial procedure |
| 1.1 | July 1, 2025 | C. Magann | Added container image patching workflow |
| 1.2 | October 1, 2025 | C. Magann | Added crown jewel prioritization matrix |
| 1.3 | February 16, 2026 | C. Magann | Updated EOL exception status; added emergency patching section |

---

*This is a fictional example created for educational purposes.*
