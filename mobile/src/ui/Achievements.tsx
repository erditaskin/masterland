import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { DesignProgress } from "./DesignProgress";
import { ChromeSprite } from "./GameChrome";
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
import { ActionButton } from "./Controls";
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
  description,
}: {
  description?: string;
  id: string;
  save: Save;
  dispatch: (a: Action) => Result | null;
  onReturn: () => void;
}) {
  const a = achievements.find((entry) => entry.id === id);
  if (!a)
    return (
      <DesignContent end={1300}>
        <DesignText rect={[90, 750, 1026, 200]} size={54}>
          Başarı bulunamadı.
        </DesignText>
      </DesignContent>
    );
  const state = achievementState(save, a),
    progress = Math.min(a.target, achievementProgress(save, a));
  const locale: Record<string, string> = reference.locales.tr;
  const reward = [
    a.reward.title ? name(a.reward.title) + " unvanı" : null,
    a.reward.gold ? `+${a.reward.gold} altın` : null,
    a.reward.gems ? `+${a.reward.gems} elmas` : null,
    a.reward.energy ? `+${a.reward.energy} enerji` : null,
    a.reward.xp ? `+${a.reward.xp} XP` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <DesignContent end={2510}>
      <ChromeSprite index={6} rect={[375, 760, 456, 456]} />
      <DesignText rect={[90, 1245, 1026, 135]} size={80} bold align="center">
        {name(a.id)}
      </DesignText>
      <DesignText rect={[130, 1400, 946, 150]} size={45} align="center">
        {description ?? locale[a.id + "_description_tr"]}
      </DesignText>
      <DesignProgress
        rect={[126, 1580, 954, 52]}
        value={progress}
        total={a.target}
      />
      <PaperCard designRect={[90, 1690, 1026, 300]} />
      <DesignText rect={[126, 1700, 954, 80]} size={52} bold align="center">
        Ödül
      </DesignText>
      <DesignText rect={[126, 1790, 954, 170]} size={49} bold align="center">
        {reward}
      </DesignText>
      <ActionButton
        designRect={[90, 2060, 1026, 132]}
        text={
          state === "claimed"
            ? "✓ Alındı"
            : state === "locked"
              ? "Şehir kilitli"
              : state === "ready"
                ? "Ödülü al"
                : "Devam ediyor"
        }
        testID="claimAchievement"
        disabled={state !== "ready"}
        onPress={() => dispatch({ type: "claim-achievement", id: a.id })}
      />
      <ActionButton
        designRect={[90, 2340, 1026, 132]}
        text="Başarılara dön"
        tone="secondary"
        testID="returnToRoute"
        onPress={onReturn}
      />
    </DesignContent>
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
