import { consumeAppleDeletionProof } from "./auth";
import * as Crypto from "expo-crypto";
import { accountClient } from "./client";
import { gameStore } from "../state/store";
export const accountDeletionEnabled =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED === "true";
export async function deleteCurrentAccount(confirmed: boolean) {
  if (!confirmed || !accountDeletionEnabled || !accountClient)
    throw Error("Deletion unavailable");
  const session = await accountClient.auth.getUser();
  if (session.error || !session.data.user) throw Error("Sign-in required");
  const appleCode = consumeAppleDeletionProof(session.data.user.id);
  const requestID = Crypto.randomUUID();
  const { data, error } = await accountClient.functions.invoke(
    "delete-account",
    {
      body: {
        request_id: requestID,
        confirmation: "DELETE",
        apple_authorization_code: appleCode,
      },
    },
  );
  if (
    error ||
    !data?.auth_deleted ||
    !/^[0-9a-f-]{36}$/i.test(data.request_id ?? "")
  )
    throw Error("Deletion not confirmed");
  // Only a server-confirmed Auth deletion permits erasing local progress.
  try {
    await accountClient.auth.signOut({ scope: "local" });
  } finally {
    await gameStore.resetAfterAccountDeletion(data.request_id);
  }
  return data.status === "completed" ? "completed" : "provider-pending";
}
