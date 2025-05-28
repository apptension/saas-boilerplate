resource "random_password" "master"{
  length           = 25
  special          = true
  override_special = "_!%^"
}

resource "aws_db_subnet_group" "main" {
  name       = "saas-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "saas-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "saas-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name        = "saas-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "main" {
  family = "postgres17"
  name   = "saas-${var.environment}-db-parameter-group"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name        = "saas-${var.environment}-db-parameter-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  identifier             = var.identifier
  engine                 = "postgres"
  engine_version         = "17"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = var.max_allocated_storage
  storage_type           = "gp2"
  storage_encrypted      = var.production_ready

  db_name                = var.database_name
  username               = var.database_username
  password               = random_password.master.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  apply_immediately      = !var.production_ready
  multi_az               = var.production_ready
  skip_final_snapshot    = !var.production_ready
  final_snapshot_identifier = var.production_ready ? "saas-${var.environment}-final-snapshot" : null
  deletion_protection    = var.production_ready

  performance_insights_enabled = var.production_ready

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_secretsmanager_secret" "rds" {
  name = "rds-${var.environment}-credentials-${substr(md5(aws_db_instance.main.id), 0, 8)}"
  description = "RDS credentials and connection info for ${var.environment} database"

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_secretsmanager_secret_version" "rds" {
  secret_id     = aws_secretsmanager_secret.rds.id
  secret_string = jsonencode({
    username = var.database_username
    password = aws_db_instance.main.password
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = var.database_name
  })
}