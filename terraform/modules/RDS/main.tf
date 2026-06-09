resource "aws_db_instance" "postgres_instance" {

  allocated_storage = 20
  storage_type      = "gp2"
  engine            = var.db_engine
  engine_version    = "15.7"
  instance_class    = var.db_instance_class


  name     = var.db_name
  username = "Upendra"
  password = "Admin12345!"


  db_subnet_group_name   = aws_db_subnet_group.postgres_subnet_group.name
  vpc_security_group_ids = [aws_security_group.database_security_group.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "postgres_instance"
  }
}

resource "aws_elasticache_cluster" "redis_cluster" {
  cluster_id         = "redis-cluster"
  engine             = "redis"
  node_type          = "cache.t3.micro"
  num_cache_nodes    = 1
  subnet_group_name  = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids = [aws_security_group.database_security_group.id]
  tags = {
    Name = "redis_cluster"
  }

}