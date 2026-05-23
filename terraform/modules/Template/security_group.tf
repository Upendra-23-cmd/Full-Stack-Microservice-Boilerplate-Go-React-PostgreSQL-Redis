resource "aws_security_group" "frontend_Security_group" {
    name       = "frontend_security_group"
    description = "Security group for frontend instances"

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["10.0.1.0/24"]
    }

       ingress {
        description = "allow backend instances to access the instance"
        from_port = 8080
        to_port = 8080
        protocol = "tcp"
        cidr_blocks = ["10.0.3.0/24"]
    }
    egress {
        from_port = 0
        to_port = 0
        protocol = -1
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
      Name = "frontend_security_group"
    }
    
}

resource "aws_security_group" "backend_Security_group" {
    name       = "backend_security_group"
    description = "Security group for backend instances"

    ingress {
        description = "allow bastion host to access the instance"
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["10.0.1.0/24"]
    }

    ingress {
        description = "allow frontend instances to access the instance"
        from_port = 3000
        to_port = 3000
        protocol = "tcp"
        cidr_blocks = ["10.0.2.0/24"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = -1
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
      Name = "backend_security_group"
    }
    
}

resource "aws_security_group" "bastion_security_group" {
    name = "bastion_security_group"
    description = "Security group for bastion host"

    ingress {
        description = "allow SSH access from anywhere"
        to_port = 22
        from_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        to_port = 0
        from_port = 0
        protocol = -1
        cidr_blocks = ["0.0.0.0/0"]
    }
}