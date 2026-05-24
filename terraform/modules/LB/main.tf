resource "aws_lb" "load_balancer_instace" {
    name = "my-alb"
    internal = false
    load_balancer_type = "application"
    security_groups = [ aws_security_group.security_group_alb ]

    subnets = [
        var.public_subnet_id,
        var.public_subnet_id_2
    ]

    tags = {
        Name = "my-alb"
    }
}

resource "aws_alb_listener" "listener" {
    load_balancer_arn = aws_lb.load_balancer_instace.arn
    port              = 80
    protocol          = "HTTP"

    default_action {
        type             = "forward"
        target_group_arn = aws_lb_target_group.load_balancer_target_group.arn
    }
  
}