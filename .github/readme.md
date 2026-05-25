# 🚀 DevOps CI Pipeline — Docker Image Build & Push to GitHub Container Registry (GHCR)

> **Day 10 of my DevOps Learning Journey**
> Learning how to build a CI pipeline that automatically builds a Docker image and pushes it to the GitHub Container Registry (GHCR) using GitHub Actions.

---

## 📌 What This Project Covers

This project focuses on building a **Continuous Integration (CI) pipeline** using **GitHub Actions** that:

- Triggers automatically on every push to the `main` branch
- Builds a **Docker image** from a `Dockerfile`
- Authenticates with **GitHub Container Registry (GHCR)**
- Tags and **pushes the image** to `ghcr.io`

---

## 🧠 What I Learned

- How GitHub Actions workflows are structured (triggers, jobs, steps)
- How to authenticate Docker with GHCR using `GITHUB_TOKEN`
- How to tag Docker images properly for GHCR (`ghcr.io/<username>/<image>:<tag>`)
- The difference between **CI** (build + test) and **CD** (deploy)
- How to use `docker/build-push-action` and `docker/login-action` from the Docker GitHub Actions toolkit
- The importance of secrets management in pipelines

---

## 🗂️ Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
├── app/
│   └── main.py             # Sample application (or your app code)
├── Dockerfile              # Docker build instructions
├── .dockerignore           # Files to exclude from Docker build context
└── README.md               # You are here
```

---

## ⚙️ CI Pipeline — GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI — Build & Push Docker Image to GHCR

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    name: Build & Push Image
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write   # Required to push to GHCR

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: 🔐 Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: 🏷️ Extract Docker Metadata (Tags & Labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: 🐳 Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

---

## 🐳 Sample Dockerfile

```dockerfile
# Use official Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy app files
COPY app/ .

# Install dependencies (if any)
# RUN pip install -r requirements.txt

# Run the app
CMD ["python", "main.py"]
```

---

## 📦 How to Pull the Image from GHCR

Once the pipeline runs successfully, your image is available publicly (or privately) on GHCR:

```bash
docker pull ghcr.io/<your-github-username>/<your-repo-name>:latest
```

Replace `<your-github-username>` and `<your-repo-name>` with your actual values.

---

## 🔐 Authentication & Permissions

| Secret | Source | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Auto-injected by GitHub Actions | Authenticate with GHCR |
| `permissions.packages: write` | Set in workflow YAML | Allow pushing packages |

> ✅ No manual secret setup needed — `GITHUB_TOKEN` is automatically available in every GitHub Actions workflow.

---

## 🌊 CI Pipeline Flow

```
Code Push to main
       │
       ▼
GitHub Actions Triggered
       │
       ▼
Checkout Code
       │
       ▼
Login to GHCR (docker/login-action)
       │
       ▼
Extract Image Tags & Labels (docker/metadata-action)
       │
       ▼
Build Docker Image (docker/build-push-action)
       │
       ▼
Push Image to ghcr.io
       │
       ▼
✅ Image Available at ghcr.io/<username>/<repo>:latest
```

---

## 🗺️ Roadmap — What's Coming Next

- [ ] **CD Pipeline** — Auto-deploy the image to an EC2 instance or ECS
- [ ] **Multi-stage Docker builds** for smaller, optimized images
- [ ] **Automated testing** (unit tests) before the build step
- [ ] **Kubernetes (EKS)** — Deploy container to a K8s cluster
- [ ] **Monitoring & Observability** — Prometheus + Grafana dashboards
- [ ] **Terraform Integration** — Provision infrastructure as part of the pipeline
- [ ] **Slack/Email Notifications** on pipeline success or failure

---

## 📚 Resources I Used

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [docker/login-action](https://github.com/docker/login-action)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [docker/metadata-action](https://github.com/docker/metadata-action)

---

## 👨‍💻 Author

Learning DevOps one project at a time. Follow my journey on [LinkedIn](#) as I document each step — from Terraform and AWS infrastructure to CI/CD pipelines and Kubernetes.

---

> ⭐ If this helped you, consider giving the repo a star!