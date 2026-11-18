import reference from "../../../data/content-reference.json";
import english from "../../../data/locales/en.json";
export type Language = "tr" | "en";
let current: Language = "tr";
const listeners = new Set<() => void>();
export const languageStore = {
  get: () => current,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  set: (language: Language) => {
    if (current === language) return;
    current = language;
    listeners.forEach((listener) => listener());
  },
};
export function contentText(key: string, language = current): string {
  if (language === "en") return (english as Record<string, string>)[key] ?? key;
  return (reference.locales.tr as Record<string, string>)[`${key}_tr`] ?? key;
}
export const contentName = (id: string) => contentText(`${id}_name`);
export function chooseLanguage(
  saved: string | null,
  deviceLanguages: readonly string[],
): Language {
  if (saved === "en" || saved === "tr") return saved;
  return deviceLanguages[0]?.toLowerCase().split(/[-_]/)[0] === "tr"
    ? "tr"
    : "en";
}
export function accountText(tr: string, en: string): string {
  return current === "tr" ? tr : en;
}

export function cityAchievementsTitle(
  city: string,
  language = current,
): string {
  return language === "tr" ? `${city} Başarıları` : `${city} Achievements`;
}

export function earnedAchievementsLabel(
  count: number,
  language = current,
): string {
  return language === "tr"
    ? `${count} kazanım`
    : `${count} ${count === 1 ? "achievement" : "achievements"} earned`;
}
