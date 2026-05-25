resource "aws_lb_target_group" "load_balancer_target_group" {
    name     = "load-balancer-target-group"
    port     = 80
    protocol = "HTTP"
    vpc_id   = var.vpc_id

    health_check {
        path                = "/"
        protocol            = "HTTP"
        matcher             = "200-399"
        interval            = 30
        timeout             = 5
        healthy_threshold   = 3
        unhealthy_threshold = 3
    }
  
}
   