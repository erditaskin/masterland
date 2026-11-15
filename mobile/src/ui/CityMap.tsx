import { useMemo, useRef, useState, type ComponentRef } from "react";
import { Animated, ImageBackground, ScrollView, View } from "react-native";
import reference from "../../../data/content-reference.json";
import { city, intro, name, product, type Save } from "../game/engine";
import { Button, Label } from "./Controls";
import { StatusIcon } from "./StatusIcon";
import { colors } from "./theme";

/** One continuous route; native quest nodes and city shortcuts remain interactive. */
export function CityMap({
  currentCity,
  save,
  height,
  onOrders,
  onReturn,
  onInteract,
  reduced,
}: {
  currentCity: string;
  save: Save;
  height: number;
  onOrders: () => void;
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
  const chosen =
    inspected?.region === 0 && inspected.quest !== null
      ? intro[inspected.quest]
      : null;
  return (
    <View
      style={{
        height,
        backgroundColor: palette[active],
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingVertical: 9,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderColor: colors.gold,
        }}
      >
        <Label title size={19} color={colors.goldLight}>
          {name(stops[active]!.city_id)}
        </Label>
        <Label size={11} color={colors.goldLight}>
          {locale[stops[active]!.role_key]}
        </Label>
      </View>
      <ScrollView
        ref={scroll}
        testID="cityRouteScroll"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const next = Math.min(
            2,
            Math.max(
              0,
              Math.floor(
                (e.nativeEvent.contentOffset.y +
                  e.nativeEvent.layoutMeasurement.height / 2) /
                  mapWidth,
              ),
            ),
          );
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        }}
        onLayout={(e) => setMapWidth(e.nativeEvent.layout.width)}
      >
        <ImageBackground
          source={require("../../assets/art/world-map-v2.png")}
          resizeMode="cover"
          testID="cityMap"
          style={{ width: "100%", height: mapWidth * 3 }}
        >
          {stops.map((stop, i) => {
            const here = stop.city_id === currentCity && stop.travel_enabled;
            return (
              <View
                key={stop.city_id}
                style={{
                  position: "absolute",
                  top: i * mapWidth,
                  left: 0,
                  right: 0,
                  height: mapWidth,
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
                    backgroundColor: palette[i] + "ef",
                    padding: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {!here && <StatusIcon kind="lock" />}
                    <Label title size={18} color={colors.goldLight}>
                      {name(stop.city_id)}
                    </Label>
                  </View>
                  <Label size={10} color={colors.goldLight}>
                    {here ? "Buradasın · Tahtaya dön" : "Kilitli şehir"}
                  </Label>
                </Button>
                {(i === 0 ? intro : [null, null, null]).map((q, j) => {
                  const done = i === 0 && j < city(save).introIndex;
                  const current = i === 0 && j === city(save).introIndex;
                  const locked = i !== 0 || j > city(save).introIndex;
                  const total = i === 0 ? intro.length : 3;
                  const x = 0.3 + Math.sin(j * 1.7) * 0.18;
                  return (
                    <Button
                      key={q?.id ?? j}
                      testID={`map-step-${stop.city_id}-${j}`}
                      label={
                        q
                          ? `${j + 1}. ilan, ${done ? "Tamamlandı" : locked ? "Kilitli, önceki ilanları tamamla" : q.requirements.map((r) => `${r.quantity} ${product(r.item_id).name}`).join(", ")}`
                          : `${name(stop.city_id)}, kilitli aşama ${j + 1}`
                      }
                      onPress={() => inspect(i, j)}
                      style={{
                        position: "absolute",
                        top: mapWidth * (0.26 + (j / total) * 0.67),
                        left: mapWidth * x,
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        borderWidth: 2,
                        borderColor: current ? "#fff3ab" : colors.gold,
                        backgroundColor: done
                          ? "#377b46"
                          : locked
                            ? "#425061"
                            : "#173b48",
                        shadowColor: "#000",
                        shadowOpacity: 0.22,
                        shadowRadius: 3,
                        shadowOffset: { width: 0, height: 2 },
                      }}
                    >
                      {!locked ? (
                        <Label title size={17} color={colors.goldLight}>
                          {done ? "✓" : j + 1}
                        </Label>
                      ) : (
                        <StatusIcon kind="lock" />
                      )}
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
              scroll.current?.scrollTo({ y: i * mapWidth, animated: false });
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
              : chosen?.requirements
                  .map((r) => `${r.quantity} ${product(r.item_id).name}`)
                  .join(" + ")}
          </Label>
          {chosen && (
            <Label size={11} color={colors.muted}>
              {inspected.quest! < city(save).introIndex
                ? "Tamamlandı"
                : inspected.quest! > city(save).introIndex
                  ? "Önceki ilanları tamamlayınca açılacak."
                  : "Şu anki ilanın"}
            </Label>
          )}
          {chosen && inspected.quest === city(save).introIndex && (
            <Button
              label="İlanlara git"
              testID="map-openOrders"
              onPress={onOrders}
              style={{
                minHeight: 44,
                marginTop: 5,
                borderRadius: 8,
                backgroundColor: palette[0],
              }}
            >
              <Label size={13} color={colors.goldLight}>
                İlanlara git · {chosen.gold} altın · {chosen.xp} XP
              </Label>
            </Button>
          )}
        </Animated.View>
      )}
    </View>
  );
}
