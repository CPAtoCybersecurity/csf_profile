# PR.PS-06: Secure Software Development Practices Test Procedures

**CSF Subcategory:** PR.PS-06 - Secure software development practices are integrated, and their performance is monitored

---

## Test Procedures

1. **Review secure development lifecycle (SDLC) policy and standards**
   - Obtain the organization's secure software development lifecycle policy or standards documentation
   - Verify the policy defines security requirements for each phase of development (design, implementation, testing, deployment, maintenance)
   - Confirm the policy addresses secure coding standards, threat modeling, and security architecture review
   - Check that the policy applies to all software developed in-house and customizations to third-party software
   - Verify the policy establishes roles and responsibilities for security within the development process

2. **Examine security integration in the CI/CD pipeline**
   - Review the CI/CD pipeline configuration and tooling (e.g., GitHub Actions, Jenkins, GitLab CI)
   - Verify that automated security testing is integrated into the pipeline (SAST, DAST, dependency scanning, container image scanning)
   - Confirm that security scan failures block deployment to production (enforced quality gates)
   - Check that developers receive actionable security findings within their development workflow
   - Verify that pipeline configurations are version-controlled and changes require review
   - Review scan tool configurations to ensure they cover OWASP Top 10 and relevant vulnerability categories

3. **Validate third-party component and dependency management**
   - Verify the organization maintains a software bill of materials (SBOM) or dependency inventory
   - Confirm automated dependency scanning identifies known vulnerabilities in third-party libraries
   - Check that dependency updates are tracked and applied within risk-based timelines
   - Verify container base images are scanned for vulnerabilities before deployment
   - Review the process for evaluating and approving new third-party dependencies
   - Confirm that software composition analysis (SCA) covers all active repositories

4. **Assess developer security training and awareness**
   - Review developer security training requirements and completion records
   - Verify training covers secure coding practices relevant to the organization's technology stack
   - Confirm training addresses common vulnerability classes (injection, authentication flaws, access control, cryptographic misuse)
   - Check that training is updated to reflect new vulnerability patterns and lessons learned from internal security findings
   - Verify that security champions or advocates are designated within development teams

5. **Test security review and code review practices**
   - Review code review policies and confirm security is a review criterion
   - Verify that security-sensitive code changes require review by a security-qualified reviewer
   - Examine sample pull requests for evidence of security-focused review comments
   - Confirm that threat modeling or security architecture review is conducted for significant features or system changes
   - Check that security review findings are tracked to resolution

6. **Validate vulnerability remediation in developed software**
   - Review the process for triaging and remediating vulnerabilities discovered in internally developed software
   - Verify SLA definitions for vulnerability remediation based on severity
   - Obtain metrics on vulnerability remediation timelines for the past 6 months
   - Confirm that remediated vulnerabilities are verified through retesting
   - Check that lessons learned from vulnerabilities are fed back into developer training and secure coding standards

---

## Evidence Requests

- [ ] Secure SDLC policy or standards documentation
- [ ] CI/CD pipeline configuration showing security scan integration
- [ ] SAST, DAST, and dependency scanning tool configurations
- [ ] Security quality gate configuration (build-breaking rules)
- [ ] Software bill of materials (SBOM) or dependency inventory
- [ ] Container image scanning results (recent examples)
- [ ] Developer security training program and completion records
- [ ] Code review policy with security review requirements
- [ ] Sample pull requests showing security review (5-10 examples)
- [ ] Vulnerability remediation metrics and SLA compliance reports
- [ ] Threat modeling documentation for recent features or system changes

---

## Notes

This test procedure assesses the maturity of security integration across the software development lifecycle. Organizations early in their secure SDLC journey often have some automated scanning but lack formalized processes for threat modeling, security architecture review, and systematic vulnerability remediation. The presence of automated scanning tools alone does not indicate maturity; assessors should look for evidence that findings are actioned, quality gates are enforced, and security practices evolve based on lessons learned. Container and microservice architectures require additional focus on image security and dependency management at the orchestration layer.
