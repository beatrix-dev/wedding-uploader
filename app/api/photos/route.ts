import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  const bucketName = process.env.AWS_BUCKET_NAME;

  console.log("DEBUG: Looking in bucket:", bucketName);

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    // Removing Prefix entirely to find everything in the bucket
  });

  try {
    const { Contents } = await s3.send(command);
    
    // This will show up in your Vercel Logs
    console.log("DEBUG: Raw Contents from S3:", JSON.stringify(Contents?.map(c => c.Key)));

    const photos = Contents?.filter(item => item.Size! > 0).map((item) => ({
      key: item.Key,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    })) || [];

    return NextResponse.json(photos);
  } catch (error) {
    console.error("DEBUG: S3 Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}