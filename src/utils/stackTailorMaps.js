/**
 * Canned substitution maps for deterministic stack-aware tailoring.
 *
 * The community bank is written against the case study's fictional stack:
 * AWS + SentinelOne EDR + O365 email + Slack. These tables let the app
 * re-aim tool and platform references at the organization's ACTUAL stack
 * purely by string substitution — no AI, no API key, fully offline.
 *
 * Authorship rules (see procedureTailor.js for the engine):
 *  - Service names map to their real analog on the target platform, never
 *    a bare vendor swap ("GCP GuardDuty" is not a thing).
 *  - Longest phrase wins: the engine compiles these longest-first so the
 *    bare "AWS" fallback never fires inside "AWS Security Hub".
 *  - Matching is case-sensitive and word-bounded, so evidence file paths
 *    (EVD-aws-*.md) and identifiers pass through untouched.
 *  - Replacements are canonical dictionary strings only — profile free
 *    text is used for DETECTION, never inserted into procedure bodies.
 *  - On-prem gets capability-language neutralization, not fake console
 *    steps: managed-cloud primitives have no 1:1 on-prem analog.
 */

/**
 * Cloud term map. Each entry: [phrase, { gcp, azure, onprem }].
 * A null target means "keep the phrase as-is for that platform"
 * (e.g., GCP also calls them VPC Flow Logs).
 * Order here is documentation; the engine sorts longest-first anyway.
 */
