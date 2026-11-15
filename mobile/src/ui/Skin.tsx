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
    b = Math.min(inset, w / 2, h / 2),
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
  cellAspect: 1,
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
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <SkinPanel
        texture={require("../../assets/art/skara-ui-chrome-v1.png")}
        rect={[32, 520, 808, 1115]}
        width={width}
        height={height}
        inset={20}
        center={false}
      />
    </View>
  );
});

/** Curled vellum skin for maps, achievements and small reward scrolls. */
export const ParchmentPanel = memo(function ParchmentPanel({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <SkinPanel
      texture={require("../../assets/art/parchment-v1.png")}
      rect={[0, 0, 1024, 1536]}
      width={width}
      height={height}
      inset={180}
    />
  );
});

/** Shared blank production skins; all labels remain live native text. */
export function PagePaper({
  width,
  height,
  rolled = false,
}: {
  width: number;
  height: number;
  rolled?: boolean;
}) {
  return rolled ? (
    <SkinPanel
      texture={require("../../assets/art/map-scroll-v3.png")}
      rect={[4, 92, 842, 1682]}
      width={width}
      height={height}
      inset={160}
    />
  ) : (
    <SkinPanel
      texture={require("../../assets/art/page-frame-v2.png")}
      rect={[0, 0, 1024, 1536]}
      width={width}
      height={height}
      inset={96}
    />
  );
}
export function TitlePlaque({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, top: 0, width, height }}
    >
      <Crop
        source={require("../../assets/art/title-plaque-v2.png")}
        x={60}
        y={130}
        w={2050}
        h={440}
        width={width}
        height={height}
      />
    </View>
  );
}

/** Shared carved oak tray; native buttons and labels stay independent of artwork. */
export function WoodTray({ width, height }: { width: number; height: number }) {
  return (
    <SkinPanel
      texture={require("../../assets/art/carved-wood-rail-v1.png")}
      rect={[6, 138, 2160, 437]}
      width={width}
      height={height}
      inset={120}
    />
  );
}
export function CityWoodSign({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Crop
        source={require("../../assets/art/carved-city-sign-v1.png")}
        x={61}
        y={126}
        w={2047}
        h={472}
        width={width}
        height={height}
      />
    </View>
  );
}
