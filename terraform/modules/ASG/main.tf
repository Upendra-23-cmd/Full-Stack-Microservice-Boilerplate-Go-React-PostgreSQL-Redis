resource "aws_autoscaling_group" "frontend_autoscaling_group" {
  name                = "frontend_autoscaling_group"
  max_size            = var.max_size_frontend
  min_size            = var.min_size_frontend
  desired_capacity    = var.desired_capacity_frontend
  vpc_zone_identifier = var.subnet_ids_frontend
  launch_template {
    id      = var.launch_template_id_frontend
    version = "$Latest"
  }

  target_group_arns = var.target_group_arns

}

resource "aws_autoscaling_policy" "frontend_autoscaling_policy" {
  name                   = "frontend_autoscaling_policy"
  autoscaling_group_name = aws_autoscaling_group.frontend_autoscaling_group.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 50.0
  }

}

resource "aws_autoscaling_group" "backend_autoscaling_group" {
  name                = "backend_autoscaling_group"
  max_size            = var.max_size_backend
  min_size            = var.min_size_backend
  desired_capacity    = var.desired_capacity_backend
  vpc_zone_identifier = var.subnet_ids_backend
  launch_template {
    id      = var.launch_template_id_backend
    version = "$Latest"
  }

}

resource "aws_autoscaling_policy" "backend_autoscaling_policy" {
  name                   = "backend_autoscaling_policy"
  autoscaling_group_name = aws_autoscaling_group.backend_autoscaling_group.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 50.0
  }

}

resource "aws_autoscaling_group" "bastion_autoscaling_group" {
  name                = "bastion_autoscaling_group"
  max_size            = var.max_size_bastion
  min_size            = var.min_size_bastion
  desired_capacity    = var.desired_capacity_bastion
  vpc_zone_identifier = var.subnet_ids_bastion
  launch_template {
    id      = var.launch_template_id_bastion
    version = "$Latest"
  }

}

resource "aws_autoscaling_policy" "bastion_autoscaling_policy" {
  name                   = "bastion_autoscaling_policy"
  autoscaling_group_name = aws_autoscaling_group.bastion_autoscaling_group.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 50.0
  }

}