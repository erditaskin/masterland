import type { DesignRect } from "./DesignSpace";
import layout from "../../assets/art/belenyaka-html/layout.json";

export const belenyakaLayout = layout;

export function belenyakaRect(
  rect: readonly number[],
  width: number,
  height: number,
): DesignRect {
  const yScale = (height * 1206) / (width * 2622);
  return [rect[0]!, rect[1]! * yScale, rect[2]!, rect[3]! * yScale];
}
