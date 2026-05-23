variable "instance_type_frontend" {
    description = "The instance type for the EC2 instance (e.g., t3.micro)"
    type        = string
    default     = "t3.micro"
}

variable "image_id_frontend" {
    description = "The ID of the AMI to use for the EC2 instance"
    type        = string
    default     = "ami-091138d0f0d41ff90"
}

variable "key_name" {
    description = "The name of the key pair to use for the EC2 instance"
    type        = string
}

variable "volume_size_frontend" {
    description = "The size of the EBS volume in GB"
    type        = number
    default     = 8
}

variable "volume_type_frontend" {
    description = "The type of the EBS volume (e.g., gp2, io1)"
    type        = string
    default     = "gp2"
  
}

variable "instance_type_backend" {
    description = "The instance type for the EC2 instance (e.g., t3.micro)"
    type        = string
    default     = "t3.micro"
}

variable "image_id_backend" {
    description = "The ID of the AMI to use for the EC2 instance"
    type        = string
    default     = "ami-091138d0f0d41ff90"
}

variable "volume_size_backend" {
    description = "The size of the EBS volume in GB"
    type        = number
    default     = 8
}

variable "volume_type_backend" {
    description = "The type of the EBS volume (e.g., gp2, io1)"
    type        = string
    default     = "gp2"
  
}

variable "vpc_id" {
  description = "The ID of the VPC where the EC2 instance will be deployed"
    type        = string
}

variable "image_id_bastion" {
    description = "The ID of the AMI to use for the EC2 instance"
    type        = string
    default     = "ami-091138d0f0d41ff90"
  
}

variable "instance_type_bastion" {
    description = "The instance type for the EC2 instance (e.g., t3.micro)"
    type        = string
    default     = "t3.micro"
}

variable "volume_size_bastion" {
    description = "The size of the EBS volume in GB"
    type        = number
    default     = 8
}

variable "volume_type_bastion" {
    description = "The type of the EBS volume (e.g., gp2, io1)"
    type        = string
    default     = "gp2" 
}