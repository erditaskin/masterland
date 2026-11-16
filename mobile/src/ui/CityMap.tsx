import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import {
  FlatList,
  Image,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import tabBounds from "../../assets/art/city-tabs-v4-bounds.json";
import reference from "../../../data/content-reference.json";
import {
  cityRule,
  level,
  achievementProgress,
  achievementState,
  achievements,
  name,
  type Achievement,
  type Save,
} from "../game/engine";
import {
  AppButton,
  AppButtonStamp,
  AppProgress,
  Button,
  Label,
} from "./Controls";
import { RouteIcon } from "./Achievements";
import { Crop } from "./Art";
import { routeSections } from "./layout";
import { colors } from "./theme";
const maps = [
  require("../../assets/art/skara-route-v2.png"),
  require("../../assets/art/haven-route-v2.png"),
  require("../../assets/art/cove-route-v2.png"),
];
type Chunk = {
  id: string;
  region: number;
  first: boolean;
  nodes: typeof achievements;
};
function RoutePin({
  a,
  save,
  width,
  press,
}: {
  a: Achievement;
  save: Save;
  width: number;
  press: () => void;
}) {
  const state = achievementState(save, a),
    progress = Math.min(a.target, achievementProgress(save, a));
  return (
    <Button
      testID={"achievement-" + a.id}
      label={
        name(a.id) +
        ", " +
        (state === "ready"
          ? "Ödül hazır"
          : state === "claimed"
            ? "Alındı"
            : state === "locked"
              ? "Kilitli"
              : progress + "/" + a.target)
      }
      onPress={press}
      style={{ width, height: 145 }}
    >
      <Image
        pointerEvents="none"
        source={require("../../assets/art/route-card-v2.png")}
        resizeMode="stretch"
        style={{ position: "absolute", left: 0, top: 18, width, height: 126 }}
      />
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: (width - 56) / 2 }}
      >
        <RouteIcon kind={a.kind} size={56} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 64,
          alignItems: "center",
        }}
      >
        <Label title size={13} style={{ textAlign: "center", marginBottom: 7 }}>
          {name(a.id)}
        </Label>
        {state === "ready" ? (
          <AppButtonStamp text="Ödülü al" />
        ) : state === "claimed" ? (
          <Label title size={21} color={colors.green}>
            ✓
          </Label>
        ) : state === "locked" ? (
          <Label size={10} color={colors.muted}>
            Şehir kilitli
          </Label>
        ) : (
          <AppProgress
            value={progress}
            total={a.target}
            label={`${progress}/${a.target}`}
          />
        )}
      </View>
    </Button>
  );
}
/** Reusable full-height city tiles and virtualized achievement sections keep the route readable. */
export function CityMap({
  currentCity,
  save,
  width,
  height,
  onAchievement,
  initialOffset = () => 0,
  onOffsetChange,
  onReturn,
  onTravel,
  onInteract,
}: {
  currentCity: string;
  save: Save;
  width: number;
  height: number;
  onAchievement: (id: string) => void;
  initialOffset?: () => number;
  onOffsetChange: (y: number) => void;
  onReturn: () => void;
  onTravel: (id: string) => void;
  onInteract: () => void;
  reduced: boolean;
}) {
  const [active, setActive] = useState(
      Math.max(
        0,
        reference.ui.city_map.stops.findIndex((s) => s.city_id === currentCity),
      ),
    ),
    [inspected, setInspected] = useState<number | null>(null);
  const [offset] = useState(initialOffset);
  const scroll = useRef<ComponentRef<typeof FlatList<Chunk>>>(null);
  const stops = reference.ui.city_map.stops;
  const chunks = useMemo(() => {
    const order = reference.ui.city_map.achievement_order;
    const ordered = [...achievements].sort((a, b) => {
      const ai = order.indexOf(a.id),
        bi = order.indexOf(b.id);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
    return routeSections(stops, ordered);
  }, [stops]);
  const plotWidth = width - 67;
  const tileHeight = (plotWidth * 1230) / 675;
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      scroll.current?.scrollToOffset({
        offset:
          offset ||
          Math.max(
            0,
            chunks.findIndex((c) => stops[c.region]?.city_id === currentCity),
          ) * tileHeight,
        animated: false,
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [offset, tileHeight, chunks, stops, currentCity]);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onOffsetChange(e.nativeEvent.contentOffset.y);
    const index = Math.min(
      chunks.length - 1,
      Math.max(
        0,
        Math.floor((e.nativeEvent.contentOffset.y + 50) / tileHeight),
      ),
    );
    setActive(chunks[index]!.region);
  };
  const activeStop = stops[active]!,
    here = activeStop.city_id === currentCity && activeStop.travel_enabled;
  const rule = cityRule(activeStop.city_id)!;
  const visited = !!save.cities[activeStop.city_id];
  const travelText = here
    ? "Tahtaya dön"
    : visited
      ? "Bu şehre geç"
      : !rule.enabled
        ? `Seviye ${rule.level} · Yakında`
        : level(save) < rule.level
          ? `Seviye ${rule.level} · ${rule.gold} altın`
          : `${rule.gold} altınla şehri aç`;
  const travel = () => {
    onInteract();
    if (here) onReturn();
    else if (rule.enabled) onTravel(rule.id);
    else setInspected(active);
  };
  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Button
        testID={"map-" + activeStop.city_id}
        label={
          name(activeStop.city_id) +
          (here
            ? ", Buradasın, tahtaya dön"
            : ", Kilitli, açılma seviyesini göster")
        }
        onPress={() => {
          onInteract();
          if (here) onReturn();
          else setInspected(active);
        }}
        style={{ height: 22, marginBottom: 4 }}
      >
        <Label title size={13} color={colors.ink}>
          {name(activeStop.city_id)} · Özel Başarılar
        </Label>
      </Button>
      <View
        testID="cityMapViewport"
        style={{
          flex: 1,
          marginLeft: 7,
          marginRight: 60,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <FlatList
          ref={scroll}
          data={chunks}
          keyExtractor={(item) => item.id}
          testID="cityRouteScroll"
          onScroll={onScroll}
          scrollEventThrottle={32}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
          getItemLayout={(_, i) => ({
            length: tileHeight,
            offset: i * tileHeight,
            index: i,
          })}
          renderItem={({ item }) => {
            const nodeWidth = plotWidth * 0.44;
            return (
              <View style={{ height: tileHeight, overflow: "hidden" }}>
                {item.region === 0 ? (
                  <Crop
                    source={require("../../assets/art/canonical-map-clean-v1.png")}
                    x={31}
                    y={320}
                    w={675}
                    h={1230}
                    width={plotWidth}
                    height={tileHeight}
                  />
                ) : (
                  <Image
                    pointerEvents="none"
                    source={maps[item.region]}
                    resizeMode="cover"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: plotWidth,
                      height: tileHeight,
                    }}
                  />
                )}
                {item.nodes.map((a, j) => (
                  <View
                    key={a.id}
                    style={{
                      position: "absolute",
                      top: ([17, 330, 580, 860][j]! * plotWidth) / 675,
                      left: Math.min(
                        plotWidth - nodeWidth - 2,
                        ([87, 374, 137, 400][j]! * plotWidth) / 675,
                      ),
                    }}
                  >
                    <RoutePin
                      a={a}
                      save={save}
                      width={nodeWidth}
                      press={() => onAchievement(a.id)}
                    />
                  </View>
                ))}
              </View>
            );
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 7,
            backgroundImage:
              "linear-gradient(90deg, #f9e8c8 0%, #f9e8c800 100%)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 7,
            backgroundImage:
              "linear-gradient(270deg, #f9e8c8 0%, #f9e8c800 100%)",
          }}
        />
      </View>
      <AppButton
        testID="travelCity"
        text={travelText}
        onPress={travel}
        tone={here || visited ? "primary" : "secondary"}
        style={{ marginTop: 5, marginLeft: 7, marginRight: 60 }}
      />
      <View style={{ position: "absolute", right: 0, top: 32, gap: 8 }}>
        {stops.map((stop, i) => (
          <Button
            key={stop.city_id}
            testID={"jump-" + stop.city_id}
            label={name(stop.city_id) + " konumuna git"}
            selected={active === i}
            onPress={() => {
              onInteract();
              setInspected(null);
              const index = chunks.findIndex((c) => c.region === i);
              scroll.current?.scrollToOffset({
                offset: index * tileHeight,
                animated: false,
              });
              setActive(i);
            }}
            style={{
              width: 42,
              height: 66,
            }}
          >
            <View
              pointerEvents="none"
              style={{ position: "absolute", inset: 0 }}
            >
              <Crop
                source={require("../../assets/art/city-tabs-v4.png")}
                x={tabBounds[i + (active === i ? 3 : 0)]![0]!}
                y={tabBounds[i + (active === i ? 3 : 0)]![1]!}
                w={tabBounds[i + (active === i ? 3 : 0)]![2]!}
                h={tabBounds[i + (active === i ? 3 : 0)]![3]!}
                width={42}
                height={66}
              />
            </View>
            <Label
              title
              size={10}
              color={active === i ? colors.paper : colors.ink}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 10,
                textAlign: "center",
              }}
            >
              {i === 1
                ? name(stop.city_id).split(" ").at(-1)
                : name(stop.city_id).split(" ")[0]}
            </Label>
          </Button>
        ))}
      </View>
      {inspected !== null && (
        <View
          testID={"map-lock-" + stops[inspected]!.city_id}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={
            name(stops[inspected]!.city_id) +
            ": " +
            reference.cities.find((c) => c.id === stops[inspected]!.city_id)!
              .unlock_level +
            ". seviyede açılacak."
          }
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            padding: 12,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: colors.gold,
            borderRadius: 12,
          }}
        >
          <Label title>{name(stops[inspected]!.city_id)}</Label>
          <Label size={12}>
            {
              reference.cities.find((c) => c.id === stops[inspected]!.city_id)!
                .unlock_level
            }
            . seviyede açılacak.
          </Label>
        </View>
      )}
    </View>
  );
}
