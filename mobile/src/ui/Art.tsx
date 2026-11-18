import ironBounds from "../../assets/art/demirdere/item-bounds.json";
import silkBounds from "../../assets/art/ipekyolu/item-bounds.json";
import harborBounds from "../../assets/art/yalikoru/item-bounds.json";
import reference from "../../../data/content-reference.json";
import skaraBounds from "../../assets/art/skara-items-v2-bounds.json";
import candyBounds from "../../assets/art/badinca/candy-bounds.json";
import boardBounds from "../../assets/art/board-item-bounds.json";
import havenBounds from "../../assets/art/haven-items-v1-bounds.json";
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
const badincaItemIDs = new Set(
  reference.city2_opening_plan.producers.flatMap(
    (producer) => producer.chain_item_ids,
  ),
);
const previewItemArtwork = [
  {
    bounds: harborBounds,
    source: require("../../assets/art/yalikoru/items.png"),
  },
  {
    bounds: ironBounds,
    source: require("../../assets/art/demirdere/items.png"),
  },
  {
    bounds: silkBounds,
    source: require("../../assets/art/ipekyolu/items.png"),
  },
].reduce((entries, atlas) => {
  for (const [id, crop] of Object.entries(atlas.bounds))
    entries.set(id, {
      source: atlas.source,
      crop: crop as [number, number, number, number],
    });
  return entries;
}, new Map<string, { source: ImageSourcePropType; crop: [number, number, number, number] }>());
/** One measured crop per canonical item; both board and page views use these layers. */
export function itemArtwork(id: string): {
  source: ImageSourcePropType;
  crop: readonly [number, number, number, number];
} {
  const preview = previewItemArtwork.get(id);
  if (preview) return preview;
  const custom = (
    reference.item_art as Record<string, { sheet: string; index: number }>
  )[id];
  if (custom?.sheet === "candy")
    return {
      source: require("../../assets/art/badinca/candy-items.png"),
      crop: candyBounds[custom.index]! as [number, number, number, number],
    };
  if (custom)
    return {
      source:
        custom.sheet === "skara"
          ? require("../../assets/art/skara-items-v2.png")
          : badincaItemIDs.has(id)
            ? require("../../assets/art/badinca/items.png")
            : require("../../assets/art/haven-items-v1.png"),
      crop: (custom.sheet === "skara" ? skaraBounds : havenBounds)[
        custom.index
      ]! as [number, number, number, number],
    };
  const p = product(id),
    approved = p.producer < 4 && p.tier <= 2;
  const kind = approved ? "approved" : "products",
    index = approved
      ? p.producer * 2 + p.tier - 1
      : p.producer * 4 + p.tier - 1;
  return {
    source:
      id === "item50"
        ? require("../../assets/art/flour-packet-v1.png")
        : art[kind],
    crop: (id === "item50" ? flourBounds : itemBounds[kind][index]!) as [
      number,
      number,
      number,
      number,
    ],
  };
}
export function boardItemArtwork(id: string): ReturnType<typeof itemArtwork> {
  const artwork = itemArtwork(id);
  const crop = (boardBounds as Record<string, number[]>)[id];
  return crop
    ? { source: artwork.source, crop: crop as [number, number, number, number] }
    : artwork;
}
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
  const { source, crop } = itemArtwork(id),
    ratio = crop[2] / crop[3];
  const w = Math.min(width, height * ratio),
    h = w / ratio;
  return (
    <View
      pointerEvents="none"
      style={{ width, height, alignItems: "center", justifyContent: "center" }}
    >
      <Crop
        source={source}
        x={crop[0]}
        y={crop[1]}
        w={crop[2]}
        h={crop[3]}
        width={w}
        height={h}
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
