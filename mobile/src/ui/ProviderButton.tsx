import { Image, Text, View } from "react-native";
import { Button } from "./Controls";

/** Provider branding stays intact; the parchment page supplies the game's visual identity. */
export function ProviderButton({
  provider,
  text,
  disabled,
  onPress,
}: {
  provider: "google" | "facebook";
  text: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const facebook = provider === "facebook";
  return (
    <Button
      testID={facebook ? "signInFacebook" : "signInGoogle"}
      label={text}
      disabled={disabled}
      onPress={onPress}
      style={{ height: 48, width: "100%" }}
    >
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: facebook ? "#1877f2" : "#747775",
          backgroundColor: facebook ? "#1877f2" : "#fff",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Image
          source={
            facebook
              ? require("../../assets/brand/facebook.png")
              : require("../../assets/brand/google-g.png")
          }
          resizeMode="contain"
          style={{ position: "absolute", left: 16, width: 22, height: 22 }}
        />
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.15}
          style={{
            fontFamily: "System",
            fontSize: 14,
            fontWeight: "600",
            color: facebook ? "#fff" : "#1f1f1f",
            marginHorizontal: 45,
          }}
        >
          {text}
        </Text>
      </View>
    </Button>
  );
}
