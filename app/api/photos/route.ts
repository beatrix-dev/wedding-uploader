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
  const region = process.env.AWS_REGION;

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    // If your photos are in a folder, add Prefix: 'MosesWedding/' 
    // If they are in the main area, leave Prefix out or empty:
    Prefix: "", 
  });

  try {
    const { Contents } = await s3.send(command);
    
    // Log this to your Vercel logs so you can see if AWS is actually sending files
    console.log("S3 Contents found:", Contents?.length || 0);

    const photos = Contents?.filter(item => item.Size! > 0).map((item) => ({
      key: item.Key,
      url: `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`,
    })) || [];

    return NextResponse.json(photos);
  } catch (error) {
    console.error("S3 List Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}