import "server-only";

type RequiredEnvKey =
  | "AWS_REGION"
  | "AWS_ACCESS_KEY_ID"
  | "AWS_SECRET_ACCESS_KEY"
  | "AWS_BUCKET_NAME"
  | "DELETE_TOKEN_SECRET";

type ServerConfig = {
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsBucketName: string;
  cloudFrontDomain: string | null;
  cloudFrontDistributionId: string | null;
  deleteTokenSecret: string;
};

let cachedConfig: ServerConfig | null = null;

function getRequiredEnv(name: RequiredEnvKey) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    awsRegion: getRequiredEnv("AWS_REGION"),
    awsAccessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
    awsSecretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    awsBucketName: getRequiredEnv("AWS_BUCKET_NAME"),
    cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN ?? null,
    cloudFrontDistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID ?? null,
    deleteTokenSecret: getRequiredEnv("DELETE_TOKEN_SECRET"),
  };

  return cachedConfig;
}
