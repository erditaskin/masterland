import { useMemo, useState } from "react";
import { Animated, ImageBackground, View } from "react-native";
import reference from "../../../data/content-reference.json";
import { name } from "../game/engine";
import { Button, Label } from "./Controls";
import { StatusIcon } from "./StatusIcon";
import { colors } from "./theme";

/** City art is decorative; labels, availability and touch targets stay native. */
export function CityMap({
  currentCity,
  onReturn,
  onInteract,
  reduced,
}: {
  currentCity: string;
  onReturn: () => void;
  onInteract: () => void;
  reduced: boolean;
}) {
  const [inspected, setInspected] = useState<string | null>(null);
  const opacity = useMemo(() => new Animated.Value(1), []);
  const locale: Record<string, string> = reference.locales.tr;
  return (
    <View>
      <Label
        size={12}
        color={colors.muted}
        style={{ textAlign: "center", marginBottom: 12 }}
      >
        Yolun yeni şehirlere uzanıyor.
      </Label>
      <ImageBackground
        source={require("../../assets/art/world-map-v1.png")}
        resizeMode="cover"
        testID="cityMap"
        style={{
          width: "100%",
          aspectRatio: 2 / 3,
          overflow: "hidden",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.outline,
          backgroundColor: "#547349",
        }}
      >
        {reference.ui.city_map.stops.map((stop) => {
          const destination = reference.cities.find(
            (c) => c.id === stop.city_id,
          )!;
          const here = destination.id === currentCity && stop.travel_enabled;
          const selected = inspected === destination.id;
          return (
            <View
              key={destination.id}
              style={{
                position: "absolute",
                left: `${stop.left * 100}%`,
                top: `${stop.top * 100}%`,
                width: "62%",
              }}
            >
              <Button
                testID={`map-${destination.id}`}
                label={`${name(destination.id)}, ${here ? "Buradasın, tahtaya dön" : "Kilitli, açılma seviyesini göster"}`}
                onPress={() => {
                  if (here) {
                    onReturn();
                    return;
                  }
                  onInteract();
                  opacity.stopAnimation();
                  opacity.setValue(reduced ? 1 : 0);
                  setInspected(destination.id);
                  Animated.timing(opacity, {
                    toValue: 1,
                    duration: reduced ? 0 : 130,
                    useNativeDriver: true,
                  }).start();
                }}
                style={{
                  minHeight: 45,
                  borderRadius: 13,
                  borderWidth: 1.3,
                  borderColor: here ? colors.goldLight : colors.gold,
                  backgroundColor: here ? "#183e4bf5" : "#182b40f2",
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  shadowColor: "#172416",
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  {!here && <StatusIcon kind="lock" />}
                  <Label title size={17} color={colors.goldLight}>
                    {name(destination.id)}
                  </Label>
                </View>
                <Label size={10} color={colors.goldLight}>
                  {here ? "Buradasın · Tahtaya dön" : locale[stop.role_key]}
                </Label>
              </Button>
              {selected && !here && (
                <Animated.View
                  style={{
                    opacity,
                    backgroundColor: "#fff0d8fa",
                    borderColor: colors.gold,
                    borderWidth: 1,
                    borderRadius: 9,
                    paddingVertical: 7,
                    paddingHorizontal: 6,
                    marginTop: 4,
                  }}
                  accessible
                  accessibilityRole="alert"
                  accessibilityLabel={`${name(destination.id)}: ${destination.unlock_level}. seviyede açılacak.`}
                  testID={`map-lock-${destination.id}`}
                >
                  <Label size={12} style={{ textAlign: "center" }}>
                    {destination.unlock_level}. seviyede açılacak.
                  </Label>
                </Animated.View>
              )}
            </View>
          );
        })}
      </ImageBackground>
    </View>
  );
}
