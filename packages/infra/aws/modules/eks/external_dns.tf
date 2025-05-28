# IAM role for External DNS
resource "aws_iam_role" "external_dns" {
  name = "${var.cluster_name}-external-dns"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Condition = {
          StringEquals = {
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub": "system:serviceaccount:kube-system:external-dns"
            "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud": "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "external_dns" {
  name = "external-dns-policy"
  role = aws_iam_role.external_dns.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets"
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets"
        ]
        Resource = ["*"]
      }
    ]
  })

  depends_on = [aws_route53_zone.main]
}

# resource "kubernetes_service_account" "external_dns" {
#   metadata {
#     name      = "external-dns"
#     namespace = "kube-system"
#     annotations = {
#       "eks.amazonaws.com/role-arn" = aws_iam_role.external_dns.arn
#     }
#   }
# }

# resource "kubernetes_deployment" "external_dns" {
#   metadata {
#     name      = "external-dns"
#     namespace = "kube-system"
#     labels = {
#       app = "external-dns"
#     }
#   }
#   spec {
#     replicas = 1
#     selector {
#       match_labels = {
#         app = "external-dns"
#       }
#     }
#     template {
#       metadata {
#         labels = {
#           app = "external-dns"
#         }
#       }
#       spec {
#         service_account_name = kubernetes_service_account.external_dns.metadata[0].name
#         container {
#           name  = "external-dns"
#           image = "k8s.gcr.io/external-dns/external-dns:v0.13.6"
#           args = [
#             "--source=ingress",
#             "--domain-filter=${var.hosted_zone_name}",
#             "--provider=aws",
#             "--policy=upsert-only",
#             "--registry=txt",
#             "--txt-owner-id=${var.cluster_name}",
#             "--aws-zone-type=public"
#           ]
#           env {
#             name  = "AWS_REGION"
#             value = data.aws_region.current.name
#           }
#         }
#       }
#     }
#   }
#   depends_on = [kubernetes_service_account.external_dns, aws_eks_cluster.main]
# }

resource "helm_release" "external_dns" {
  name       = "external-dns"
  repository = "https://kubernetes-sigs.github.io/external-dns/"
  chart      = "external-dns"
  version    = "1.16.1"
  namespace  = "kube-system"

  set {
    name  = "provider"
    value = "aws"
  }
  set {
    name  = "aws.zoneType"
    value = "public"
  }
  set {
    name  = "aws.region"
    value = data.aws_region.current.name
  }
  set {
    name  = "domainFilters[0]"
    value = var.hosted_zone_name
  }
  set {
    name  = "txtOwnerId"
    value = var.cluster_name
  }
  set {
    name  = "sources[0]"
    value = "ingress"
  }
  set {
    name  = "serviceAccount.create"
    value = "true"
  }
  set {
    name  = "serviceAccount.name"
    value = "external-dns"
  }
  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.external_dns.arn
  }

  depends_on = [aws_iam_role.external_dns]
}
