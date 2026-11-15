import { memo } from "react";
import { PixelRatio, View, type ImageSourcePropType } from "react-native";
import { Crop } from "./Art";
const source = require("../../assets/art/skin-reference.png");
export type Rect = readonly [number, number, number, number];
export const SkinCrop = memo(function SkinCrop({
  rect,
  width,
  height,
}: {
  rect: Rect;
  width: number;
  height: number;
}) {
  return (
    <Crop
      source={source}
      x={rect[0]}
      y={rect[1]}
      w={rect[2]}
      h={rect[3]}
      width={width}
      height={height}
    />
  );
});
/** Nine source regions keep painted corner radii intact while live content changes. */
export const SkinPanel = memo(function SkinPanel({
  rect,
  width,
  height,
  inset = 12,
  fill,
  center = true,
  texture = source,
}: {
  rect: Rect;
  width: number;
  height: number;
  inset?: number;
  fill?: string;
  center?: boolean;
  texture?: ImageSourcePropType;
}) {
  const [x, y, w, h] = rect,
    b = inset,
    k = Math.min(width / w, height / h),
    edge = PixelRatio.roundToNearestPixel(
      Math.min(b * k, width / 3, height / 3),
    );
  const sx = [x, x + b, x + w - b],
    sy = [y, y + b, y + h - b],
    sw = [b, w - 2 * b, b],
    sh = [b, h - 2 * b, b];
  const dx = [0, edge, width - edge],
    dy = [0, edge, height - edge],
    dw = [edge, width - 2 * edge, edge],
    dh = [edge, height - 2 * edge, edge];
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        backgroundColor: fill,
        borderRadius: texture === source ? edge : undefined,
        overflow: texture === source ? "hidden" : "visible",
      }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3,
          row = Math.floor(i / 3);
        if (i === 4 && !center) return null;
        return (
          <View
            key={i}
            style={{ position: "absolute", left: dx[col], top: dy[row] }}
          >
            <Crop
              source={texture}
              x={sx[col]!}
              y={sy[row]!}
              w={sw[col]!}
              h={sh[row]!}
              width={dw[col]!}
              height={dh[row]!}
            />
          </View>
        );
      })}
    </View>
  );
});
export const skin = {
  cell: [185, 904, 121, 80] as Rect,
  // Uniform cell pitch derived from the full 732 x 710 reference grid (6 x 8).
  cellAspect: 732 / 6 / (710 / 8),
  board: [40, 531, 777, 754] as Rect,
  plaque: [316, 177, 215, 43] as Rect,
} as const;

/** Transparent center and outside keep this frame safe over any live page. */
export const BoardFrame = memo(function BoardFrame({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <SkinPanel
      texture={require("../../assets/art/board-frame-v11.png")}
      rect={[27, 43, 969, 1459]}
      width={width}
      height={height}
      inset={80}
      center={false}
    />
  );
});
