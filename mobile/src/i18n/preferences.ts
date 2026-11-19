import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { chooseLanguage, languageStore, type Language } from "./locale";
const KEY = "@masterland/language/v1";
export async function loadLanguage() {
  const saved = await AsyncStorage.getItem(KEY);
  languageStore.set(
    chooseLanguage(
      saved,
      getLocales().map((locale) => locale.languageTag),
    ),
  );
}
export async function setLanguage(language: Language) {
  await AsyncStorage.setItem(KEY, language);
  languageStore.set(language);
}
