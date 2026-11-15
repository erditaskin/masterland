import { memo } from "react";
import { Image, View, type ImageSourcePropType } from "react-native";
import { art } from "./theme";
import { product } from "../game/engine";
import flourBounds from "../../assets/art/flour-packet-v1-bounds.json";
import itemBounds from "../../assets/art/item-bounds.json";
function dimensions(source: ImageSourcePropType) {
  const m = Image.resolveAssetSource(source);
  if (!m?.width || !m.height) throw Error("Eksik görsel boyutu.");
  return { width: m.width, height: m.height };
}
export const Crop = memo(function Crop({
  source,
  x,
  y,
  w,
  h,
  width,
  height,
}: {
  source: ImageSourcePropType;
  x: number;
  y: number;
  w: number;
  h: number;
  width: number;
  height: number;
}) {
  const meta = dimensions(source),
    sx = width / w,
    sy = height / h;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{ width, height, overflow: "hidden" }}
    >
      <Image
        source={source}
        resizeMode="stretch"
        fadeDuration={0}
        style={{
          position: "absolute",
          width: meta.width * sx,
          height: meta.height * sy,
          left: -x * sx,
          top: -y * sy,
        }}
      />
    </View>
  );
});
export const Sprite = memo(function Sprite({
  kind,
  index,
  size,
}: {
  kind: "icons" | "approved" | "products";
  index: number;
  size: number;
}) {
  const source = art[kind],
    m = dimensions(source),
    rows = kind === "products" ? 5 : 2,
    x = Math.round(((index % 4) * m.width) / 4),
    y = Math.round((Math.floor(index / 4) * m.height) / rows),
    w = Math.round((((index % 4) + 1) * m.width) / 4) - x,
    h = Math.round(((Math.floor(index / 4) + 1) * m.height) / rows) - y;
  return (
    <Crop source={source} x={x} y={y} w={w} h={h} width={size} height={size} />
  );
});
/** Trim metadata is measured offline; objects keep their native aspect and soft edge. */
export const Item = memo(function Item({
  id,
  size,
  width = size,
  height = size,
}: {
  id: string;
  size: number;
  width?: number;
  height?: number;
}) {
  const p = product(id),
    approved = p.producer < 4 && p.tier <= 2;
  const kind = approved ? "approved" : "products";
  const index = approved
    ? p.producer * 2 + p.tier - 1
    : p.producer * 4 + p.tier - 1;
  const flourPacket = id === "item50";
  const rect = flourPacket ? flourBounds : itemBounds[kind][index]!;
  const ratio = rect[2]! / rect[3]!,
    drawWidth = Math.min(width, height * ratio),
    drawHeight = drawWidth / ratio;
  return (
    <View
      pointerEvents="none"
      style={{ width, height, alignItems: "center", justifyContent: "center" }}
    >
      <Crop
        source={
          flourPacket
            ? require("../../assets/art/flour-packet-v1.png")
            : art[kind]
        }
        x={rect[0]!}
        y={rect[1]!}
        w={rect[2]!}
        h={rect[3]!}
        width={drawWidth}
        height={drawHeight}
      />
    </View>
  );
});
export function Reference({
  x,
  y,
  w,
  h,
  width,
  height,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  width: number;
  height: number;
}) {
  const m = dimensions(art.reference);
  return (
    <Crop
      source={art.reference}
      x={(x * m.width) / 933}
      y={(y * m.height) / 1686}
      w={(w * m.width) / 933}
      h={(h * m.height) / 1686}
      width={width}
      height={height}
    />
  );
}
