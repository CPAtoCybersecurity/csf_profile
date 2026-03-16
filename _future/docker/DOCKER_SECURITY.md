# Docker Security Hardening Guide

> Contributed by [@bad-antics](https://github.com/bad-antics)

This guide provides comprehensive Docker security hardening for production deployments of the CSF Profile Assessment Tool.

## Table of Contents

- [Image Security](#image-security)
- [Hardened Dockerfile](#hardened-dockerfile)
- [Secure docker-compose.yml](#secure-docker-composeyml)
- [Runtime Security Commands](#runtime-security-commands)
- [CI/CD Image Scanning](#cicd-image-scanning)
- [Production Checklist](#production-checklist)

---

## Image Security

- **Use minimal base images** (alpine, distroless)
- **Scan images** with trivy or grype
- **Never use `:latest` tag** - pin specific versions
- **Multi-stage builds** to reduce attack surface

---

## Hardened Dockerfile

```dockerfile
# Use specific digest for reproducibility
FROM node:20-alpine@sha256:xxx AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Multi-stage for smaller attack surface
FROM node:20-alpine@sha256:xxx AS runtime

# Security: Non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy only necessary files
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

# Drop all capabilities, add only needed
USER appuser

# Security headers
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Secure docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed for port <1024
    read_only: true
    tmpfs:
      - /tmp
    user: "1001:1001"

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

    # Network isolation
    networks:
      - frontend
      - backend

    # No privileged access
    privileged: false

    # Logging limits
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  frontend:
    driver: bridge
  backend:
    internal: true  # No external access
```

---

## Runtime Security Commands

Run containers with restricted permissions:

```bash
docker run --rm \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  --read-only \
  --tmpfs /tmp \
  --user 1001:1001 \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  csf-profile:latest
```

---

## CI/CD Image Scanning

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/security.yml
name: Container Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t csf-profile:${{ github.sha }} .

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'csf-profile:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

---

## Production Checklist

| Security Control | Status |
|-----------------|--------|
| Non-root user | Required |
| Read-only filesystem | Required |
| Drop all capabilities | Required |
| Resource limits (CPU/memory) | Required |
| Network isolation | Required |
| No privileged mode | Required |
| Health checks | Recommended |
| Pinned image versions | Required |
| Multi-stage builds | Recommended |
| Regular image scanning | Required |
| PID limits | Recommended |
| Logging limits | Recommended |

---

## Additional Resources

- [Docker Bench Security](https://github.com/docker/docker-bench-security) - Audit tool
- [Trivy](https://github.com/aquasecurity/trivy) - Vulnerability scanner
- [Grype](https://github.com/anchore/grype) - Alternative scanner
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker) - Industry standard

---

Defense in depth for containers!
