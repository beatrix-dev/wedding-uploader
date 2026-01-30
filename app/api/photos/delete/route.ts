import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

const s3 = new S3Client({ /* your config */ });
const cf = new CloudFrontClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: Request) {
  try {
    const { key } = await req.json();
    const bucketName = process.env.AWS_BUCKET_NAME || "moses-wedding-photos";

    // 1. Delete from S3
    await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));

    // 2. Tell CloudFront to forget this image immediately
    // Replace 'YOUR_DISTRIBUTION_ID' with the ID (not the .net name) from AWS console
    try {
      await cf.send(new CreateInvalidationCommand({
        DistributionId: "E1OHWCNCO50ZGN", // Check your AWS CF panel for this ID!
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: { Quantity: 1, Items: [`/${key}`] },
        },
      }));
    } catch (cfErr) {
      console.error("CloudFront Invalidation failed, image might linger for a few mins");
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}