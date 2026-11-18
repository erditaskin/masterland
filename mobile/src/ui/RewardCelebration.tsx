import { RouteIcon } from "./Achievements";
import { useEffect } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  achievementName,
  achievements,
  type RewardNotice,
} from "../game/engine";
import { ActionButton, Label } from "./Controls";
import { Item, Sprite } from "./Art";
import { PagePaper } from "./Skin";
export function RewardCelebration({
  notice,
  dismiss,
  reduced,
}: {
  notice: RewardNotice;
  dismiss: () => void;
  reduced: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const small = notice.kind === "discovery";
  const achievement =
    notice.kind === "achievement"
      ? achievements.find((entry) => notice.id === `achievement-${entry.id}`)
      : undefined;
  const title = achievement ? achievementName(achievement) : notice.title;
  useEffect(() => {
    if (!small) return;
    const timer = setTimeout(dismiss, 2000);
    return () => clearTimeout(timer);
  }, [notice.id, small, dismiss]);
  const w = Math.min(width - 32, 360),
    h = small ? 100 : 330;
  const rewards = [
    notice.gold ? `+${notice.gold} altın` : "",
    notice.gems ? `+${notice.gems} elmas` : "",
    notice.energy ? `+${notice.energy} enerji` : "",
    notice.xp ? `+${notice.xp} XP` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <View
      testID="rewardCelebration"
      pointerEvents={small ? "none" : "auto"}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        justifyContent: small ? "flex-end" : "center",
        alignItems: "center",
        paddingBottom: small ? Math.max(80, height * 0.1) : 0,
        backgroundColor: small ? "transparent" : "#10241988",
      }}
    >
      <Animated.View
        key={notice.id}
        entering={reduced ? undefined : FadeIn.duration(160)}
        exiting={reduced ? undefined : FadeOut.duration(120)}
        style={{
          width: w,
          minHeight: h,
          padding: small ? 16 : 28,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <PagePaper width={w} height={h} rolled />
        {small ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {notice.itemID && <Item id={notice.itemID} size={55} />}
            <View style={{ flex: 1 }}>
              <Label title size={18}>
                {title}
              </Label>
              <Label size={12}>{rewards}</Label>
            </View>
          </View>
        ) : (
          <>
            {notice.ornament ? (
              <RouteIcon kind={notice.ornament} size={72} />
            ) : (
              <Sprite
                kind="icons"
                index={notice.kind === "level" ? 5 : 6}
                size={72}
              />
            )}
            <Label title size={25} style={{ textAlign: "center" }}>
              {title}
            </Label>
            {!!notice.message && (
              <Label size={13} style={{ textAlign: "center" }}>
                {notice.message}
              </Label>
            )}
            <Label size={16} style={{ textAlign: "center" }}>
              {rewards}
            </Label>
            <ActionButton
              text="Harika!"
              testID="dismissReward"
              onPress={dismiss}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
}
