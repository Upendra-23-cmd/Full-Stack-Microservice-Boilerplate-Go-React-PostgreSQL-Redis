resource "aws_security_group" "database_security_group" {
  vpc_id      = var.vpc_id
  name        = "database_security_group"
  description = "Security group for RDS database instance"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.3.0/24"]
  }

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.3.0/24"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.1.0/24"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "database_security_group"
  }
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name        = "redis-subnet-group"
  description = "Subnet group for Redis"
  subnet_ids = [
    var.db_subnet_group_name_2[0],
    var.db_subnet_group_name[0]
  ]

  tags = {
    Name = "redis-subnet-group"
  }
}

resource "aws_db_subnet_group" "postgres_subnet_group" {
  name        = "postgres-subnet-group"
  description = "Subnet group for PostgreSQL"
  subnet_ids = [
    var.db_subnet_group_name[0],
    var.db_subnet_group_name_2[0]
  ]

  tags = {
    Name = "postgres-subnet-group"
  }

}