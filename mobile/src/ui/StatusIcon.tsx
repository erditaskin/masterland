import { View } from "react-native";
import { Sprite } from "./Art";
import { colors } from "./theme";
export function StatusIcon({
  kind,
}: {
  kind: "lock" | "clock" | "energy" | "gold";
}) {
  if (kind === "energy" || kind === "gold")
    return <Sprite kind="icons" index={kind === "energy" ? 5 : 6} size={14} />;
  return (
    <View
      pointerEvents="none"
      style={{
        width: 13,
        height: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {kind === "lock" ? (
        <>
          <View
            style={{
              position: "absolute",
              top: 1,
              width: 7,
              height: 8,
              borderWidth: 1.3,
              borderColor: colors.goldLight,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 6,
              width: 10,
              height: 7,
              backgroundColor: colors.goldLight,
              borderRadius: 1.5,
            }}
          />
        </>
      ) : (
        <>
          <View
            style={{
              width: 12,
              height: 12,
              borderWidth: 1.3,
              borderColor: colors.goldLight,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 3,
              left: 6,
              width: 1,
              height: 4,
              backgroundColor: colors.goldLight,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              width: 3,
              height: 1,
              backgroundColor: colors.goldLight,
            }}
          />
        </>
      )}
    </View>
  );
}
