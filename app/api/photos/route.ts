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
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME,
  });

  try {
    const { Contents } = await s3.send(command);
    const photos = Contents?.map((item) => ({
      key: item.Key,
      // THE URL MUST BE THE PUBLIC LINK
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    })) || [];

    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}