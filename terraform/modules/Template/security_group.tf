
# This file defines the security groups for the frontend, backend, and bastion host instances in the infrastructure.

resource "aws_security_group" "frontend_security_group" {
  name        = "frontend_security_group"
  description = "Security group for frontend instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.1.0/24"]
  }

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id[0]]
  }

  ingress {
    description = "allow backend instances to access the instance"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.3.0/24"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "frontend_security_group"
  }

}


# backend server security group configuration


resource "aws_security_group" "backend_security_group" {
  name        = "backend_security_group"
  description = "Security group for backend instances"
  vpc_id      = var.vpc_id

  ingress {
    description = "allow bastion host to access the instance"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.1.0/24"]
  }

  ingress {
    description = "allow frontend instances to access the instance"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.0.2.0/24"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "backend_security_group"
  }

}


# bastion server security group configuration

resource "aws_security_group" "bastion_security_group" {
  name        = "bastion_security_group"
  description = "Security group for bastion host"
  vpc_id      = var.vpc_id

  ingress {
    description = "allow SSH access from anywhere"
    to_port     = 22
    from_port   = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    to_port     = 0
    from_port   = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}