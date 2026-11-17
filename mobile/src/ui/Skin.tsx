import { memo } from "react";
import { PixelRatio, View, type ImageSourcePropType } from "react-native";
import { Crop } from "./Art";
import { useCityTheme } from "./CityThemeProvider";
import { cityArt } from "./cityArt";
import frameBounds from "../../assets/art/cities-v1/frame-bounds.json";
import chromeBounds from "../../assets/art/cities-v1/chrome-bounds.json";
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
  edgeSize,
}: {
  rect: Rect;
  width: number;
  height: number;
  inset?: number;
  fill?: string;
  center?: boolean;
  texture?: ImageSourcePropType;
  edgeSize?: number;
}) {
  const [x, y, w, h] = rect,
    b = Math.min(inset, w / 2, h / 2),
    k = Math.min(width / w, height / h),
    edge = PixelRatio.roundToNearestPixel(
      Math.min(edgeSize ?? b * k, width / 3, height / 3),
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
  inset = 8,
}: {
  width: number;
  height: number;
  inset?: number;
}) {
  const theme = useCityTheme();
  const rect = (frameBounds as Record<string, number[]>)[theme.id]!;
  return (
    <SkinPanel
      texture={cityArt[theme.id]!.frame}
      rect={rect as unknown as Rect}
      width={width}
      height={height}
      inset={128}
      edgeSize={inset * 1.8}
      center={false}
    />
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
export const PagePaper = memo(function PagePaper({
  width,
  height,
  rolled: _rolled = false,
}: {
  width: number;
  height: number;
  rolled?: boolean;
}) {
  const theme = useCityTheme();
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{ position: "absolute", inset: 0, width, height }}
    >
      <View
        style={{
          position: "absolute",
          inset: 5,
          borderRadius: 16,
          backgroundColor: theme.paper,
          backgroundImage: `linear-gradient(135deg, ${theme.paperLight} 0%, ${theme.paper} 100%)`,
        }}
      />
      <BoardFrame width={width} height={height} />
    </View>
  );
});

export const TitlePlaque = memo(function TitlePlaque({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const theme = useCityTheme();
  const rect = (chromeBounds as Record<string, number[][]>)[theme.id]![0]!;
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Crop
        source={cityArt[theme.id]!.chrome}
        x={rect[0]!}
        y={rect[1]!}
        w={rect[2]!}
        h={rect[3]!}
        width={width}
        height={height}
      />
    </View>
  );
});

/** Shared material tray: controls stay native and independent of artwork. */
export const WoodTray = memo(function WoodTray({
  width,
  height,
  variant = "navigation",
}: {
  width: number;
  height: number;
  variant?: "navigation" | "producer";
}) {
  const theme = useCityTheme();
  const rect = (chromeBounds as Record<string, number[][]>)[theme.id]![
    variant === "navigation" ? 1 : 2
  ]!;
  return (
    <SkinPanel
      texture={cityArt[theme.id]!.chrome}
      rect={rect as unknown as Rect}
      width={width}
      height={height}
      inset={72}
    />
  );
});

export const CityWoodSign = TitlePlaque;
