import { Children, useSyncExternalStore } from "react";
import { Text, type TextProps } from "react-native";
import { languageStore } from "../i18n/locale";
import { displayText } from "../i18n/display";
/** Shared native text boundary keeps legacy UI and accessibility messages in the selected language. */
export function I18nText({ children, ...props }: TextProps) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  return (
    <Text {...props}>
      {Children.map(children, (child) =>
        typeof child === "string" ? displayText(child, language) : child,
      )}
    </Text>
  );
}
