/** Immutable visual configuration. City IDs never depend on translated names. */
export interface CityTheme {
  readonly id: string;
  readonly material: "oak" | "ceramic" | "timber" | "stone" | "textile";
  readonly ink: string;
  readonly mutedInk: string;
  readonly paper: string;
  readonly paperLight: string;
  readonly edge: string;
  readonly highlight: string;
  readonly heading: string;
  readonly headingLight: string;
  readonly onHeading: string;
  readonly primary: string;
  readonly primaryLight: string;
  readonly onPrimary: string;
  readonly navSelected: string;
  readonly navSelectedLight: string;
  readonly navSelectedInk: string;
  readonly selected: string;
  readonly selectedInk: string;
}

export const semanticColors = Object.freeze({
  success: "#34852b",
  successLight: "#e1f2b3",
  pending: "#8b652d",
  danger: "#a93929",
  disabled: "#a7aaa9",
  disabledInk: "#f6f5f0",
});

const definitions = {
  city1: {
    navSelected: "#df9c24",
    navSelectedLight: "#ffe6a7",
    navSelectedInk: "#fff3cf",
    material: "oak",
    ink: "#583715",
    mutedInk: "#92744c",
    paper: "#ffe7bd",
    paperLight: "#fff2d9",
    edge: "#b87a37",
    highlight: "#ffe6a8",
    heading: "#865020",
    headingLight: "#c48b42",
    onHeading: "#fff0cc",
    primary: "#367c19",
    primaryLight: "#78b83a",
    onPrimary: "#fff8e3",
    selected: "#b4d568",
    selectedInk: "#315b26",
  },
  city2: {
    navSelected: "#ffd598",
    navSelectedLight: "#fff3d5",
    navSelectedInk: "#773e29",
    material: "ceramic",
    ink: "#63351f",
    mutedInk: "#966a57",
    paper: "#ffe8c8",
    paperLight: "#fff5e4",
    edge: "#bd7653",
    highlight: "#ffe7bb",
    heading: "#a33342",
    headingLight: "#d56966",
    onHeading: "#fff3d9",
    primary: "#a72d40",
    primaryLight: "#de6f7c",
    onPrimary: "#fff8e8",
    selected: "#f8c8ba",
    selectedInk: "#8a2639",
  },
  city3: {
    navSelected: "#007c75",
    navSelectedLight: "#39b6a7",
    navSelectedInk: "#f4fff1",
    material: "timber",
    ink: "#5a3a22",
    mutedInk: "#8a7054",
    paper: "#ffe7c1",
    paperLight: "#fff2da",
    edge: "#ae7948",
    highlight: "#ffe5ac",
    heading: "#71502c",
    headingLight: "#b1844d",
    onHeading: "#fff2d4",
    primary: "#007c75",
    primaryLight: "#39b6a7",
    onPrimary: "#f4fff1",
    selected: "#bee8d4",
    selectedInk: "#06675e",
  },
  city4: {
    navSelected: "#b64d12",
    navSelectedLight: "#ec8b33",
    navSelectedInk: "#fff8e7",
    material: "stone",
    ink: "#58371e",
    mutedInk: "#877462",
    paper: "#ffe6bf",
    paperLight: "#fff2dc",
    edge: "#8c6a52",
    highlight: "#e2d3ba",
    heading: "#504944",
    headingLight: "#80766c",
    onHeading: "#fff1d9",
    primary: "#b64d12",
    primaryLight: "#ec8b33",
    onPrimary: "#fff8e7",
    selected: "#f5d0a3",
    selectedInk: "#8f3c10",
  },
  city5: {
    navSelected: "#603074",
    navSelectedLight: "#a263aa",
    navSelectedInk: "#fff2ce",
    material: "textile",
    ink: "#603c20",
    mutedInk: "#917152",
    paper: "#ffe9c5",
    paperLight: "#fff3db",
    edge: "#bf8e42",
    highlight: "#ffe18e",
    heading: "#512e67",
    headingLight: "#8c518e",
    onHeading: "#fff0c7",
    primary: "#603074",
    primaryLight: "#a263aa",
    onPrimary: "#fff2ce",
    selected: "#e5c9ec",
    selectedInk: "#633379",
  },
} as const;

export const cityThemes: Readonly<Record<string, CityTheme>> = Object.freeze(
  Object.fromEntries(
    Object.entries(definitions).map(([id, palette]) => [
      id,
      Object.freeze({ id, ...palette }),
    ]),
  ),
);

/** Unknown future content stays usable without silently changing a player's city. */
export function resolveCityTheme(cityID: string): CityTheme {
  return cityThemes[cityID] ?? cityThemes.city1!;
}
