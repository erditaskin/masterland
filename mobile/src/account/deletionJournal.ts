import { NORMAL_SAVE_KEY, CONTROLLED_SAVE_KEY } from "../state/saveNamespace";
export interface DeletionJournal {
  requestID: string;
  receipt: string;
  userID: string;
  namespace: string;
}
export interface DeletionReceipt {
  request_id: string;
  status: string;
  auth_deleted: boolean;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function readDeletionJournal(raw: string): DeletionJournal {
  const value = JSON.parse(raw);
  if (
    !value ||
    !uuid.test(value.requestID ?? "") ||
    !uuid.test(value.userID ?? "") ||
    !/^[0-9a-f]{64}$/.test(value.receipt ?? "") ||
    ![NORMAL_SAVE_KEY, CONTROLLED_SAVE_KEY].includes(value.namespace)
  )
    throw Error("Invalid deletion journal");
  return value;
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
/** Store intent before transmission; erase progress only after a matching server confirmation. */
export async function reconcileDeletion(
  journal: DeletionJournal,
  deps: {
    status(journal: DeletionJournal): Promise<DeletionReceipt | null>;
    reset(requestID: string): Promise<void>;
    clear(): Promise<void>;
  },
) {
  const receipt = await deps.status(journal);
  if (!receipt) return "not-found" as const;
  const verified = readDeletionReceipt(receipt, journal.requestID);
  if (!verified.auth_deleted)
    return verified.status === "failed"
      ? ("retry" as const)
      : ("pending" as const);
  await deps.reset(journal.requestID);
  await deps.clear();
  return "completed" as const;
}
