resource "aws_launch_template" "frontend_launch_template" {
    name_prefix = "frontend-launch-template"
    image_id = var.image_id_frontend
    instance_type = var.instance_type_frontend
    key_name = aws_key_pair.public_key_pair.key_name

    network_interfaces {
        associate_public_ip_address = false
        security_groups = [aws_security_group.frontend_security_group.id]
    }

    block_device_mappings {
        device_name = "/dev/xvda"

        ebs {
            volume_size          = var.volume_size_frontend
            volume_type          = var.volume_type_frontend
            delete_on_termination = true
        }
    }
}

resource "aws_launch_template" "backend_launch_template" {
    name_prefix = "backend-launch-template"
    image_id = var.image_id_backend
    instance_type = var.instance_type_backend
    key_name = aws_key_pair.public_key_pair.key_name

    network_interfaces {
        associate_public_ip_address = false
        security_groups = [aws_security_group.backend_security_group.id]
    }

    block_device_mappings {
        device_name = "/dev/xvda"

        ebs {
            volume_size          = var.volume_size_backend
            volume_type          = var.volume_type_backend
            delete_on_termination = true
        }
    }
}

resource "aws_launch_template" "bastion_launch_template" {
    name_prefix = "bastion-launch-template"
    image_id = var.image_id_bastion
    instance_type = var.instance_type_bastion
    key_name = aws_key_pair.public_key_pair.key_name

    network_interfaces {
        associate_public_ip_address = true
        security_groups = [aws_security_group.bastion_security_group.id]
    }

    block_device_mappings {
        device_name = "/dev/xvda"

        ebs {
            volume_size           = var.volume_size_bastion
            volume_type           = var.volume_type_bastion
            delete_on_termination = true
        }
    }
}