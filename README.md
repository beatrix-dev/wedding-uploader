## Wedding Uploader

Private photo upload and gallery app for a wedding event. Guests can upload images directly to S3 with presigned URLs, browse the shared gallery, and delete only the photos uploaded from their own device.

## Stack

- Next.js App Router
- S3 for object storage
- Optional CloudFront for image delivery and cache invalidation
- Terraform for AWS infrastructure scaffolding

## Local Setup

Create `.env.local` with:

```bash
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
DELETE_TOKEN_SECRET=...
# Optional
AWS_CLOUDFRONT_DOMAIN=...
AWS_CLOUDFRONT_DISTRIBUTION_ID=...
```

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Notes

- `DELETE_TOKEN_SECRET` is used to sign delete permissions per upload.
- If `AWS_CLOUDFRONT_DOMAIN` is set, gallery images are served through CloudFront.
- If `AWS_CLOUDFRONT_DISTRIBUTION_ID` is also set, delete requests trigger cache invalidation.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Infrastructure

Terraform files live in `infrastructure/`.

- Use `infrastructure/terraform.tfvars.example` as a starting point for environment-specific tfvars.
- Consider configuring a remote Terraform backend before sharing this with a team.

## Deployment Checklist

- Set all required environment variables in your hosting platform.
- Confirm S3 CORS allows your site origin.
- If using CloudFront, set both the domain and distribution ID.
- Run `npm run lint` and `npm run build` before deploy.

## Current Behavior

- Uploads are limited to images and processed in small parallel batches.
- Gallery delete controls only appear for uploads that have a matching signed token on the current device.
- Older `localStorage` formats are treated as non-deletable for safety.
