output security_group_alb {
    description = "value of the security group for the ALB"
    value = aws_security_group.security_group_alb.id
}

output "alb_dns" {
  description = "value of the ALB DNS name"
  value = aws_lb.alb.dns_name
}