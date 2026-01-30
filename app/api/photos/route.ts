import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  // Ensure this matches the variable name in your Vercel Settings exactly
  const bucketName = process.env.AWS_BUCKET_NAME || "moses-wedding-photos";
  const region = process.env.AWS_REGION || "us-east-1";

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const { Contents } = await s3.send(command);

    // Filter out folders and only show actual images
    const photos = Contents?.filter(item => item.Size! > 0).map((item) => ({
      key: item.Key,
      // Use the standard S3 virtual-hosted-style URL
      url: `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`,
    })) || [];

    return NextResponse.json(photos);
  } catch (error) {
    console.error("S3 Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}