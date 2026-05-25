output "aws_template" {
    description = "The ID of the launch template for the frontend instances"
    value      = aws_launch_template.frontend_launch_template.id
}

output "aws_template_backend" {
    description = "The ID of the launch template for the backend instances"
    value      = aws_launch_template.backend_launch_template.id
}

output "aws_template_bastion" {
    description = "The ID of the launch template for the bastion instances"
    value      = aws_launch_template.bastion_launch_template.id
}
output "key_pair" {
    description = "The name of the key pair for the instances"
    value      = aws_key_pair.key_pair.key_name
}

