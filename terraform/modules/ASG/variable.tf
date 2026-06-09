# frontend variables

variable "max_size_frontend" {
  description = "The maximum number of instances in the Auto Scaling group"
  type        = string
  default     = "3"

}

variable "launch_template_id_frontend" {
  description = "The ID of the launch template to use for the Auto Scaling group"
  type        = string
}

variable "subnet_ids_frontend" {
  description = "A list of subnet IDs for the Auto Scaling group"
  type        = list(string)
}

variable "desired_capacity_frontend" {
  description = "The desired number of instances in the Auto Scaling group"
  type        = string
  default     = "2"
}

variable "min_size_frontend" {
  description = "The minimum number of instances in the Auto Scaling group"
  type        = string
  default     = "2"
}

variable "target_group_arns" {
  description = "The ARN of the target group to attach to the Auto Scaling group"
  type        = list(string)
}


# backend variables

variable "max_size_backend" {
  description = "The maximum number of instances in the Auto Scaling group"
  type        = string
  default     = "3"

}

variable "launch_template_id_backend" {
  description = "The ID of the launch template to use for the Auto Scaling group"
  type        = string
}

variable "subnet_ids_backend" {
  description = "A list of subnet IDs for the Auto Scaling group"
  type        = list(string)
}

variable "desired_capacity_backend" {
  description = "The desired number of instances in the Auto Scaling group"
  type        = string
  default     = "2"
}

variable "min_size_backend" {
  description = "The minimum number of instances in the Auto Scaling group"
  type        = string
  default     = "2"
}

# bastion variables

variable "max_size_bastion" {
  description = "The maximum number of instances in the Auto Scaling group"
  type        = string
  default     = "1"

}

variable "launch_template_id_bastion" {
  description = "The ID of the launch template to use for the Auto Scaling group"
  type        = string
}

variable "subnet_ids_bastion" {
  description = "A list of subnet IDs for the Auto Scaling group"
  type        = list(string)
}

variable "desired_capacity_bastion" {
  description = "The desired number of instances in the Auto Scaling group"
  type        = string
  default     = "1"
}

variable "min_size_bastion" {
  description = "The minimum number of instances in the Auto Scaling group"
  type        = string
  default     = "1"
}
