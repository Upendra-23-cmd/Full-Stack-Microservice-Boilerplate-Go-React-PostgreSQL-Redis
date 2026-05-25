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
    db_subnet_group_name = [module.vpc.private_subnet_id_database]
    db_subnet_group_name_2 = [module.vpc.private_subnet_id_database_2]
}

module "template" {
    source = "./modules/Template"
    vpc_id = module.vpc.vpc_id
    alb_security_group_id = module.security_group.security_group_alb.id
}

module "lb" {
    source = "./modules/LB"
    public_subnet_id = module.vpc.public_subnet_ids_load_balancer.id
    public_subnet_id_2 = module.vpc.public_subnet_ids_bastion.id
    vpc_id = module.vpc.vpc_id.id
}

module "asg" {
    source = "./modules/ASG"
    launch_template_id_backend = module.template.launch_template_id_backend.id
    launch_template_id_bastion = module.template.launch_template_id_bastion.id
    launch_template_id_frontend = module.template.launch_template_id_frontend.id
    subnet_ids_backend = module.vpc.private_subnet_id_backend.id
    subnet_ids_bastion = module.vpc.public_subnet_ids_bastion.id
    subnet_ids_frontend = module.vpc.private_subnet_id_frontend.id
    target_group_arns = module.lb.target_group_arn.arn
}