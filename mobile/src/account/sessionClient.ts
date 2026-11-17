export interface AccountUser {
  id: string;
  is_anonymous: boolean;
  email: string | null;
  user_metadata: { full_name: string | null; name?: string };
  identities: { provider: "apple" | "google" | "facebook" }[];
}
export interface AccountSession {
  access_token: string;
  expires_at: number;
  user: AccountUser;
}
export class AccountAPIError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}
export function readAccountUser(value: unknown): AccountUser {
  if (!value || typeof value !== "object") throw Error("Invalid account");
  const user = value as Partial<AccountUser>;
  if (
    typeof user.id !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(user.id) ||
    typeof user.is_anonymous !== "boolean" ||
    !(user.email === null || typeof user.email === "string") ||
    !user.user_metadata ||
    !(
      user.user_metadata.full_name === null ||
      typeof user.user_metadata.full_name === "string"
    ) ||
    !Array.isArray(user.identities) ||
    !user.identities.every(
      (i) => i && ["apple", "google", "facebook"].includes(i.provider),
    )
  )
    throw Error("Invalid account");
  return user as AccountUser;
}
export function readAccountSession(value: unknown): AccountSession {
  if (!value || typeof value !== "object") throw Error("Invalid session");
  const session = value as Partial<AccountSession>;
  if (
    typeof session.access_token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(session.access_token) ||
    !Number.isSafeInteger(session.expires_at)
  )
    throw Error("Invalid session");
  return {
    access_token: session.access_token,
    expires_at: session.expires_at!,
    user: readAccountUser(session.user),
  };
}
/** Transport and encrypted session storage are injected, keeping native APIs out of protocol tests. */
export function createAccountClient(deps: {
  url: string;
  key: string;
  storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
  fetch: typeof fetch;
}) {
  let session: AccountSession | null = null;
  let loading: Promise<void> | null = null;
  let generation = 0;
  let tail: Promise<unknown> = Promise.resolve();
  const listeners = new Set<(user: AccountUser | null) => void>();
  const publish = () =>
    listeners.forEach((listener) => listener(session?.user ?? null));
  const restore = async () => {
    if (!loading)
      loading = (async () => {
        const current = generation;
        const raw = await deps.storage.getItem(deps.key);
        if (raw && current === generation)
          session = readAccountSession(JSON.parse(raw));
      })().catch((error) => {
        loading = null;
        throw error;
      });
    await loading;
  };
  const request = async (
    path: string,
    options: {
      method?: "GET" | "POST" | "PUT";
      body?: unknown;
      ownerID?: string;
      anonymous?: boolean;
    } = {},
  ): Promise<unknown> => {
    if (!options.anonymous) await restore();
    const pinned = options.anonymous ? null : session;
    if (options.ownerID && pinned?.user.id !== options.ownerID)
      throw Error("Account changed");
    const response = await deps.fetch(`${deps.url}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(pinned
          ? {
              Authorization: `Bearer ${pinned.access_token}`,
              "x-masterland-owner": pinned.user.id,
            }
          : {}),
      },
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      // A delayed old-owner response must never clear a newer session.
      if (response.status === 401 && pinned) {
        const clear = async () => {
          if (session?.access_token !== pinned.access_token) return;
          await deps.storage.removeItem(deps.key);
          session = null;
          generation++;
          publish();
        };
        const pending = tail.then(clear, clear);
        tail = pending.catch(() => undefined);
        await pending;
      }
      throw new AccountAPIError(
        response.status,
        response.status === 401 ? "unauthenticated" : "request-failed",
      );
    }
    return response.json();
  };
  const install = (value: unknown, expectedGeneration: number) => {
    const next = readAccountSession(value);
    const work = async () => {
      if (generation !== expectedGeneration) throw Error("Account changed");
      await deps.storage.setItem(deps.key, JSON.stringify(next));
      session = next;
      generation++;
      publish();
      return next;
    };
    const pending = tail.then(work, work);
    tail = pending.catch(() => undefined);
    return pending;
  };
  return {
    request,
    subscribe: (listener: (user: AccountUser | null) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSession: async () => {
      await restore();
      return session;
    },
    getUser: async () => {
      const pinned = await (async () => {
        await restore();
        return session;
      })();
      if (!pinned) return null;
      const user = readAccountUser(
        await request("/v1/auth/me", { ownerID: pinned.user.id }),
      );
      if (session?.access_token !== pinned.access_token)
        throw Error("Account changed");
      session = { ...pinned, user };
      return user;
    },
    createGuest: async (requestID: string) => {
      await restore();
      if (session) return session;
      const current = generation;
      return install(
        await request("/v1/auth/guest", {
          method: "POST",
          body: { request_id: requestID },
          anonymous: true,
        }),
        current,
      );
    },
    signInApple: async (input: {
      challenge_id: string;
      identity_token: string;
      full_name: string | null;
    }) => {
      await restore();
      const current = generation;
      return install(
        await request("/v1/auth/apple", { method: "POST", body: input }),
        current,
      );
    },
    exchangeOAuth: async (input: {
      code: string;
      state: string;
      code_verifier: string;
    }) => {
      await restore();
      const current = generation;
      return install(
        await request("/v1/auth/oauth/exchange", {
          method: "POST",
          body: input,
        }),
        current,
      );
    },
    clearLocal: async () => {
      const work = async () => {
        await deps.storage.removeItem(deps.key);
        session = null;
        generation++;
        publish();
      };
      const pending = tail.then(work, work);
      tail = pending.catch(() => undefined);
      await pending;
    },
    signOut: async () => {
      await restore();
      const pinned = session;
      if (pinned)
        await request("/v1/auth/logout", {
          method: "POST",
          body: {},
          ownerID: pinned.user.id,
        });
      const work = async () => {
        if (session?.access_token !== pinned?.access_token)
          throw Error("Account changed");
        await deps.storage.removeItem(deps.key);
        session = null;
        generation++;
        publish();
      };
      const pending = tail.then(work, work);
      tail = pending.catch(() => undefined);
      await pending;
    },
  };
}
