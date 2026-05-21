resource "aws_db_instance" "postgres_instance" {

    allocated_storage    = 20
    storage_type         = "gp2"
    engine               = var.db_engine
    engine_version       = "13.4"
    instance_class       = var.db_instance_class


    name                 = var.db_name
    username             = "admin"
    password             = "Admin12345!"


    db_subnet_group_name = var.db_subnet_group_name
    vpc_security_group_ids = [aws_security_group.database_security_group.id]
    skip_final_snapshot  = true
    publicly_accessible = false

    tags = {
        Name = "postgres_instance"
    }
}

resource "aws_elasticache_cluster" "redis_cluster" {
    cluster_id           = "redis-cluster"
    engine               = "redis"
    node_type            = "cache.t3.micro"
    num_cache_nodes      = 1
    subnet_group_name    = var.db_subnet_group_name_2
    security_group_ids   = [aws_security_group.database_security_group.id]
    tags = {
        Name = "redis_cluster"
    }
  
}