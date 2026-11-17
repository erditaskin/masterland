import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { cityThemes } from "./cityTheme";
import { PaperCard } from "./PagePrimitives";
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
import { RouteIcon, rewardText } from "./Achievements";
import { CityCard } from "./CityCard";
import { accountText as tx } from "../i18n/locale";
import { cityScenes } from "./cityScenes";
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
      label={`${name(a.id)}, ${state === "ready" ? "Ödül hazır" : state === "claimed" ? "Alındı" : state === "locked" ? "Kilitli" : progress + "/" + a.target}`}
      onPress={press}
      style={{ width, minHeight: 138, marginBottom: 10 }}
    >
      <PaperCard
        selected={state === "ready"}
        style={{
          width,
          marginBottom: 0,
          ...(state === "ready"
            ? { borderColor: "#34852b", backgroundColor: "#e1f2b3" }
            : {}),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <RouteIcon kind={a.kind} size={76} />
          <View style={{ flex: 1, gap: 8 }}>
            <Label title size={20}>
              {name(a.id)}
            </Label>
            {state === "ready" ? (
              <AppButtonStamp text="Ödül hazır" />
            ) : state === "claimed" ? (
              <Label title color="#34852b">
                ✓ Alındı
              </Label>
            ) : state === "locked" ? (
              <Label size={12}>Şehir kilitli</Label>
            ) : (
              <AppProgress
                value={progress}
                total={a.target}
                label={`${progress}/${a.target}`}
              />
            )}
            <Label size={12}>{rewardText(a)}</Label>
          </View>
        </View>
      </PaperCard>
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
  initialOffset,
  onOffsetChange,
  initialView,
  onViewChange,
}: {
  currentCity: string;
  save: Save;
  width: number;
  height: number;
  onAchievement: (id: string) => void;
  initialOffset?: () => number;
  initialView?: () => { cityID: string; achievements: boolean };
  onViewChange?: (cityID: string, achievements: boolean) => void;
  onOffsetChange: (y: number) => void;
  onReturn: () => void;
  onTravel: (id: string) => void;
  onInteract: () => void;
  reduced: boolean;
}) {
  const [active, setActive] = useState(
    () => initialView?.().cityID ?? currentCity,
  );
  const [showAchievements, setShowAchievements] = useState(
    () => initialView?.().achievements ?? false,
  );
  const stops = useMemo(() => Object.keys(cityThemes), []);
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
    <View style={{ width, height, paddingHorizontal: 2 }}>
      <FlatList
        testID="cityRouteScroll"
        contentOffset={{ x: 0, y: initialOffset?.() ?? 0 }}
        onScroll={(e) => onOffsetChange(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
        data={showAchievements ? [] : stops}
        keyExtractor={(id) => id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        renderItem={({ item: id }) => {
          const r = cityRule(id)!;
          const current = id === currentCity;
          const open = !!save.cities[id];
          const selected = active === id;
          const status = current
            ? "Mevcut Şehir"
            : open
              ? "Açık"
              : r.enabled
                ? `Seviye ${r.level}`
                : "Önizleme";
          return (
            <CityCard
              id={id}
              title={name(id)}
              scene={cityScenes[id]!.source}
              width={width}
              status={status}
              current={current}
              selected={selected}
              action={
                current
                  ? "✓ Buradasın"
                  : open
                    ? "Git"
                    : r.enabled
                      ? "Şehri aç"
                      : "Yakında"
              }
              disabled={
                !current && !open && (!r.enabled || level(save) < r.level)
              }
              onSelect={() => {
                onInteract();
                setActive(id);
                onViewChange?.(id, false);
              }}
              onAction={() => {
                onInteract();
                if (current) onReturn();
                else onTravel(id);
              }}
            />
          );
        }}
        ListHeaderComponent={
          showAchievements ? (
            <View>
              <AppButton
                text="Şehirlere dön"
                tone="secondary"
                onPress={() => {
                  setShowAchievements(false);
                  onViewChange?.(active, false);
                  onOffsetChange(0);
                }}
              />
              <Label title size={22}>
                {name(active)} · Başarılar
              </Label>
            </View>
          ) : undefined
        }
        ListFooterComponent={
          showAchievements ? (
            <View>
              {nodes.map((a) => (
                <RoutePin
                  key={a.id}
                  a={a}
                  save={save}
                  width={width - 4}
                  press={() => onAchievement(a.id)}
                />
              ))}
              {!nodes.length && <Label>Bu şehrin başarıları yakında.</Label>}
            </View>
          ) : (
            <AppButton
              testID="openCityAchievements"
              text={`${name(active)} · Başarılar`}
              tone="secondary"
              onPress={() => {
                setShowAchievements(true);
                onViewChange?.(active, true);
                onOffsetChange(0);
              }}
            />
          )
        }
      />
      {!here && !visited && (
        <View testID={`map-lock-${active}`}>
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
      />
    </View>
  );
}
