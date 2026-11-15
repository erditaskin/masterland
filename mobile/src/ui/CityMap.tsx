import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Animated, ImageBackground, ScrollView, View } from "react-native";
import reference from "../../../data/content-reference.json";
import {
  achievementProgress,
  achievementState,
  achievements,
  name,
  type Save,
} from "../game/engine";
import { Button, Label } from "./Controls";
import { AchievementIcon } from "./Achievements";
import { StatusIcon } from "./StatusIcon";
import { ParchmentPanel } from "./Skin";
import { colors } from "./theme";

/** One continuous route; native quest nodes and city shortcuts remain interactive. */
export function CityMap({
  currentCity,
  save,
  height,
  onAchievement,
  initialOffset = () => 0,
  onOffsetChange,
  onReturn,
  onInteract,
  reduced,
}: {
  currentCity: string;
  save: Save;
  height: number;
  onAchievement: (id: string) => void;
  initialOffset?: () => number;
  onOffsetChange: (y: number) => void;
  onReturn: () => void;
  onInteract: () => void;
  reduced: boolean;
}) {
  const [inspected, setInspected] = useState<{
    region: number;
    quest: number | null;
  } | null>(null);
  const [mapWidth, setMapWidth] = useState(300),
    [active, setActive] = useState(0);
  const activeRef = useRef(0),
    scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const opacity = useMemo(() => new Animated.Value(1), []);
  const [restoreOffset] = useState(initialOffset);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      scroll.current?.scrollTo({ y: restoreOffset, animated: false }),
    );
    return () => cancelAnimationFrame(frame);
  }, [mapWidth, restoreOffset]);
  const regionHeight = mapWidth * 1.6;
  const stops = reference.ui.city_map.stops;
  const palette = reference.ui.city_map.region_colors;
  const locale: Record<string, string> = reference.locales.tr;
  const inspect = (region: number, quest: number | null) => {
    onInteract();
    setInspected({ region, quest });
    opacity.stopAnimation();
    opacity.setValue(reduced ? 1 : 0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduced ? 0 : 130,
      useNativeDriver: true,
    }).start();
  };
  const destination = inspected
    ? reference.cities.find((c) => c.id === stops[inspected.region]!.city_id)!
    : null;
  return (
    <View
      style={{
        height,
        backgroundColor: "#d9bc89",
        borderWidth: 1,
        borderColor: "#b18a51",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: "#eee0bd",
          paddingVertical: 9,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderColor: colors.gold,
        }}
      >
        <Label title size={19} color={colors.ink}>
          {name(stops[active]!.city_id)}
        </Label>
        <Label size={11} color={colors.muted}>
          {locale[stops[active]!.role_key]} · Özel başarılar
        </Label>
      </View>
      <ScrollView
        ref={scroll}
        testID="cityRouteScroll"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          onOffsetChange(e.nativeEvent.contentOffset.y);
          const next = Math.min(
            2,
            Math.max(
              0,
              Math.floor(
                (e.nativeEvent.contentOffset.y +
                  e.nativeEvent.layoutMeasurement.height / 2) /
                  regionHeight,
              ),
            ),
          );
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        }}
        onLayout={(e) => {
          setMapWidth(e.nativeEvent.layout.width);
        }}
      >
        <ImageBackground
          source={require("../../assets/art/world-map-v2.png")}
          resizeMode="cover"
          testID="cityMap"
          style={{ width: "100%", height: regionHeight * 3 }}
        >
          {stops.map((stop, i) => {
            const here = stop.city_id === currentCity && stop.travel_enabled;
            return (
              <View
                key={stop.city_id}
                style={{
                  position: "absolute",
                  top: i * regionHeight,
                  left: 0,
                  right: 0,
                  height: regionHeight,
                }}
              >
                <Button
                  testID={`map-${stop.city_id}`}
                  label={`${name(stop.city_id)}, ${here ? "Buradasın, tahtaya dön" : "Kilitli, açılma seviyesini göster"}`}
                  onPress={() => (here ? onReturn() : inspect(i, null))}
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    right: 57,
                    minHeight: 43,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.gold,
                    backgroundColor: "transparent",
                    padding: 5,
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: -5,
                      top: -5,
                      width: mapWidth - 69,
                      height: 44,
                    }}
                  >
                    <ParchmentPanel width={mapWidth - 69} height={44} />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {!here && <StatusIcon kind="lock" />}
                    <Label title size={18} color={colors.ink}>
                      {name(stop.city_id)}
                    </Label>
                  </View>
                  <Label size={10} color={colors.muted}>
                    {here ? "Buradasın · Tahtaya dön" : "Kilitli şehir"}
                  </Label>
                </Button>
                {achievements
                  .filter((a) => a.city_id === stop.city_id)
                  .map((a, j, list) => {
                    const state = achievementState(save, a),
                      progress = Math.min(
                        a.target,
                        achievementProgress(save, a),
                      );
                    const nodeWidth = (mapWidth - 68) / 2;
                    return (
                      <Button
                        key={a.id}
                        testID={`achievement-${a.id}`}
                        label={`${name(a.id)}, ${state === "ready" ? "Ödül hazır" : state === "claimed" ? "Alındı" : state === "locked" ? "Kilitli" : `${progress}/${a.target}`}`}
                        onPress={() => onAchievement(a.id)}
                        style={{
                          position: "absolute",
                          top:
                            85 +
                            (j * (regionHeight - 160)) /
                              Math.max(1, list.length - 1),
                          left: j % 2 === 0 ? 8 : mapWidth - 56 - nodeWidth,
                          width: nodeWidth,
                          height: 67,
                          padding: 6,
                          borderRadius: 13,
                          borderWidth: 0,
                          borderColor:
                            state === "ready" ? "#fff0a3" : colors.gold,
                          backgroundColor: "transparent",
                          shadowColor: "#101722",
                          shadowOpacity: 0.28,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                        }}
                      >
                        <View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            left: -6,
                            top: -6,
                            width: nodeWidth,
                            height: 67,
                          }}
                        >
                          <ParchmentPanel width={nodeWidth} height={67} />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <View
                            style={{ opacity: state === "locked" ? 0.5 : 1 }}
                          >
                            <AchievementIcon kind={a.kind} size={34} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Label title size={10.5} color={colors.ink}>
                              {name(a.id)}
                            </Label>
                            <Label
                              size={9}
                              color={
                                state === "ready"
                                  ? "#925715"
                                  : state === "claimed"
                                    ? colors.green
                                    : colors.muted
                              }
                            >
                              {state === "ready"
                                ? "Ödül hazır"
                                : state === "claimed"
                                  ? "Alındı ✓"
                                  : state === "locked"
                                    ? "Şehir kilitli"
                                    : `${progress} / ${a.target}`}
                            </Label>
                          </View>
                        </View>
                        {(state === "ready" || state === "claimed") && (
                          <View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              right: -5,
                              bottom: -4,
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#c4815e",
                              backgroundColor:
                                state === "claimed" ? "#3c7051" : "#974536",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Label size={9} color="#ffe4ac">
                              {state === "claimed" ? "✓" : "◆"}
                            </Label>
                          </View>
                        )}
                        <View
                          style={{
                            width: "100%",
                            height: 3,
                            borderRadius: 2,
                            marginTop: 4,
                            backgroundColor: "#c9b28a",
                          }}
                        >
                          <View
                            style={{
                              height: 3,
                              borderRadius: 2,
                              width: `${state === "locked" ? 0 : (progress / a.target) * 100}%`,
                              backgroundColor:
                                state === "ready" ? "#ffd260" : "#78b983",
                            }}
                          />
                        </View>
                      </Button>
                    );
                  })}
              </View>
            );
          })}
        </ImageBackground>
      </ScrollView>
      <View style={{ position: "absolute", right: 5, top: 75, gap: 7 }}>
        {stops.map((s, i) => (
          <Button
            key={s.city_id}
            testID={`jump-${s.city_id}`}
            label={`${name(s.city_id)} konumuna git`}
            onPress={() => {
              onInteract();
              setInspected(null);
              scroll.current?.scrollTo({
                y: i * regionHeight,
                animated: false,
              });
            }}
            style={{
              width: 43,
              minHeight: 47,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: active === i ? colors.goldLight : colors.gold,
              backgroundColor: palette[i],
              padding: 3,
            }}
          >
            <Label title size={15} color={colors.goldLight}>
              {i + 1}
            </Label>
            <Label size={8} color={colors.goldLight}>
              {name(s.city_id).split(" ")[0]}
            </Label>
          </Button>
        ))}
      </View>
      {inspected && destination && (
        <Animated.View
          accessible={inspected.region !== 0}
          accessibilityRole="alert"
          accessibilityLabel={
            inspected.region !== 0
              ? `${name(destination.id)}: ${destination.unlock_level}. seviyede açılacak.`
              : undefined
          }
          testID={
            inspected.region !== 0
              ? `map-lock-${destination.id}`
              : "map-quest-detail"
          }
          style={{
            opacity,
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            padding: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.gold,
            backgroundColor: "#fff0d8fa",
          }}
        >
          <Label title size={16}>
            {name(destination.id)}
          </Label>
          <Label size={12}>
            {inspected.region !== 0
              ? `${destination.unlock_level}. seviyede açılacak.`
              : "Özel başarılarını yol kenarındaki sandıklardan incele."}
          </Label>
        </Animated.View>
      )}
    </View>
  );
}
