variable vpc_id {
    description = "The ID of the VPC where the RDS instance will be deployed"
    type        = string
}

variable db_subnet_group_name {
    description = "The name of the DB subnet group for the RDS instance"
    type        = string
}

variable db_instance_class {
    description = "The instance class for the RDS instance (e.g., db.t3.micro)"
    type        = string
}

variable db_engine {
    description = "The database engine for the RDS instance (e.g., mysql, postgres)"
    type        = string
}

variable db_name {
    description = "The name of the database to create when the RDS instance is created"
    type        = string
}