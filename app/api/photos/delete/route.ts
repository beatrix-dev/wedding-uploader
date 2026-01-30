import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: Request) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    // Standardize the bucket name variable
    const bucketName = process.env.AWS_BUCKET_NAME || "moses-wedding-photos";

    console.log(`DEBUG: Attempting to delete ${key} from ${bucketName}`);

    const command = new DeleteObjectCommand({
      Bucket: bucketName, // Ensure this is the BUCKET name, not the key!
      Key: key,           // This is the filename/UUID
    });

    await s3.send(command);
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}