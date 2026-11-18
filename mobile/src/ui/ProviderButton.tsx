import { Image, Text, View } from "react-native";
import type { LoginProvider } from "../account/auth";
import { Button } from "./Controls";
import { useDesignSpace } from "./DesignSpace";

const providers = {
  apple: {
    testID: "signInApple",
    image: require("../../assets/brand/masterland-apple.png"),
    fill: "#cbd2dc",
    light: "#eef0f4",
    edge: "#a5aebb",
    ink: "#272e3b",
  },
  google: {
    testID: "signInGoogle",
    image: require("../../assets/brand/masterland-google.png"),
    fill: "#efbbb9",
    light: "#ffe8df",
    edge: "#db999c",
    ink: "#702f3b",
  },
  facebook: {
    testID: "signInFacebook",
    image: require("../../assets/brand/masterland-facebook.png"),
    fill: "#afd8ed",
    light: "#e4f5fb",
    edge: "#80bad9",
    ink: "#225171",
  },
};

export function ProviderButton({
  provider,
  text,
  disabled,
  onPress,
}: {
  provider: LoginProvider;
  text: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { scale } = useDesignSpace();
  const { testID, image, fill, light, edge, ink } = providers[provider];
  return (
    <Button
      testID={testID}
      label={text}
      disabled={disabled}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 28 * scale,
          borderWidth: 3 * scale,
          borderColor: edge,
          backgroundColor: fill,
          backgroundImage: `linear-gradient(180deg, ${light}, ${fill})`,
          opacity: disabled ? 0.86 : 1,
        }}
      >
        <Image
          source={image}
          resizeMode="contain"
          accessible={false}
          style={{
            width: 135 * scale,
            height: 135 * scale,
            marginLeft: 22 * scale,
          }}
        />
        <View
          style={{ flex: 1, marginLeft: 22 * scale, marginRight: 24 * scale }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            accessible={false}
            style={{
              color: ink,
              fontSize: 54 * scale,
              fontWeight: "600",
              textAlign: "left",
            }}
          >
            {text}
          </Text>
        </View>
      </View>
    </Button>
  );
}
