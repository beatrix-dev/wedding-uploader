import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createDeleteToken } from "@/lib/delete-token";
import { getDeleteTokenSecret, getServerConfig } from "@/lib/server-config";
import { getS3Client } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    if (typeof filename !== "string" || typeof contentType !== "string") {
      return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
    }

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    const config = getServerConfig();
    const s3 = getS3Client();
    const deleteTokenSecret = getDeleteTokenSecret();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${crypto.randomUUID()}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const deleteToken = createDeleteToken(key, deleteTokenSecret);

    return NextResponse.json({ uploadUrl, key, deleteToken });
  } catch (error) {
    console.error("Failed to create upload URL:", error);
    return NextResponse.json({ error: "Failed to create upload URL." }, { status: 500 });
  }
}