export const CLOUD_TERMS = [
  // Audit logging
  ['AWS CloudTrail', { gcp: 'Cloud Audit Logging', azure: 'Azure Activity Log', onprem: 'central audit logging' }],
  ['CloudTrail', { gcp: 'Cloud Audit Logging', azure: 'Azure Activity Log', onprem: 'central audit logging' }],

  // Threat detection / findings. The combined phrase keeps the common
  // "GuardDuty findings report from AWS Security Hub" sentence from
  // collapsing into a double "Security Command Center". The article
  // variant keeps "a GuardDuty finding" grammatical on-prem.
  ['GuardDuty findings report from AWS Security Hub', { gcp: 'Security Command Center findings report', azure: 'Microsoft Defender for Cloud findings report', onprem: 'threat-detection findings report' }],
  ['a GuardDuty', { gcp: null, azure: null, onprem: 'a threat-detection' }],
  ['Amazon GuardDuty', { gcp: 'Security Command Center', azure: 'Microsoft Defender for Cloud', onprem: 'threat-detection tooling' }],
  ['AWS GuardDuty', { gcp: 'Security Command Center', azure: 'Microsoft Defender for Cloud', onprem: 'threat-detection tooling' }],
  ['GuardDuty', { gcp: 'Security Command Center', azure: 'Microsoft Defender for Cloud', onprem: 'threat-detection tooling' }],
  ['AWS Security Hub', { gcp: 'Security Command Center', azure: 'Microsoft Defender for Cloud', onprem: 'security-findings tooling' }],

  // Configuration compliance
  ['AWS Config rules', { gcp: 'Security Health Analytics detectors', azure: 'Azure Policy definitions', onprem: 'configuration-baseline rules' }],
  ['AWS Config Compliance', { gcp: 'Security Health Analytics Compliance', azure: 'Azure Policy Compliance', onprem: 'Configuration-Baseline Compliance' }],
  ['AWS Config compliance', { gcp: 'Security Health Analytics compliance', azure: 'Azure Policy compliance', onprem: 'configuration-baseline compliance' }],
  ['AWS Config', { gcp: 'Security Health Analytics', azure: 'Azure Policy', onprem: 'configuration-baseline scanning' }],

  // Network
  ['AWS VPC Flow Logs', { gcp: 'VPC Flow Logs', azure: 'NSG flow logs', onprem: 'network flow logs' }],
  ['VPC Flow Logs', { gcp: null, azure: 'NSG flow logs', onprem: 'network flow logs' }],
  ['VPC Flow Log', { gcp: null, azure: 'NSG flow log', onprem: 'network flow log' }],
  ['AWS VPC', { gcp: 'VPC networking', azure: 'Azure VNet networking', onprem: 'internal networking' }],
  ['Security Group and Network ACL', { gcp: 'VPC firewall rule and firewall policy', azure: 'NSG and Azure Firewall rule', onprem: 'firewall rule and ACL' }],
  ['VPC security group rules', { gcp: 'VPC firewall rules', azure: 'NSG rules', onprem: 'internal firewall rules' }],
  ['VPC endpoints', { gcp: null, azure: 'private endpoints', onprem: 'internal service endpoints' }],
  ['VPCs', { gcp: null, azure: 'VNets', onprem: 'network segments' }],
  ['VPC', { gcp: null, azure: 'VNet', onprem: 'internal network' }],
  ['security groups', { gcp: 'firewall rules', azure: 'NSGs', onprem: 'internal firewall rules' }],
  ['security group', { gcp: 'firewall rule', azure: 'NSG', onprem: 'internal firewall rule' }],

  // Storage & data
  ['AWS S3 buckets', { gcp: 'Cloud Storage buckets', azure: 'Blob Storage containers', onprem: 'file storage locations' }],
  ['AWS S3 bucket', { gcp: 'Cloud Storage bucket', azure: 'Blob Storage container', onprem: 'file storage location' }],
  ['S3 buckets', { gcp: 'Cloud Storage buckets', azure: 'Blob Storage containers', onprem: 'file storage locations' }],
  ['S3 bucket', { gcp: 'Cloud Storage bucket', azure: 'Blob Storage container', onprem: 'file storage location' }],
  ['AWS S3', { gcp: 'Cloud Storage', azure: 'Azure Blob Storage', onprem: 'file storage' }],
  ['S3', { gcp: 'Cloud Storage', azure: 'Blob Storage', onprem: 'file storage' }],
  ['AWS RDS', { gcp: 'Cloud SQL', azure: 'Azure SQL Database', onprem: 'database servers' }],
  ['RDS', { gcp: 'Cloud SQL', azure: 'Azure SQL Database', onprem: 'database servers' }],
  ['AWS KMS', { gcp: 'Cloud KMS', azure: 'Azure Key Vault', onprem: 'enterprise key management' }],
  ['KMS', { gcp: null, azure: 'Key Vault', onprem: 'key-management system' }],

  // Compute
  ['EC2', { gcp: 'Compute Engine', azure: 'Azure Virtual Machines', onprem: 'virtual machine' }],
  ['EKS', { gcp: 'GKE', azure: 'AKS', onprem: 'Kubernetes' }],
  ['Lambda', { gcp: 'Cloud Functions', azure: 'Azure Functions', onprem: 'scheduled automation jobs' }],
  ['Amazon Linux 2', { gcp: 'Container-Optimized OS', azure: 'Azure-hardened base images', onprem: 'hardened base images' }],

  // Monitoring & operations. The article variants keep "a CloudWatch Logs
  // Insights query" / "an Athena query" grammatical after the swap.
  ['a CloudWatch Logs Insights query', { gcp: 'a Cloud Logging query', azure: 'a Log Analytics query', onprem: 'a monitoring-stack log query' }],
  ['CloudWatch', { gcp: 'Cloud Monitoring', azure: 'Azure Monitor', onprem: 'monitoring tooling' }],
  ['AWS Systems Manager', { gcp: 'VM Manager', azure: 'Azure Automation', onprem: 'endpoint-management tooling' }],
  ['Systems Manager', { gcp: 'VM Manager', azure: 'Azure Automation', onprem: 'endpoint-management tooling' }],
  ['AWS Inspector', { gcp: 'Security Command Center vulnerability scanning', azure: 'Microsoft Defender vulnerability assessment', onprem: 'vulnerability scanning' }],
  ['an Athena query', { gcp: 'a BigQuery query', azure: 'a Log Analytics query', onprem: 'a log-tooling query' }],
  ['Athena', { gcp: 'BigQuery', azure: 'Log Analytics', onprem: 'log-query tooling' }],
  ['AWS Shield', { gcp: 'Cloud Armor DDoS protection', azure: 'Azure DDoS Protection', onprem: 'upstream DDoS protection' }],
  ['AWS WAF', { gcp: 'Cloud Armor', azure: 'Azure WAF', onprem: 'WAF appliance' }],
  ['CloudFront', { gcp: 'Cloud CDN', azure: 'Azure Front Door', onprem: 'CDN' }],
  ['Route 53', { gcp: 'Cloud DNS', azure: 'Azure DNS', onprem: 'DNS infrastructure' }],
  ['SNS notification', { gcp: 'Cloud Monitoring notification', azure: 'Azure Monitor action-group', onprem: 'alert notification' }],
  ['SNS', { gcp: 'Pub/Sub', azure: 'Azure Monitor alerting', onprem: 'alerting pipeline' }],

  // Governance, identity, account structure
  ['AWS Organizations', { gcp: 'Google Cloud organization hierarchy', azure: 'Azure management groups', onprem: 'environment inventory' }],
  ['AWS accounts', { gcp: 'Google Cloud projects', azure: 'Azure subscriptions', onprem: 'internal environments' }],
  ['AWS account', { gcp: 'Google Cloud project', azure: 'Azure subscription', onprem: 'internal environment' }],
  ['AWS multi-AZ', { gcp: 'Google Cloud multi-zone', azure: 'Azure zone-redundant', onprem: 'multi-site' }],
  ['an AWS-centric', { gcp: 'a Google Cloud-centric', azure: 'an Azure-centric', onprem: 'an infrastructure-dependent' }],
  ["AWS's", { gcp: "Google Cloud's", azure: "Azure's", onprem: "the hosting provider's" }],
  ['AWS IAM', { gcp: 'Cloud IAM', azure: 'Microsoft Entra ID', onprem: 'Active Directory' }],
  ['AWS Marketplace', { gcp: 'Google Cloud Marketplace', azure: 'Azure Marketplace', onprem: 'software procurement records' }],
  ['AWS SOC 2 Type II reports', { gcp: "Google Cloud's SOC 2 Type II reports", azure: "Azure's SOC 2 Type II reports", onprem: "the hosting provider's SOC 2 Type II reports" }],
  ['AWS SOC 2 Type II report', { gcp: "Google Cloud's SOC 2 Type II report", azure: "Azure's SOC 2 Type II report", onprem: "the hosting provider's SOC 2 Type II report" }],
  ['AWS Security Bulletins', { gcp: 'Google Cloud security bulletins', azure: 'MSRC security advisories', onprem: 'vendor security bulletins' }],
  ['AWS service health dashboard', { gcp: 'Google Cloud Service Health dashboard', azure: 'Azure Service Health dashboard', onprem: 'vendor status pages' }],
  ['AWS shared responsibility', { gcp: 'Google Cloud shared responsibility', azure: 'Azure shared responsibility', onprem: 'provider shared-responsibility' }],
  ['AWS resource tags', { gcp: 'Google Cloud resource labels', azure: 'Azure resource tags', onprem: 'asset inventory tags' }],
  ['AWS resource tag', { gcp: 'Google Cloud resource label', azure: 'Azure resource tag', onprem: 'asset inventory tag' }],
  ['AWS Tagging Completeness', { gcp: 'Google Cloud Label Completeness', azure: 'Azure Tag Completeness', onprem: 'Asset Tag Completeness' }],
  ['AWS Tag Compliance Report', { gcp: 'Google Cloud Label Compliance Report', azure: 'Azure Tag Compliance Report', onprem: 'Asset Tag Compliance Report' }],
  ['AWS tags', { gcp: 'Google Cloud labels', azure: 'Azure tags', onprem: 'asset tags' }],

  // Vendor-noun fallbacks — the engine's longest-first ordering guarantees
  // every service-specific phrase above has already been consumed.
  ['Amazon', { gcp: 'Google', azure: 'Microsoft', onprem: 'the vendor' }],
  ['AWS', { gcp: 'Google Cloud', azure: 'Azure', onprem: 'on-premises' }]
];

