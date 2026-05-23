resource "aws_security_group" "frontend_Security_group" {
    name       = "frontend_security_group"
    description = "Security group for frontend instances"

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["10.0.1.0/24"]
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
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["10.0.1.0/24"]
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