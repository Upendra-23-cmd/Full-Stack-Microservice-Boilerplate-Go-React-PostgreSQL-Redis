variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr_block" {
  description = "value of the CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"

}

