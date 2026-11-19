export interface DeletionReceipt {
  request_id: string;
  status: string;
  auth_deleted: boolean;
}
export function readDeletionReceipt(
  value: unknown,
  requestID: string,
): DeletionReceipt {
  if (!value || typeof value !== "object")
    throw Error("Invalid deletion receipt");
  const receipt = value as DeletionReceipt;
  if (
    receipt.request_id !== requestID ||
    ![
      "requested",
      "processing",
      "failed",
      "data_deleted",
      "completed",
    ].includes(receipt.status) ||
    typeof receipt.auth_deleted !== "boolean" ||
    (receipt.status === "completed" && !receipt.auth_deleted)
  )
    throw Error("Invalid deletion receipt");
  return receipt;
}
