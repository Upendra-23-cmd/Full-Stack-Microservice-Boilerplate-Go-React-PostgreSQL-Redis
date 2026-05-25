output "auto_scaling_group_name" {
  description = "value of the auto scaling group name"
  value = aws_autoscaling_group.frontend_autoscaling_group.name
}

output "auto_scaling_group_name_backend" {
  description = "value of the auto scaling group name for the backend"
  value = aws_autoscaling_group.backend_autoscaling_group.name
}

output "auto_scaling_group_name_bastion" {
  description = "value of the auto scaling group name for the bastion"
  value = aws_autoscaling_group.bastion_autoscaling_group.name
}
