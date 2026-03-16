# PR.DS-02: Data-in-Transit Protection Test Procedures

**CSF Subcategory:** PR.DS-02 - The confidentiality, integrity, and availability of data-in-transit are protected

---

## Test Procedures

1. **Review data-in-transit encryption policy and standards**
   - Obtain the organization's network encryption policy and transport security standards
   - Verify policy mandates TLS 1.2 or higher for all data in transit
   - Confirm policy addresses VPN requirements for remote access and site-to-site connectivity
   - Validate that policy covers internal service-to-service communication (east-west traffic)
   - Check alignment with NIST SP 800-53 SC-08, SC-12, SC-13, SC-23

2. **Assess TLS configuration and enforcement**
   - Inventory all externally-facing endpoints and services
   - Verify TLS 1.2+ is enforced on all public-facing load balancers and ingress controllers
   - Check that TLS 1.0 and 1.1 are disabled across all services
   - Validate certificate management practices (CA-signed, expiration monitoring, auto-renewal)
   - Test cipher suite configuration for strong algorithms (no RC4, 3DES, or weak ciphers)
   - Confirm HSTS headers are enabled on web applications
   - Sample 5-10 endpoints with SSL Labs or equivalent scanner

3. **Evaluate internal service communication encryption**
   - Review Kubernetes service mesh or network policy for pod-to-pod encryption
   - Verify mutual TLS (mTLS) configuration for internal microservices
   - Test database connection encryption (PostgreSQL SSL mode = require/verify-full)
   - Confirm API gateway enforces TLS for backend service communication
   - Check that internal AWS traffic uses encrypted channels (VPC endpoints, PrivateLink)

4. **Test VPN and remote access encryption**
   - Review VPN configuration for remote employee access
   - Verify VPN uses strong encryption protocols (IKEv2, WireGuard, or OpenVPN with AES-256)
   - Confirm split tunneling policies align with security requirements
   - Test that corporate resources are only accessible through encrypted channels
   - Validate certificate-based or MFA-based VPN authentication

5. **Validate unencrypted connection blocking**
   - Test network security groups and firewall rules for plaintext protocol blocking (HTTP, FTP, Telnet)
   - Verify HTTP-to-HTTPS redirect is enforced on all web properties
   - Confirm S3 bucket policies enforce ssl:true condition on all API calls
   - Check that database connections reject non-SSL connections
   - Review monitoring and alerting for unencrypted connection attempts

---

## Evidence Requests

- [ ] Network encryption policy and transport security standards
- [ ] TLS configuration documentation for externally-facing services
- [ ] SSL/TLS scan results for public endpoints (SSL Labs or equivalent)
- [ ] Certificate inventory and management procedures
- [ ] Kubernetes network policy or service mesh configuration
- [ ] VPN configuration and encryption settings
- [ ] S3 bucket policies enforcing encryption in transit
- [ ] PostgreSQL SSL configuration settings
- [ ] Firewall rules demonstrating plaintext protocol blocking
- [ ] HSTS configuration evidence for web applications

---

## Notes

This test procedure validates Alma Security's protection of data in transit across its hybrid environment. Given that continuous authentication is Alma's core SaaS product, the integrity and confidentiality of authentication data flowing between clients and the platform is business-critical. Assessors should pay particular attention to east-west traffic encryption within the Kubernetes cluster, as microservice architectures can have significant internal API traffic that may not be encrypted by default. The AWS multi-AZ deployment adds complexity around cross-AZ traffic encryption that should be verified.
