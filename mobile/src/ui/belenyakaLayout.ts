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

export function producerTileMetrics(
  shelf: DesignRect,
  producerCount: number,
  standard: boolean,
) {
  const visibleSlots = Math.min(6, Math.max(1, producerCount));
  const inset = standard ? 48 : 0;
  const gap = standard ? 14 : 18;
  const top = standard ? 10 : 0;
  return {
    inset,
    gap,
    top,
    width: (shelf[2] - 2 * inset - (visibleSlots - 1) * gap) / visibleSlots,
    height: shelf[3] - 2 * top,
  };
}

export function producerFaceRect(
  [x, y, width, height]: DesignRect,
  standard: boolean,
): DesignRect {
  return [x + 3, y + 2, width - 6, height * (standard ? 0.79 : 0.69)];
}
