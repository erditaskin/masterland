import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import {
  FlatList,
  Image,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import tabBounds from "../../assets/art/city-tabs-v3-bounds.json";
import reference from "../../../data/content-reference.json";
import {
  achievementProgress,
  achievementState,
  achievements,
  name,
  type Achievement,
  type Save,
} from "../game/engine";
import { Button, Label } from "./Controls";
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
          <View
            style={{
              paddingHorizontal: 9,
              height: 24,
              justifyContent: "center",
              borderRadius: 13,
              backgroundColor: "#57980e",
              borderWidth: 1,
              borderColor: "#e7c06d",
              backgroundImage:
                "linear-gradient(180deg, #8bc42b 0%, #438607 100%)",
            }}
          >
            <Label title size={12} color="#fff7dc">
              Ödülü al
            </Label>
          </View>
        ) : state === "claimed" ? (
          <Label title size={21} color={colors.green}>
            ✓
          </Label>
        ) : state === "locked" ? (
          <Label size={10} color={colors.muted}>
            Şehir kilitli
          </Label>
        ) : (
          <View
            style={{
              height: 17,
              width: "100%",
              borderRadius: 9,
              borderWidth: 1,
              borderColor: "#b28d51",
              backgroundColor: "#d9bd8a",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: ((progress / a.target) * 100 + "%") as `${number}%`,
                backgroundColor: "#78ad26",
              }}
            />
            <Label title size={11} style={{ textAlign: "center" }}>
              {progress}/{a.target}
            </Label>
          </View>
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
  onInteract: () => void;
  reduced: boolean;
}) {
  const [active, setActive] = useState(0),
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
      scroll.current?.scrollToOffset({ offset, animated: false }),
    );
    return () => cancelAnimationFrame(frame);
  }, [offset, tileHeight]);
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
      <Label
        title
        size={12}
        style={{ textAlign: "center", height: 25, paddingTop: 5 }}
      >
        Yol devam ediyor ↓
      </Label>
      <View style={{ position: "absolute", right: 0, top: 32, gap: 8 }}>
        {stops.map((stop, i) => (
          <Button
            key={stop.city_id}
            testID={"jump-" + stop.city_id}
            label={name(stop.city_id) + " konumuna git"}
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
                source={require("../../assets/art/city-tabs-v3.png")}
                x={tabBounds[i]![0]!}
                y={tabBounds[i]![1]!}
                w={tabBounds[i]![2]!}
                h={tabBounds[i]![3]!}
                width={42}
                height={66}
              />
            </View>
            <Label
              title
              size={10}
              color={i === 0 ? colors.paper : colors.ink}
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
