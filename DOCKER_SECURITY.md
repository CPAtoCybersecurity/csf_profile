# 🛡️ CSF Profile: Docker Security & Deployment Report

## 1. Security Hardening Strategy
We have implemented a **Defense-in-Depth** strategy to protect sensitive cybersecurity assessment data and Atlassian API credentials.

* **Non-Root Execution:** All containers run as non-privileged users to prevent container breakout attacks.
    * **Frontend:** Runs as `nginx`.
    * **Backend:** Runs as `node`.
    * **Atlassian Tool:** Runs as a dedicated `atlas-sync` service account.
* **Minimal Attack Surface:** We utilize **Alpine Linux** base images, reducing the image footprint and removing unnecessary binaries (like compilers) that could be used in an exploit.
* **Secret Management:** Usage of `.dockerignore` ensures that local `.env` files and API keys are never "baked" into the image layers.

---

## 2. Technical Architecture

### Multi-Stage Build Process
The project uses a **2-stage build process** to ensure the production image contains zero source code or build tools:
1.  **Build Stage:** Compiles React/Node code and installs development dependencies.
2.  **Production Stage:** Extracts only the compiled assets into a hardened runtime environment.



### Integrated Atlassian Sync (CLI-as-a-Service)
The Atlassian integration is containerized as a "Task Runner" using **Docker Profiles**.
* **Bind-Mount Security:** Uses specific host-to-container mounts for `/exports` and `/output`. This allows users to move assessment data in and out of the "Secure Sandbox" without exposing the rest of the host filesystem.

---

## 3. Network Isolation & Resource Limits
The `docker-compose.yml` acts as a security orchestrator to enforce isolation.

### Network Topology
| Service | Access Level | Mapping |
| :--- | :--- | :--- |
| **csf-frontend** | Public | Port 80 (Host) ↔ Port 80 (Container) |
| **csf-backend** | **Isolated** | No Public Ports. Accessible only via `secure-network`. |
| **atlassian-tool** | **Isolated** | No Public Ports. Outbound only (to Atlassian Cloud). |



### Resource Constraints
To prevent Denial of Service (DoS) through resource exhaustion, the following limits are enforced:
| Service | CPU Limit | Memory Limit |
| :--- | :--- | :--- |
| `csf-frontend` | 0.5 (50%) | 256 MB |
| `csf-backend` | 0.5 (50%) | 512 MB |

---

## 4. Operational Guide

**Step 1: Configuration**

Create a `.env` file in the `atlassian-integration/` directory using the provided `.env.example`.

**Step 2: Deployment**

Start the core Web Application:

```bash
docker compose up -d
```
**Step 3: Running Atlassian Sync Tasks**

Users do not need Node.js installed locally. Use the Docker-containerized scripts:

```bash
# Example: Export to Jira
docker compose --profile tools run --rm atlassian-tool node scripts/export-to-jira.js --file exports/csf-export.json
```

### 5. Validation

```bash

# 1. Verify non-root status (Should return 'node' or 'nginx')
docker exec csf-backend whoami
docker exec csf-frontend whoami

# 2. Verify network isolation (Backend should not be reachable from host)
curl localhost:4000  # Should fail/timeout

```