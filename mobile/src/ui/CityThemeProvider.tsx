import { createContext, useContext, type ReactNode } from "react";
import { resolveCityTheme, type CityTheme } from "./cityTheme";

const Context = createContext<CityTheme>(resolveCityTheme("city1"));

/** Stable immutable values prevent theme broadcasts on wallet/timer updates. */
export function CityThemeProvider({
  cityID,
  children,
}: {
  cityID: string;
  children: ReactNode;
}) {
  return (
    <Context.Provider value={resolveCityTheme(cityID)}>
      {children}
    </Context.Provider>
  );
}

export function useCityTheme(): CityTheme {
  return useContext(Context);
}
