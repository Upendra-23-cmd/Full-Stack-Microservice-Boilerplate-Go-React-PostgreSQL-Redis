terraform {
    required_version = ">= 0.12"
    
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 3.0"
        }
    }
}

provider "aws" {
    region = var.aws_region
}

module "vpc" {
    source = "./modules/vpc"
    vpc_cidr_block = var.vpc_cidr_block
}

module "database" {
    source = "./modules/RDS"
    vpc_id = module.vpc.vpc_id
    db_subnet_group_name = module.vpc.private_subnet_id_database
    db_subnet_group_name_2 = module.vpc.private_subnet_id_database_2
}