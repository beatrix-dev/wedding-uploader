terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment this block once you have a remote state bucket set up
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "wedding-uploader/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "wedding-uploader"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ─────────────────────────────────────────
# S3 Bucket
# ─────────────────────────────────────────

resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-${var.environment}-uploads"
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ─────────────────────────────────────────
# IAM — Upload role (used by your app/Lambda)
# ─────────────────────────────────────────

data "aws_iam_policy_document" "uploader_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "uploader" {
  name               = "${var.project_name}-${var.environment}-uploader-role"
  assume_role_policy = data.aws_iam_policy_document.uploader_assume_role.json
}

data "aws_iam_policy_document" "uploader_s3" {
  statement {
    sid    = "AllowUpload"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.uploads.arn}/*",
    ]
  }

  statement {
    sid    = "AllowList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.uploads.arn,
    ]
  }
}

resource "aws_iam_policy" "uploader_s3" {
  name   = "${var.project_name}-${var.environment}-uploader-s3-policy"
  policy = data.aws_iam_policy_document.uploader_s3.json
}

resource "aws_iam_role_policy_attachment" "uploader_s3" {
  role       = aws_iam_role.uploader.name
  policy_arn = aws_iam_policy.uploader_s3.arn
}

# Basic Lambda execution (CloudWatch logs)
resource "aws_iam_role_policy_attachment" "uploader_lambda_basic" {
  role       = aws_iam_role.uploader.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ─────────────────────────────────────────
# SSM Parameter Store — secrets
# ─────────────────────────────────────────

resource "aws_ssm_parameter" "bucket_name" {
  name  = "/${var.project_name}/${var.environment}/bucket-name"
  type  = "String"
  value = aws_s3_bucket.uploads.bucket
}
