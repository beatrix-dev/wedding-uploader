import "server-only";

type RequiredEnvKey =
  | "AWS_REGION"
  | "AWS_ACCESS_KEY_ID"
  | "AWS_SECRET_ACCESS_KEY"
  | "AWS_BUCKET_NAME";

type ServerConfig = {
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsBucketName: string;
  cloudFrontDomain: string | null;
  cloudFrontDistributionId: string | null;
  deleteTokenSecret: string | null;
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
    deleteTokenSecret: process.env.DELETE_TOKEN_SECRET ?? null,
  };

  return cachedConfig;
}

export function getDeleteTokenSecret() {
  const deleteTokenSecret = getServerConfig().deleteTokenSecret;

  if (!deleteTokenSecret) {
    throw new Error("Missing required environment variable: DELETE_TOKEN_SECRET");
  }

  return deleteTokenSecret;
}
