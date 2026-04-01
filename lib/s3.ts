import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import { S3Client } from "@aws-sdk/client-s3";

import { getServerConfig } from "./server-config";

export function getS3Client() {
  const config = getServerConfig();

  return new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });
}

export function getCloudFrontClient() {
  const config = getServerConfig();

  if (!config.cloudFrontDistributionId) {
    return null;
  }

  return new CloudFrontClient({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });
}
