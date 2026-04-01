import crypto from "node:crypto";

const TOKEN_VERSION = "v1";

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createDeleteToken(key: string, secret: string) {
  const payload = `${TOKEN_VERSION}:${key}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${toBase64Url(payload)}.${signature}`;
}

export function verifyDeleteToken(
  key: string,
  token: string,
  secret: string,
) {
  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return false;
  }

  let payload: string;

  try {
    payload = fromBase64Url(encodedPayload);
  } catch {
    return false;
  }

  const expectedPayload = `${TOKEN_VERSION}:${key}`;

  if (payload !== expectedPayload) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature),
  );
}
