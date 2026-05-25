variable vpc_id {
    description = "The ID of the VPC where the ALB will be deployed"
    type        = string
}

variable public_subnet_id {
    description = "The ID of the public subnet where the ALB will be deployed"
    type        = string
}

variable "public_subnet_id_2" {
    description = "The ID of the second public subnet where the ALB will be deployed"
    type        = string
}