/**
 * Known EDR products. `detect` strings are matched case-insensitively
 * against the profile's securityTools/infrastructure entries; `name` is
 * the canonical string inserted into procedures. An entry whose chip also
 * matches `exclude` does not count — that's how "Microsoft Defender for
 * Cloud" (CSPM) and "Cortex XSOAR" (SOAR) avoid triggering an EDR swap.
 * "sentinel" alone is deliberately absent — "Microsoft Sentinel" is a
 * SIEM, not an EDR — and "elastic" requires an endpoint-flavored name so
 * an "Elastic SIEM" chip never re-brands the EDR.
 */
export const EDR_PRODUCTS = [
  { name: 'CrowdStrike Falcon', detect: ['crowdstrike', 'falcon'] },
  { name: 'Microsoft Defender for Endpoint', detect: ['defender'], exclude: ['defender for cloud'] },
  { name: 'Cortex XDR', detect: ['cortex'], exclude: ['xsoar'] },
  { name: 'Carbon Black', detect: ['carbon black', 'carbonblack'] },
  { name: 'Elastic Defend', detect: ['elastic defend', 'elastic security', 'elastic agent', 'elastic edr'] },
  { name: 'Sophos Intercept X', detect: ['sophos'] },
  { name: 'Trend Vision One', detect: ['trend micro', 'trend vision', 'vision one'] },
  { name: 'Huntress', detect: ['huntress'] },
  { name: 'Cybereason', detect: ['cybereason'] },
  { name: 'Tanium', detect: ['tanium'] }
];

/**
 * O365 → Google Workspace terms, applied only on an explicit Google
 * Workspace / Gmail signal with no Microsoft-stack signal.
 */
export const GOOGLE_EMAIL_TERMS = [
  ['O365 Advanced Threat Protection', 'Google Workspace email protection'],
  ['O365 ATP', 'Google Workspace email protection'],
  ['O365-protected email', 'Google Workspace-protected email'],
  ['Microsoft Threat Intelligence', 'Google threat intelligence'],
  ['Microsoft 365', 'Google Workspace'],
  ['Office 365', 'Google Workspace'],
  ['M365', 'Google Workspace'],
  ['O365', 'Google Workspace'],
  ['Advanced Threat Protection', 'advanced email protection'],
  ['ATP', 'email protection']
];
