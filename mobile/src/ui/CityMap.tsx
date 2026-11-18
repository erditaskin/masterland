import { useMemo, useState, type ReactElement } from "react";
import { FlatList, View } from "react-native";
import { cityThemes } from "./cityTheme";
import { PaperCard } from "./PagePrimitives";
import {
  cityRule,
  level,
  achievementName,
  cityAchievements,
  achievementProgress,
  achievementState,
  name,
  type Achievement,
  type Save,
} from "../game/engine";
import { AppButton, Button, Label } from "./Controls";
import { CityCard } from "./CityCard";
import { cityScenes } from "./cityScenes";
import {
  DesignBox,
  DesignSpace,
  DesignText,
  useDesignSpace,
} from "./DesignSpace";
import { DesignProgress } from "./DesignProgress";
import { ChromeSprite } from "./GameChrome";
import { rewardText } from "./Achievements";

function RoutePin({
  a,
  save,
  press,
}: {
  a: Achievement;
  save: Save;
  press: () => void;
}) {
  const state = achievementState(save, a),
    progress = Math.min(a.target, achievementProgress(save, a));
  const status = {
    ready: "Ödül hazır",
    claimed: "✓ Alındı",
    locked: "Şehir kilitli",
    progress: "Devam ediyor",
  }[state];
  const { scale } = useDesignSpace();
  return (
    <View style={{ width: 1062 * scale, height: 420 * scale }}>
      <DesignSpace scale={scale} x={72} y={712}>
        <PaperCard
          designRect={[90, 730, 1026, 360]}
          selected={state === "ready"}
        />
        <ChromeSprite index={6} rect={[115, 800, 210, 210]} />
        <DesignText rect={[360, 760, 710, 98]} size={56} bold fit>
          {achievementName(a)}
        </DesignText>
        <DesignProgress
          rect={[365, 885, 700, 52]}
          value={progress}
          total={a.target}
        />
        <DesignText
          rect={[360, 945, 710, 62]}
          size={42}
          bold
          color={
            state === "ready" || state === "claimed" ? "#34852b" : undefined
          }
        >
          {status}
        </DesignText>
        <DesignText rect={[360, 1011, 710, 59]} size={33} fit>
          {rewardText(a)}
        </DesignText>
        <DesignBox rect={[90, 730, 1026, 360]}>
          <Button
            testID={"achievement-" + a.id}
            label={`${achievementName(a)}, ${status}`}
            onPress={press}
            style={{ flex: 1 }}
          >
            <View />
          </Button>
        </DesignBox>
      </DesignSpace>
    </View>
  );
}

export function CityAchievementsList({
  cityID,
  save,
  onAchievement,
  footer,
  legacyFirst = false,
}: {
  cityID: string;
  save: Save;
  onAchievement: (id: string) => void;
  footer?: ReactElement;
  legacyFirst?: boolean;
}) {
  const nodes = useMemo(() => {
    const entries = cityAchievements(cityID);
    if (legacyFirst) return entries;
    return entries.sort(
      (a, b) =>
        Number(b.metric.startsWith("city_mastery_")) -
        Number(a.metric.startsWith("city_mastery_")),
    );
  }, [cityID, legacyFirst]);
  return (
    <FlatList
      testID="cityAchievementList"
      data={nodes}
      keyExtractor={(a) => a.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <RoutePin a={item} save={save} press={() => onAchievement(item.id)} />
      )}
      ListFooterComponent={footer}
    />
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
  const { scale } = useDesignSpace();
  const [active, setActive] = useState(
    () => initialView?.().cityID ?? currentCity,
  );
  const [showAchievements, setShowAchievements] = useState(
    () => initialView?.().achievements ?? false,
  );
  const stops = useMemo(() => Object.keys(cityThemes), []);
  const rule = cityRule(active)!,
    here = active === currentCity,
    visited = !!save.cities[active];
  const travelText = here
    ? "Tahtaya dön"
    : visited
      ? "Bu şehre geç"
      : !rule.enabled
        ? "Yakında"
        : `${rule.gold} altınla şehri aç`;
  return (
    <View style={{ width: 1062 * scale, height }}>
      {showAchievements ? (
        <CityAchievementsList
          cityID={active}
          legacyFirst
          save={save}
          onAchievement={onAchievement}
          footer={
            <AppButton
              text="Şehirlere dön"
              tone="secondary"
              onPress={() => {
                setShowAchievements(false);
                onViewChange?.(active, false);
                onOffsetChange(0);
              }}
            />
          }
        />
      ) : (
        <FlatList
          key="cities"
          testID="cityRouteScroll"
          data={stops}
          ItemSeparatorComponent={() => <View style={{ height: 28 * scale }} />}
          keyExtractor={(id) => id}
          contentOffset={{ x: 0, y: initialOffset?.() ?? 0 }}
          onScroll={(e) => onOffsetChange(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: id }) => {
            const r = cityRule(id)!,
              current = id === currentCity,
              open = !!save.cities[id];
            const canUnlock =
              r.enabled && level(save) >= r.level && save.gold >= r.gold;
            return (
              <CityCard
                id={id}
                title={name(id)}
                scene={cityScenes[id]!.source}
                width={width}
                status={
                  current
                    ? "Mevcut Şehir"
                    : open
                      ? "Açık"
                      : r.enabled
                        ? `Seviye ${r.level}`
                        : "Önizleme"
                }
                current={current}
                selected={active === id}
                action={
                  current
                    ? "✓ Buradasın"
                    : open
                      ? "Git"
                      : r.enabled
                        ? canUnlock
                          ? "Şehri aç"
                          : "Kilitli"
                        : "Yakında"
                }
                disabled={!current && !open && !canUnlock}
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
          ListFooterComponent={
            <View>
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
              {!here && !visited && (
                <View testID={`map-lock-${active}`}>
                  <Label size={12}>
                    {!rule.enabled
                      ? "Yakında"
                      : `Seviye ${rule.level} · ${rule.gold} altın`}
                  </Label>
                </View>
              )}
              <AppButton
                testID="travelCity"
                text={travelText}
                disabled={!rule.enabled}
                onPress={() => {
                  onInteract();
                  if (here) onReturn();
                  else onTravel(active);
                }}
              />
            </View>
          }
        />
      )}
    </View>
  );
}
