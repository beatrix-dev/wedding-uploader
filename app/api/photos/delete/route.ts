import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

import { verifyDeleteToken } from "@/lib/delete-token";
import { getDeleteTokenSecret, getServerConfig } from "@/lib/server-config";
import { getCloudFrontClient, getS3Client } from "@/lib/s3";

export async function DELETE(req: Request) {
  try {
    const { key, deleteToken } = await req.json();

    if (typeof key !== "string" || typeof deleteToken !== "string") {
      return NextResponse.json({ error: "Invalid delete payload." }, { status: 400 });
    }

    const config = getServerConfig();
    const deleteTokenSecret = getDeleteTokenSecret();
    const s3 = getS3Client();
    const cloudFront = getCloudFrontClient();

    if (!verifyDeleteToken(key, deleteToken, deleteTokenSecret)) {
      return NextResponse.json({ error: "Unauthorized delete request." }, { status: 403 });
    }

    await s3.send(new DeleteObjectCommand({ Bucket: config.awsBucketName, Key: key }));

    if (cloudFront && config.cloudFrontDistributionId) {
      try {
        await cloudFront.send(
          new CreateInvalidationCommand({
            DistributionId: config.cloudFrontDistributionId,
            InvalidationBatch: {
              CallerReference: `${Date.now()}-${key}`,
              Paths: { Quantity: 1, Items: [`/${key}`] },
            },
          }),
        );
      } catch (error) {
        console.error("CloudFront invalidation failed:", error);
      }
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json({ error: "Failed to delete photo." }, { status: 500 });
  }
}
