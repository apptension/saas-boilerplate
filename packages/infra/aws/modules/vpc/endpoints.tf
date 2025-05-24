# Security group for VPC endpoints
# resource "aws_security_group" "vpc_endpoints" {
#   name        = "sb-vpc-endpoints-sg"
#   description = "Security group for VPC endpoints"
#   vpc_id      = aws_vpc.main.id

#   ingress {
#     from_port   = 443
#     to_port     = 443
#     protocol    = "tcp"
#     cidr_blocks = [var.vpc_cidr]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = merge(var.tags, {
#     Name = "sb-vpc-endpoints-sg"
#   })
# }

# S3 Gateway Endpoint
# resource "aws_vpc_endpoint" "s3" {
#   vpc_id            = aws_vpc.main.id
#   service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
#   vpc_endpoint_type = "Gateway"
#   route_table_ids   = [aws_route_table.private.id]

#   tags = merge(var.tags, {
#     Name = "sb-s3-endpoint"
#   })
# }

# ECR API Interface Endpoint
# resource "aws_vpc_endpoint" "ecr_api" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
#   vpc_endpoint_type   = "Interface"
#   subnet_ids          = aws_subnet.private[*].id
#   security_group_ids  = [aws_security_group.vpc_endpoints.id]
#   private_dns_enabled = true

#   tags = merge(var.tags, {
#     Name = "sb-ecr-api-endpoint"
#   })
# }

# ECR DKR Interface Endpoint
# resource "aws_vpc_endpoint" "ecr_dkr" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
#   vpc_endpoint_type   = "Interface"
#   subnet_ids          = aws_subnet.private[*].id
#   security_group_ids  = [aws_security_group.vpc_endpoints.id]
#   private_dns_enabled = true

#   tags = merge(var.tags, {
#     Name = "sb-ecr-dkr-endpoint"
#   })
# }