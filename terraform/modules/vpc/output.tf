output "vpc_id" {
    description = "The ID of the VPC"
    value      = aws_vpc.main_vpc.id
}

output "public_subnet_ids" {
    description = "The IDs of the public subnets"
    value      = [aws_subnet.bastion_subnet.id, aws_subnet.public_load_balancer.id]
}

output "private_subnet_ids" {
    description = "The IDs of the private subnets"
    value      = [aws_subnet.frontend_private.id, aws_subnet.backend_private.id, aws_subnet.database_private_subnet.id, aws_subnet.database_private_subnet_2.id]
}

output "nat_gateway_id" {
    description = "The ID of the NAT Gateway"
    value      = aws_nat_gateway.main_nat_gateway.id
}