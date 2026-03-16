# PR.DS-02: Data-in-Transit Protection -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed TLS configuration on AWS ALBs, HSTS headers on web properties, service mesh mTLS settings, VPN configuration, S3 bucket policies enforcing SecureTransport, and PostgreSQL SSL settings. |
| Interview | Yes | Interviewed Tigan Wang on infrastructure TLS enforcement and VPN architecture, Chris Magann on encryption policy standards and compliance monitoring. |
| Test | Yes | Conducted SSL Labs scan on 8 public-facing endpoints (all scored A or A+), verified PostgreSQL SSL mode enforce, tested HTTP-to-HTTPS redirect on all web properties, validated S3 SecureTransport condition on sample buckets. |

---

## Findings

### Strengths

- TLS 1.2 minimum is enforced across all externally-facing services, with TLS 1.3 enabled where supported
- HSTS headers deployed on all web properties with max-age of one year and includeSubDomains
- SSL Labs scan results show A or A+ ratings across all tested public endpoints with no deprecated cipher suites
- Internal service mesh provides mutual TLS (mTLS) for pod-to-pod communication within Kubernetes
- PostgreSQL connections enforce SSL mode "verify-full" requiring both encryption and certificate verification
- VPN uses IKEv2 with AES-256 encryption and certificate-based authentication for remote access
- Site-to-site VPN with IPsec encryption connects AWS to on-premises Redwood City environment
- HTTP-to-HTTPS redirects confirmed operational on all web properties
- AWS Config rules detect non-compliant TLS configurations with 48-hour remediation SLA

### Gaps

- TLS 1.3 is not yet the default on all endpoints; some load balancers still use TLS 1.2-minimum policies
- No automated TLS certificate expiration monitoring beyond ACM auto-renewal (third-party certificates may lack monitoring)
- VPN split tunnel exceptions are not fully documented with business justifications
- Automated SSL scanning does not cover internal-only service mesh endpoints
- On-premises Windows DC transport encryption policy is not formally documented separately from the general encryption standard
- Development and staging environments may allow plaintext connections for debugging purposes without documented exception tracking
- S3 SecureTransport condition not yet applied to all buckets (in progress via S3 Bucket Security project)

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

---

## Evidence Reviewed

- AWS ALB TLS security policy configuration (ELBSecurityPolicy-TLS13-1-2-2021-06)
- SSL Labs scan results for 8 public-facing endpoints (all A or A+ grade)
- HSTS header configuration from web application response headers
- Kubernetes service mesh mTLS configuration documentation
- PostgreSQL RDS parameter group showing rds.force_ssl = 1
- VPN configuration documentation (IKEv2, AES-256, certificate-based auth)
- AWS Config rule evaluation results for TLS compliance
- S3 bucket policy samples showing SecureTransport enforcement
- ACM certificate inventory with auto-renewal status
- Transport encryption standard document

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Upgrade all ALB security policies to TLS 1.3 default where client compatibility allows | Medium | Tigan Wang |
| 2 | Deploy certificate expiration monitoring with 30/14/7-day alerting for all certificates (including non-ACM) | Medium | Tigan Wang |
| 3 | Audit and document all VPN split tunnel exceptions with business justification | Medium | Chris Magann |
| 4 | Extend automated TLS scanning to internal service mesh endpoints | Medium | Tigan Wang |
| 5 | Complete S3 SecureTransport condition rollout to all buckets | High | Chris Magann |
| 6 | Enforce encrypted-only policy in dev/staging environments with documented exceptions | Low | Chris Magann |
| 7 | Document on-premises transport encryption standards explicitly for Windows DC environment | Low | Chris Magann |
