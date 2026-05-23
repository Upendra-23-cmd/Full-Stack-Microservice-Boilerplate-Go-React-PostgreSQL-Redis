resource "tls_private_key" "public_private_key" {
    algorithm = "RSA"
    rsa_bits = 4096
}

resource "aws_key_pair" "public_key_pair" {
    key_name = "upendra-key-pair"
    public_key = tls_private_key.public_private_key.public_key_openssh
}

resource "local_file" "private_key_file" {
    content = tls_private_key.public_private_key.private_key_pem
    filename = "${path.module}/upendra-key-pair.pem"
    file_permission = "0600"
}