output "auto_scaling_group_name" {
  description = "value of the auto scaling group name"
  value = aws_autoscaling_group.asg.name
}

