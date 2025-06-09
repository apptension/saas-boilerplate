resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress"
  namespace  = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.10.0" # Use the latest stable version
  create_namespace = true

  set {
    name  = "controller.service.type"
    value = "ClusterIP"
  }
}