output "bucket_name" {
  description = "Name of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 uploads bucket"
  value       = aws_s3_bucket.uploads.arn
}

output "uploader_role_arn" {
  description = "ARN of the IAM role for the uploader Lambda"
  value       = aws_iam_role.uploader.arn
}

output "ssm_bucket_name_path" {
  description = "SSM Parameter Store path for the bucket name"
  value       = aws_ssm_parameter.bucket_name.name
}
