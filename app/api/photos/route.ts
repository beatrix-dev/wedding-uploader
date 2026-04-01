import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { getServerConfig } from "@/lib/server-config";
import { getS3Client } from "@/lib/s3";

export async function GET() {
  try {
    const config = getServerConfig();
    const s3 = getS3Client();
    const command = new ListObjectsV2Command({
      Bucket: config.awsBucketName,
    });

    const { Contents } = await s3.send(command);
    const baseUrl = config.cloudFrontDomain
      ? `https://${config.cloudFrontDomain}`
      : `https://${config.awsBucketName}.s3.${config.awsRegion}.amazonaws.com`;

    const photos =
      Contents?.filter((item) => item.Key && (item.Size ?? 0) > 0).map((item) => ({
        key: item.Key!,
        url: `${baseUrl}/${item.Key!}`,
      })) ?? [];

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json({ error: "Failed to fetch photos." }, { status: 500 });
  }
}
