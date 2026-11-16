import reference from "../../../data/content-reference.json";
import english from "../../../data/locales/en.json";
import ui from "../../../data/locales/ui-en.json";
import { languageStore } from "./locale";
// Existing UI uses source-language messages. Translate at its shared text boundary while new flows use explicit messages.
const phrases: Record<string, string> = { ...ui };
for (const [key, source] of Object.entries(reference.locales.tr)) {
  const target = (english as Record<string, string>)[key.replace(/_tr$/, "")];
  if (target && target !== source) phrases[source] = target;
}
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const replacements = Object.entries(phrases)
  .sort(([a], [b]) => b.length - a.length)
  .map(([source, target]) => ({
    expression: new RegExp(
      (/^\p{L}/u.test(source) ? "(?<![\\p{L}\\p{N}_])" : "") +
        escape(source) +
        (/\p{L}$/u.test(source) ? "(?![\\p{L}\\p{N}_])" : ""),
      "gu",
    ),
    target,
  }));
const cache = new Map<string, string>();
export function displayText(
  source: string,
  language = languageStore.get(),
): string {
  if (language === "tr" || !source.trim() || !/\p{L}/u.test(source))
    return source;
  const cached = cache.get(source);
  if (cached !== undefined) return cached;
  let value = source.replace(/\s+/g, " ");
  value = value
    .replace(/(\d+)\.\s*seviyede açılacak\./g, "Unlocks at level $1.")
    .replace(/(\d+)\. seviye gerekiyor\./g, "Requires level $1.")
    .replace(/100’e ([\d:]+)/g, "100 in $1")
    .replace(/(.+) şehrine hoş geldin\./g, "Welcome to $1.");
  value = value
    .replace(/([\d.,]+) altın gerekiyor\./g, "Requires $1 gold.")
    .replace(/([\d.,]+) elmas gerekiyor\./g, "Requires $1 gems.")
    .replace(/([\d.,]+) altınla şehri aç/g, "Unlock city for $1 gold")
    .replace(/([\d.,]+) altınla aç/g, "Unlock for $1 gold");
  const exact = phrases[value.trim()];
  if (exact) value = value.replace(value.trim(), exact);
  else
    for (const { expression, target } of replacements)
      value = value.replace(expression, () => target);
  if (cache.size >= 1024) cache.clear();
  cache.set(source, value);
  return value;
}
