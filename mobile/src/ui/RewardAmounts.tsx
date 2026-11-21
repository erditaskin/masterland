import { View } from "react-native";
import { accountText } from "../i18n/locale";
import { Crop, Sprite } from "./Art";
import { Label } from "./Controls";
import { DesignBox, useDesignSpace, type DesignRect } from "./DesignSpace";

type Amounts = { energy?: number; gold?: number; gems?: number; xp?: number };

export function XpRewardIcon({ size }: { size: number }) {
  return <Crop source={require("../../assets/art/achievement-icons-v1.png")}
    x={627} y={627} w={627} h={627} width={size} height={size} />;
}

export function RewardAmounts({ reward, size = 16 }: { reward: Amounts; size?: number }) {
  const entries = [
    [reward.energy, 5, accountText("enerji", "energy")],
    [reward.gold, 6, accountText("altın", "gold")],
    [reward.gems, 7, accountText("elmas", "gems")],
    [reward.xp, null, "XP"],
  ] as const;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: size * 0.45 }}>
      {entries.map(([value, icon, name]) => value ? (
        <View accessible accessibilityLabel={`${value} ${name}`} key={name} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          {icon === null ? <XpRewardIcon size={size} /> : <Sprite kind="icons" index={icon} size={size} />}
          <Label title size={size}>{value}</Label>
        </View>
      ) : null)}
    </View>
  );
}

export function DesignRewardAmounts({ reward, rect, size }: {
  reward: Amounts; rect: DesignRect; size: number;
}) {
  const { scale } = useDesignSpace();
  return <DesignBox rect={rect} style={{ justifyContent: "center" }}>
    <RewardAmounts reward={reward} size={size * scale} />
  </DesignBox>;
}
