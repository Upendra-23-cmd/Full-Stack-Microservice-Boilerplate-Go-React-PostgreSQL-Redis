resource "aws_vpc" "main_vpc" {
    cidr_block = var.vpc_cidr_block
    tags = {
        Name = "main_vpc"
    }
}


resource "aws_internet_gateway" "main_igw" {
    vpc_id = aws_vpc.main_vpc.id
    tags = {
        Name = "main_igw"
    }
}


resource "aws_subnet" "bastion_subnet" {
    vpc_id = aws_vpc.main_vpc.id
    cidr_block = "10.0.1.0/24"
    availability_zone = "us-east-1a"
    tags = {
        Name = "main_subnet"
    }
}


resource "aws_subnet" "frontend_private" {
    vpc_id = aws_vpc.main_vpc.id
    cidr_block = "10.0.2.0/24"
    availability_zone = "us-east-1a"
    tags = {
        Name = "frontend_private_subnet"
    }
  
}


resource "aws_subnet" "backend_private" {
    vpc_id = aws_vpc.main_vpc.id
    cidr_block = "10.0.3.0/24"
    availability_zone = "us-east-1b"
    tags = {
        Name = "backend_private_subnet"
    }
}


resource "aws_subnet" "public_load_balancer" {
    vpc_id = aws_vpc.main_vpc.id
    cidr_block = "10.0.4.0/24"
    availability_zone = "us-east-1b"
    tags = {
        Name = "public_load_balancer_subnet"
    }
}


resource "aws_subnet" "database_private_subnet" {
    vpc_id = aws_vpc.main_vpc.id
    cidr_block = "10.0.5.0/24"
    availability_zone = "us-east-1c"
    tags = {
        Name = "database_private_subnet"
    }
}

resource "aws_route_table" "main_route_table" {
    vpc_id = aws_vpc.main_vpc.id
    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.main_igw.id
    }
    tags = {
        Name = "main_route_table"
    }
}

resource "aws_route_table" "frontend_route_table" {
    vpc_id = aws_vpc.main_vpc.id
    tags = {
        Name = "frontend_route_table"
    }
}


resource "aws_route_table" "backend_route_table" {
    vpc_id = aws_vpc.main_vpc.id
    tags = {
        Name = "backend_route_table"
    }
}


resource "aws_route_table" "database_route_table" {
    vpc_id = aws_vpc.main_vpc.id
    tags = {
        Name = "database_route_table"
    }
}

resource "aws_route_table_association" "main_route_table_association" {
    subnet_id = aws_subnet.bastion_subnet.id
    route_table_id = aws_route_table.main_route_table.id
}
resource "aws_route_table_association" "load_route_table_association" {
    subnet_id = aws_subnet.public_load_balancer.id
    route_table_id = aws_route_table.main_route_table.id
}


resource "aws_route_table_association" "frontend_route_table_association" {
    subnet_id = aws_subnet.frontend_private.id
    route_table_id = aws_route_table.frontend_route_table.id
}

resource "aws_route_table_association" "backend_route_table_association" {
    subnet_id = aws_subnet.backend_private.id
    route_table_id = aws_route_table.backend_route_table.id
}

resource "aws_route_table_association" "database_route_table_association" {
    subnet_id = aws_subnet.database_private_subnet.id
    route_table_id = aws_route_table.database_route_table.id
}