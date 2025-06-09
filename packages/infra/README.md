# Infrastructure Overview

This directory contains infrastructure-as-code (IaC) for deploying and managing cloud resources, primarily using Terraform. It is organized by cloud provider and deployment target:

## Structure

- **aws/**: Main focus, with extensive modules and environment management.
- **azure/**: Present but currently empty (future support planned).
- **kubernetes/**: Contains manifests and configs for Kubernetes resources, including ArgoCD and NGINX ingress.

---

## AWS Infrastructure (`aws/`)

### Structure

- **global/**: Shared/global resources (VPC, EKS, ArgoCD, ECR, etc.)
- **environments/**: Per-environment (prod, qa, etc.) state and configuration.
- **bootstrap/**: Scripts and state for initial setup.
- **modules/**: Reusable Terraform modules (EKS, VPC, RDS, KMS, ECR, application).

### Key Features

- **Terraform Backend**: Uses S3 and DynamoDB for remote state and locking.
- **Global Modules**:
  - **VPC**: Networking setup for the whole platform.
  - **EKS**: Managed Kubernetes cluster, with node groups and versioning.
  - **ArgoCD**: GitOps deployment tool, installed via Helm.
  - **ECR**: Private and public container registries for backend, workers, and base images.
  - **Application Module**: Tagging and grouping for global resources.
- **EKS Module**:
  - Provisions cluster and node groups.
  - Installs AWS Load Balancer Controller via Helm.
  - Sets up IAM roles and policies for Kubernetes controllers.
  - Supports external DNS, OIDC, and certificate management.
- **RDS, KMS, ECR, Application Modules**: Modularized for reuse and separation of concerns.
- **Bootstrap**: Contains scripts and state for initial infrastructure setup.

---

## Kubernetes (`kubernetes/`)

- **argocd/**: Contains `ingresses.yaml` for ArgoCD ingress setup.
- **nginx-ingress/aws/**: Contains `albs.yaml` for AWS ALB integration with NGINX ingress.
- **default/**: Present but currently empty.

---

## Azure (`azure/`)

- Present but currently empty, indicating future plans for Azure support.


## Azure (`gcloud/`)

- Present but currently empty, indicating future plans for Google Cloud support.

---

## Changelog / What Has Been Done

- **[NEW]** Modularized AWS infrastructure using Terraform, with clear separation for global, environment, and bootstrap resources.
- **[NEW]** Implemented reusable modules for EKS, VPC, RDS, KMS, ECR, and application tagging.
- **[NEW]** Provisioned EKS cluster with managed node groups, IAM roles, and policies.
- **[NEW]** Automated installation of ArgoCD and AWS Load Balancer Controller via Helm.
- **[NEW]** Set up ECR repositories for backend, workers, and base images, including public ECR pull-through cache.
- **[NEW]** Added Kubernetes manifests for ArgoCD and NGINX ingress with AWS ALB integration.
- **[NEW]** Established remote state management using S3 and DynamoDB.
- **[PLANNED]** Placeholder for Azure infrastructure (no resources yet).
- **[PLANNED]** Configuring the ArgoCD deployment.
- **[PLANNED]** Adding helm charts for applications, workers and other services.
- **[PLANNED]** Setting up database and redis instances in Kubernetes for dev, stage environments.
- **[PLANNED]** Setting up a database instance and redis as a managed service for the production environment.
- **[PLANNED]** Adding a CI process (image build and push to repository) using github actions - for each cloud provider (AWS and Azure planned at the moment).

---

## Libraries/tools used:

1. **terraform** - 1.12.1
2. **aws cli** - 2.27.21