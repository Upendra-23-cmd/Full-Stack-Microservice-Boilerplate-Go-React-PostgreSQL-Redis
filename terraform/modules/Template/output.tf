output "aws_template" {
    description = "The ID of the launch template for the frontend instances"
    value      = aws_launch_template.frontend_launch_template.id
}