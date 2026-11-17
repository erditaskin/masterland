import { View } from "react-native";
import reference from "../../../data/content-reference.json";
import {
  achievementProgress,
  achievementState,
  achievements,
  name,
  type Achievement,
  type Action,
  type Result,
  type Save,
} from "../game/engine";
import { Crop } from "./Art";
import { ActionButton, AppProgress, Label } from "./Controls";
import { colors } from "./theme";
import { useCityTheme } from "./CityThemeProvider";
import { PaperCard } from "./PagePrimitives";
export function AchievementIcon({
  kind,
  size = 40,
}: {
  kind: string;
  size?: number;
}) {
  const index = { title: 0, gift: 1, energy: 2, xp: 3 }[kind] ?? 1;
  return (
    <Crop
      source={require("../../assets/art/achievement-icons-v1.png")}
      x={(index % 2) * 627}
      y={Math.floor(index / 2) * 627}
      w={627}
      h={627}
      width={size}
      height={size}
    />
  );
}
export function rewardText(a: Achievement) {
  const r = a.reward;
  return [
    r.capacity ? `+${r.capacity} kapasite` : null,
    r.energy ? `+${r.energy} enerji` : null,
    r.gold ? `${r.gold} altın` : null,
    r.gems ? `${r.gems} elmas` : null,
    r.xp ? `${r.xp} XP` : null,
    r.title ? name(r.title) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
export function AchievementDetails({
  id,
  save,
  dispatch,
  onReturn,
}: {
  id: string;
  save: Save;
  dispatch: (a: Action) => Result | null;
  onReturn: () => void;
}) {
  const theme = useCityTheme();
  const a = achievements.find((a) => a.id === id)!;
  const state = achievementState(save, a),
    progress = Math.min(a.target, achievementProgress(save, a));
  const locale: Record<string, string> = reference.locales.tr;
  return (
    <View style={{ alignItems: "center", paddingVertical: 12 }}>
      <View
        style={{
          width: 132,
          height: 132,
          borderRadius: 66,
          backgroundColor: theme.paperLight,
          borderWidth: 2,
          borderColor: theme.edge,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <AchievementIcon kind={a.kind} size={106} />
      </View>
      <Label title size={24} style={{ textAlign: "center" }}>
        {name(a.id)}
      </Label>
      <Label
        size={13}
        tone="muted"
        style={{ textAlign: "center", marginVertical: 12 }}
      >
        {locale[a.id + "_description_tr"]}
      </Label>
      {state === "locked" ? (
        <Label size={14}>
          {reference.cities.find((c) => c.id === a.city_id)?.unlock_level}.
          seviyede açılacak.
        </Label>
      ) : (
        <>
          <Label size={14}>
            {progress} / {a.target} ·{" "}
            {state === "claimed"
              ? "Ödül alındı"
              : state === "ready"
                ? "Ödülün hazır"
                : "Devam ediyor"}
          </Label>
          <View style={{ marginVertical: 12, width: "100%" }}>
            <AppProgress value={progress} total={a.target} />
          </View>
          <PaperCard style={{ width: "100%", marginVertical: 12 }}>
            <Label title size={17} style={{ marginBottom: 8 }}>
              Ödül
            </Label>
            <Label size={14}>{rewardText(a)}</Label>
            {a.reward.capacity && (
              <Label size={11} tone="muted" style={{ marginTop: 8 }}>
                100 enerjiyi geçince üreticiye basılı tutarak 2x–4x gücü
                seçebilirsin.
              </Label>
            )}
          </PaperCard>
          {state === "ready" && (
            <ActionButton
              text="Ödülü al"
              testID="claimAchievement"
              onPress={() => {
                dispatch({ type: "claim-achievement", id: a.id });
              }}
            />
          )}
          {state === "claimed" && (
            <View
              style={{
                minHeight: 54,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Label title size={18} color={colors.green}>
                Alındı ✓
              </Label>
            </View>
          )}
        </>
      )}
      <ActionButton
        text="Başarılara dön"
        testID="returnToRoute"
        onPress={onReturn}
      />
    </View>
  );
}

export function RouteIcon({
  kind,
  size = 56,
}: {
  kind: string;
  size?: number;
}) {
  const rects: number[][] = require("../../assets/art/route-icons-v2-bounds.json");
  const rect =
    rects[
      ({ gift: 0, title: 1, xp: 2, energy: 3 } as Record<string, number>)[
        kind
      ] ?? 0
    ]!;
  const ratio = rect[2]! / rect[3]!,
    width = Math.min(size, size * ratio),
    height = width / ratio;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Crop
        source={require("../../assets/art/route-icons-v2.png")}
        x={rect[0]!}
        y={rect[1]!}
        w={rect[2]!}
        h={rect[3]!}
        width={width}
        height={height}
      />
    </View>
  );
}
