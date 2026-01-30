import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 Client outside the handler to reuse connection
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing file info" }, { status: 400 });
    }

    // Clean filename to prevent path traversal or weird characters
    const safeName = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
   // const key = `MosesWedding/${uuidv4()}-${safeName}`;
    const key = `${crypto.randomUUID()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "moses-wedding-photos",
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });



    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("S3 Presigned URL Error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}