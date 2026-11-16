import { validateSave, type Save } from "../game/engine";
export interface CloudSave {
  user_id: string;
  schema_version: 1;
  revision: number;
  payload: Save;
  updated_at: string;
}
export function readCloudRow(value: unknown, expectedUser: string): CloudSave {
  if (!value || typeof value !== "object") throw Error("Invalid cloud record");
  const row = value as Partial<CloudSave>;
  if (
    row.user_id !== expectedUser ||
    row.schema_version !== 1 ||
    !Number.isSafeInteger(row.revision) ||
    row.revision! < 1 ||
    !validateSave(row.payload) ||
    typeof row.updated_at !== "string" ||
    !Number.isFinite(Date.parse(row.updated_at))
  )
    throw Error("Cloud record is incompatible or invalid");
  return row as CloudSave;
}
export function readWriteResult(value: unknown): {
  kind: "saved" | "conflict";
  revision: number;
} {
  if (
    !value ||
    typeof value !== "object" ||
    !("kind" in value) ||
    !("revision" in value) ||
    !["saved", "conflict"].includes(String(value.kind)) ||
    !Number.isSafeInteger(value.revision) ||
    Number(value.revision) < 0 ||
    (value.kind === "saved" && value.revision === 0)
  )
    throw Error("Invalid cloud write result");
  return value as { kind: "saved" | "conflict"; revision: number };
}
