export const UPLOAD_STORAGE_KEY = "my-wedding-uploads";

export type UploadRecord = {
  deleteToken: string;
  uploadedAt: string;
};

export type UploadRecordMap = Record<string, UploadRecord>;

function isUploadRecordMap(value: unknown): value is UploadRecordMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const typedEntry = entry as Partial<UploadRecord>;
    return (
      typeof typedEntry.deleteToken === "string" &&
      typeof typedEntry.uploadedAt === "string"
    );
  });
}

export function readUploadRecords(storage: Storage): UploadRecordMap {
  const rawValue = storage.getItem(UPLOAD_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (Array.isArray(parsed)) {
      return {};
    }

    if (isUploadRecordMap(parsed)) {
      return parsed;
    }
  } catch {
    return {};
  }

  return {};
}

export function writeUploadRecords(storage: Storage, records: UploadRecordMap) {
  storage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(records));
}
