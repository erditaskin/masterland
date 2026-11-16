import { useMemo, useState } from "react";
import { FlatList, Image, View } from "react-native";
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
import { colors } from "./theme";
import { accountText as tx, languageStore } from "../i18n/locale";
import { cityScenes, upcomingCities } from "./cityScenes";
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
/** City selection is explicit; scrolling achievements never changes the selected city. */
export function CityMap({
  currentCity,
  save,
  width,
  height,
  onAchievement,
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
  const [active, setActive] = useState(currentCity);
  const stops = reference.ui.city_map.stops;
  const nodes = useMemo(
    () => achievements.filter((a) => a.city_id === active),
    [active],
  );
  const rule = cityRule(active)!;
  const here = active === currentCity;
  const visited = !!save.cities[active];
  const text = here
    ? tx("Tahtaya dön", "Back to board")
    : visited
      ? tx("Bu şehre geç", "Travel here")
      : !rule.enabled
        ? tx("Yakında", "Coming soon")
        : level(save) < rule.level
          ? tx(
              `Seviye ${rule.level} · ${rule.gold} altın`,
              `Level ${rule.level} · ${rule.gold} gold`,
            )
          : tx(`${rule.gold} altınla şehri aç`, `Unlock for ${rule.gold} gold`);
  return (
    <View style={{ width, height, paddingHorizontal: 7, gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {stops.map((stop) => {
          const scene = cityScenes[stop.city_id]!;
          const selected = active === stop.city_id;
          return (
            <Button
              key={stop.city_id}
              testID={"jump-" + stop.city_id}
              label={name(stop.city_id)}
              selected={selected}
              onPress={() => {
                onInteract();
                setActive(stop.city_id);
              }}
              style={{ flex: 1, height: 85 }}
            >
              <View
                pointerEvents="none"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? "#e8b650" : "#ab8258",
                  backgroundColor: scene.color,
                }}
              >
                <Crop
                  source={scene.source}
                  x={0}
                  y={0}
                  w={875}
                  h={300}
                  width={(width - 30) / 3}
                  height={52}
                />
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Label title size={11} color="#fff1cd">
                    {name(stop.city_id)}
                  </Label>
                </View>
              </View>
            </Button>
          );
        })}
      </View>
      <View
        testID="cityMapViewport"
        style={{
          flex: 1,
          borderRadius: 13,
          overflow: "hidden",
          backgroundColor: "#58321e",
        }}
      >
        <Image
          source={require("../../assets/art/city-achievement-wood-v1.png")}
          resizeMode="cover"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.85,
          }}
        />
        <FlatList
          key={active}
          testID="cityRouteScroll"
          data={nodes}
          numColumns={2}
          keyExtractor={(a) => a.id}
          showsVerticalScrollIndicator
          contentContainerStyle={{ padding: 10 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Label title size={19} color="#ffe7ad">
                {name(active)}
              </Label>
              <Label size={12} color="#f4d8ad">
                {tx("Özel başarılar", "Special achievements")}
              </Label>
            </View>
          }
          renderItem={({ item }) => (
            <RoutePin
              a={item}
              save={save}
              width={(width - 44) / 2}
              press={() => {
                onInteract();
                onAchievement(item.id);
              }}
            />
          )}
          ListFooterComponent={
            <View style={{ marginTop: 16, gap: 9 }}>
              <Label title size={16} color="#ffe7ad">
                {tx("Yeni ufuklar · Yakında", "New horizons · Coming soon")}
              </Label>
              {upcomingCities.map((c) => (
                <View
                  key={c.reference}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: "#fff0cc12",
                    borderWidth: 1,
                    borderColor: "#d5ac6444",
                  }}
                >
                  <Label title color="#f8dda0">
                    {languageStore.get() === "tr" ? c.tr : c.en}
                  </Label>
                  <Label size={11} color="#e7c9a0">
                    {tx("Yakında", "Coming soon")}
                  </Label>
                </View>
              ))}
            </View>
          }
        />
      </View>
      {!rule.enabled && (
        <View testID={"map-lock-" + active}>
          <Label size={12}>
            {tx("Bu şehir yakında açılacak.", "This city is coming soon.")}
          </Label>
        </View>
      )}
      {rule.enabled && !visited && !here && (
        <View testID={"map-lock-" + active}>
          <Label size={12}>{text}</Label>
        </View>
      )}
      <AppButton
        testID="travelCity"
        text={text}
        disabled={!rule.enabled}
        onPress={() => {
          onInteract();
          if (here) onReturn();
          else onTravel(active);
        }}
        style={{ marginBottom: 4 }}
      />
    </View>
  );
}
