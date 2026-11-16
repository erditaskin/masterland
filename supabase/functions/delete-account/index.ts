import { createHash } from "node:crypto";
import { revokeAppleAuthorization } from "../_shared/appleRevocation.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
const response = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
/** Deployment stays disabled until native reauthentication and Apple revocation acceptance. */
Deno.serve(async (request) => {
  if (request.method !== "POST")
    return response(405, { error: "method_not_allowed" });
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const body = await request.json();
    if (
      body.action !== "status" &&
      Deno.env.get("ACCOUNT_DELETION_ENABLED") !== "true"
    )
      return response(503, { error: "not_enabled" });
    if (
      typeof body.receipt !== "string" ||
      !/^[0-9a-f]{64}$/.test(body.receipt)
    )
      return response(400, { error: "receipt_required" });
    const receiptHash = createHash("sha256").update(body.receipt).digest("hex");
    if (body.action === "status") {
      if (!/^[0-9a-f-]{36}$/i.test(body.request_id ?? ""))
        return response(400, { error: "invalid_request" });
      const { data, error } = await admin.rpc("read_account_deletion_receipt", {
        request_id: body.request_id,
        receipt_hash: receiptHash,
      });
      if (error) return response(503, { error: "status_unavailable" });
      return data
        ? response(200, data)
        : response(404, { error: "receipt_not_found" });
    }
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer "))
      return response(401, { error: "unauthorized" });
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(authorization.slice(7));
    if (authError || !user) return response(401, { error: "unauthorized" });
    if (
      body.confirmation !== "DELETE" ||
      !/^[0-9a-f-]{36}$/i.test(body.request_id ?? "")
    )
      return response(400, { error: "confirmation_required" });
    const appleIdentity = user.identities?.find(
      (identity) => identity.provider === "apple",
    );
    if (
      appleIdentity &&
      (!Deno.env.get("APPLE_CLIENT_SECRET") ||
        typeof body.apple_authorization_code !== "string")
    ) {
      return response(409, { error: "apple_reauthentication_required" });
    }
    const { data: id, error: requestError } = await caller.rpc(
      "request_account_deletion_with_receipt",
      {
        request_id: body.request_id,
        confirmation: body.confirmation,
        receipt_hash: receiptHash,
      },
    );
    if (requestError)
      return response(409, {
        error: "recent_sign_in_or_pending_request_required",
      });
    // Admin operations never run in the mobile client. No request can target another UUID.
    const { data: claimed, error: processingError } = await admin.rpc(
      "claim_account_deletion",
      { request_id: id },
    );
    if (processingError || !claimed)
      return response(202, {
        request_id: id,
        status: "processing",
        auth_deleted: false,
      });
    if (appleIdentity) {
      try {
        await revokeAppleAuthorization({
          code: body.apple_authorization_code,
          subject: appleIdentity.id,
          clientID: "com.erditaskin.masterland",
          clientSecret: Deno.env.get("APPLE_CLIENT_SECRET")!,
        });
        const { error: revokeRecordError } = await admin
          .from("account_deletion_requests")
          .update({ provider_revocation: "completed" })
          .eq("id", id);
        if (revokeRecordError) throw revokeRecordError;
      } catch {
        await admin
          .from("account_deletion_requests")
          .update({ status: "failed", error_code: "provider_revoke_pending" })
          .eq("id", id);
        return response(503, {
          request_id: id,
          status: "failed",
          auth_deleted: false,
          error: "provider_revoke_pending",
        });
      }
    }
    const deletion = await admin.auth.admin.deleteUser(user.id, false);
    if (deletion.error) {
      await admin
        .from("account_deletion_requests")
        .update({ status: "failed", error_code: "auth_delete_failed" })
        .eq("id", id);
      return response(503, {
        request_id: id,
        status: "failed",
        auth_deleted: false,
      });
    }
    const apple =
      user.identities?.some((identity) => identity.provider === "apple") ??
      false;
    // Apple authorization was revoked before Auth deletion; identities/sessions cascade in Auth.
    const status = "completed";
    const { error: accountError } = await admin
      .from("app_accounts")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("user_id", user.id);
    const { error: recordError } = await admin
      .from("account_deletion_requests")
      .update({
        status,
        completed_at: new Date().toISOString(),
        provider_revocation: apple ? "completed" : "not_required",
        error_code: null,
      })
      .eq("id", id);
    if (accountError || recordError)
      return response(202, {
        request_id: id,
        status: "processing",
        auth_deleted: true,
      });
    return response(200, {
      request_id: id,
      status,
      auth_deleted: true,
      provider_revocation: apple ? "completed" : "not_required",
    });
  } catch {
    return response(503, { error: "deletion_unavailable" });
  }
});
