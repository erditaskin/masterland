type SecureStorage = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};
interface Manifest {
  generation: string;
  count: number;
}
function manifest(raw: string | null): Manifest | null {
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !("generation" in value) ||
    !("count" in value) ||
    typeof value.generation !== "string" ||
    !/^[a-zA-Z0-9-]+$/.test(value.generation) ||
    typeof value.count !== "number" ||
    !Number.isInteger(value.count) ||
    value.count < 1 ||
    value.count > 128
  )
    throw Error("Invalid secure session manifest");
  return value as Manifest;
}
/** Commit the manifest only after all encrypted chunks exist; failed writes retain the previous session. */
export function createSecureSessionStorage(
  storage: SecureStorage,
  newID: () => string,
) {
  let tail: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = tail.then(work, work);
    tail = next.catch(() => undefined);
    return next;
  };
  const chunkKey = (key: string, value: Manifest, index: number) =>
    `${key}.${value.generation}.${index}`;
  const clean = async (key: string, value: Manifest | null) => {
    if (value)
      await Promise.all(
        Array.from({ length: value.count }, (_, i) =>
          storage
            .deleteItemAsync(chunkKey(key, value, i))
            .catch(() => undefined),
        ),
      );
  };
  return {
    getItem: (key: string) =>
      serial(async () => {
        const value = manifest(await storage.getItemAsync(key));
        if (!value) return null;
        const chunks = await Promise.all(
          Array.from({ length: value.count }, (_, i) =>
            storage.getItemAsync(chunkKey(key, value, i)),
          ),
        );
        if (chunks.some((c) => c === null))
          throw Error("Incomplete secure session");
        return chunks.join("");
      }),
    setItem: (key: string, text: string) =>
      serial(async () => {
        // JSON auth sessions are predominantly ASCII. 400 UTF-16 units also stay below 2 KB for Unicode.
        const chunks: string[] = [];
        let chunk = "";
        for (const point of text) {
          if (chunk.length + point.length > 400) {
            chunks.push(chunk);
            chunk = "";
          }
          chunk += point;
        }
        chunks.push(chunk);
        if (chunks.length > 128) throw Error("Secure session too large");
        const previous = manifest(await storage.getItemAsync(key));
        const next = { generation: newID(), count: chunks.length };
        try {
          for (let i = 0; i < chunks.length; i++)
            await storage.setItemAsync(chunkKey(key, next, i), chunks[i]!);
          await storage.setItemAsync(key, JSON.stringify(next));
        } catch (error) {
          await clean(key, next);
          throw error;
        }
        await clean(key, previous);
      }),
    removeItem: (key: string) =>
      serial(async () => {
        const previous = manifest(await storage.getItemAsync(key));
        await storage.deleteItemAsync(key);
        await clean(key, previous);
      }),
  };
}
