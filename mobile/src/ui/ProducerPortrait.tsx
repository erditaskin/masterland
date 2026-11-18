import havenBounds from "../../assets/art/haven-items-v1-bounds.json";
import { View } from "react-native";
import { Crop } from "./Art";
import { colors, art } from "./theme";
export function ProducerPortrait({
  index,
  size,
}: {
  index: number;
  size: number;
}) {
  if (index >= 5) {
    const b = havenBounds[36 + index - 5]!;
    return (
      <View style={{ width: size, height: size, overflow: "hidden" }}>
        <Crop
          source={require("../../assets/art/haven-items-v1.png")}
          x={b[0]!}
          y={b[1]!}
          w={b[2]!}
          h={b[3]!}
          width={size}
          height={size}
        />
      </View>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size * 0.72,
        borderRadius: size * 0.2,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.gold,
      }}
    >
      <Crop
        source={art.concept}
        x={128 + index * 130.5}
        y={400}
        w={98}
        h={68}
        width={size}
        height={size * 0.72}
      />
    </View>
  );
}
