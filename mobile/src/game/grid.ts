/** Shared geometry for the new, clean-start board. */
export const BOARD_COLUMNS = 7;
export const BOARD_ROWS = 9;
export const BOARD_CAPACITY = BOARD_COLUMNS * BOARD_ROWS;
export const BOARD_LAYOUT_VERSION = 2 as const;

export const BELENYAKA_COLUMNS = 6;

export function usesStandardCityLayout(cityID: string): boolean {
  return ["city1", "city2", "city3", "city4", "city5"].includes(cityID);
}

export function boardColumns(cityID: string): number {
  return usesStandardCityLayout(cityID) ? BELENYAKA_COLUMNS : BOARD_COLUMNS;
}

export function boardCapacity(cityID: string): number {
  return boardColumns(cityID) * BOARD_ROWS;
}
