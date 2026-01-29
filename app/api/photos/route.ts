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
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: "MosesWedding/", // Only get wedding photos
    });

    const { Contents } = await s3.send(command);
    
    // Generate the public URLs (if your bucket allows public read)
    // Or generate signed URLs if the bucket is private
    const photos = Contents?.map(item => ({
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
      key: item.Key,
      date: item.LastModified
    })) || [];

    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load photos" }, { status: 500 });
  }
}