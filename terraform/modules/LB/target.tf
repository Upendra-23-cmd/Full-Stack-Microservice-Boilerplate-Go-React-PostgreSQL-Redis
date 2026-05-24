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
   

resource "aws_lb_target_group_attachment" "target_group_attachment" {
    target_group_arn = aws_lb_target_group.load_balancer_target_group.arn
    target_id        = var.instance_id
    port             = 80
}

resource "aws_lb_target_group_attachment" "target_group_attachment_2" {
    target_group_arn = aws_lb_target_group.load_balancer_target_group.arn
    target_id        = var.instance_id_2
    port             = 80
}
