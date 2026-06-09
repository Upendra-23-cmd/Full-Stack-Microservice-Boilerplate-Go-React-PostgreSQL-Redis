output "security_group_alb" {
  description = "value of the security group for the ALB"
  value       = [aws_security_group.security_group_alb.id]
}

output "alb_dns" {
  description = "value of the ALB DNS name"
  value       = aws_lb.load_balancer_instace.dns_name
}

output "target_group_arn" {
  description = "value of the target group ARN"
  value       = aws_lb_target_group.load_balancer_target_group.arn
}