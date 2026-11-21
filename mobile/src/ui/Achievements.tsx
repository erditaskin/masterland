import { DesignRewardAmounts } from "./RewardAmounts";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { DesignProgress } from "./DesignProgress";
import { ChromeSprite } from "./GameChrome";
import { View } from "react-native";
import {
  achievementName,
  achievementProgress,
  achievementProfessionNames,
  achievementRequirementProgress,
  achievementState,
  achievements,
  name,
  type Achievement,
  type Action,
  type Result,
  type Save,
} from "../game/engine";
import { accountText, contentText } from "../i18n/locale";
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
  const requirementText =
    a.metric === "city_mastery_combo"
      ? achievementProfessionNames(a)
          .map((profession, index) => {
            const requirement = a.requirements![index]!;
            return `${profession} ${Math.min(requirement.target, achievementRequirementProgress(save, a, requirement))}/${requirement.target}`;
          })
          .join(" · ")
      : null;
  const details =
    a.metric === "city_mastery_profession"
      ? accountText(
          `${name(a.city_id)} şehrinde bu mesleğe ait ${a.target} ilan teslim et.`,
          `Deliver ${a.target} orders for this profession in ${name(a.city_id)}.`,
        )
      : a.metric === "city_mastery_combo"
        ? accountText(
            "Şehrin tüm mesleklerinde bu seviyeye ulaş.",
            "Reach this rank in every profession in the city.",
          )
        : contentText(a.id + "_description");
  return (
    <DesignContent end={2510}>
      <ChromeSprite index={6} rect={[435, 750, 336, 336]} />
      <DesignText
        rect={[90, 1110, 1026, 135]}
        size={80}
        bold
        fit
        align="center"
      >
        {achievementName(a)}
      </DesignText>
      <DesignText rect={[130, 1400, 946, 150]} size={45} align="center">
        {description ?? details}
      </DesignText>
      {requirementText && (
        <DesignText rect={[130, 1534, 946, 44]} size={37} fit align="center">
          {requirementText}
        </DesignText>
      )}
      <DesignProgress
        rect={[126, 1580, 954, 52]}
        value={progress}
        total={a.target}
      />
      <PaperCard designRect={[90, 1690, 1026, 300]} />
      <DesignText rect={[126, 1700, 954, 80]} size={52} bold align="center">
        Ödül
      </DesignText>
      {a.reward.title && <DesignText rect={[126, 1780, 954, 62]} size={36} fit bold align="center">{name(a.reward.title)}</DesignText>}
      <DesignRewardAmounts rect={[126, 1845, 954, 100]} size={45} reward={a.reward} />
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
