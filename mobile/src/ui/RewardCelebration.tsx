import { RewardFireworks } from "./RewardFireworks";
import { RewardAmounts } from "./RewardAmounts";
import { accountText } from "../i18n/locale";
import { RouteIcon } from "./Achievements";
import { useEffect } from "react";
import { Image, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  ZoomIn,
} from "react-native-reanimated";
import {
  achievementName,
  achievements,
  type RewardNotice,
} from "../game/engine";
import { ActionButton, Label } from "./Controls";
import { Item, Sprite } from "./Art";
import { ModalCard } from "./ModalCard";
export function RewardCelebration({
  notice,
  dismiss,
  reduced,
  hideDiscovery = false,
}: {
  notice: RewardNotice;
  dismiss: () => void;
  reduced: boolean;
  hideDiscovery?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const small = notice.kind === "discovery";
  const achievement =
    notice.kind === "achievement"
      ? achievements.find((entry) => notice.id === `achievement-${entry.id}`)
      : undefined;
  const reachedLevel =
    notice.kind === "level" ? notice.id.slice("level-".length) : null;
  const title = reachedLevel
    ? accountText(
        `${reachedLevel}. seviyeye ulaştın!`,
        `You reached level ${reachedLevel}!`,
      )
    : achievement
      ? achievementName(achievement)
      : notice.title;
  useEffect(() => {
    if (!small) return;
    const timer = setTimeout(dismiss, 2000);
    return () => clearTimeout(timer);
  }, [notice.id, small, dismiss]);
  if (small && hideDiscovery) return null;
  const w = Math.min(width - 32, 360);
  const portraitHeight = Math.min(132, height * 0.18);
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
        backgroundColor: small ? "transparent" : "#071619cc",
      }}
    >
      <Animated.View
        key={notice.id}
        entering={
          reduced
            ? undefined
            : small
              ? FadeIn.duration(160)
              : ZoomIn.duration(240)
        }
        exiting={reduced ? undefined : FadeOut.duration(120)}
        style={{
          width: w,
        }}
      >
        {!small && (
          <View
            pointerEvents="none"
            accessible={false}
            style={{ height: portraitHeight, marginBottom: -8 }}
          >
            {!reduced && <RewardFireworks width={w} />}
            <Animated.View
              entering={reduced ? undefined : FadeInUp.duration(270)}
              style={{ position: "absolute", inset: 0, alignItems: "center" }}
            >
              <Image
                source={require("../../assets/art/tutorial/reward-celebration-duo.png")}
                style={{ width: "86%", height: portraitHeight + 2 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        )}
        <ModalCard reduced compact={small}>
          <View style={{ alignItems: "center", gap: small ? 4 : 12 }}>
            {small ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                {notice.itemID && <Item id={notice.itemID} size={55} />}
                <View style={{ flex: 1 }}>
                  <Label title size={18}>
                    {title}
                  </Label>
                  <RewardAmounts reward={notice} size={12} />
                </View>
              </View>
            ) : (
              <>
                {notice.kind === "level" ? (
                  <View
                    style={{
                      borderRadius: 44,
                      borderWidth: 3,
                      borderColor: "#f7c66c",
                      backgroundColor: "#214963",
                      width: 86,
                      height: 86,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Label title size={37} color="#fff1bb">
                      {reachedLevel}
                    </Label>
                  </View>
                ) : notice.ornament ? (
                  <RouteIcon kind={notice.ornament} size={72} />
                ) : (
                  <Sprite kind="icons" index={6} size={72} />
                )}
                <Label title size={25} style={{ textAlign: "center" }}>
                  {title}
                </Label>
                {!!notice.message && (
                  <Label size={13} style={{ textAlign: "center" }}>
                    {notice.message}
                  </Label>
                )}
                <RewardAmounts
                  reward={notice}
                  size={notice.kind === "level" ? 28 : 16}
                />
                <ActionButton
                  text={
                    notice.kind === "level"
                      ? accountText("Devam et", "Continue")
                      : "Harika!"
                  }
                  testID="dismissReward"
                  onPress={dismiss}
                />
              </>
            )}
          </View>
        </ModalCard>
      </Animated.View>
    </View>
  );
}
