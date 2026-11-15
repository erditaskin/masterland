import { useEffect, useMemo } from "react";
import {
  Animated,
  ImageBackground,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { ActionButton, Button, Label } from "./Controls";
import { name } from "../game/engine";
import { ParchmentPanel } from "./Skin";
import { colors } from "./theme";
export function LaunchScreen({
  progress,
  error,
  reduced,
  preview,
  onContinue,
  onRetry,
}: {
  progress: number;
  error: string | null;
  reduced: boolean;
  preview: boolean;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pulse = useMemo(() => new Animated.Value(1), []);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.65,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);
  return (
    <ImageBackground
      testID="launchScreen"
      source={require("../../assets/art/skara-brand-v1.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
      onLoadEnd={() => SplashScreen.hide()}
    >
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 28,
          left: 28,
          right: 28,
          backgroundColor: "transparent",
          padding: 18,
          minHeight: error ? 208 : 155,
          paddingTop: 25,
          paddingBottom: 25,
        }}
      >
        <ParchmentPanel width={width - 56} height={error ? 215 : 155} />
        <Label
          title
          size={23}
          color={colors.ink}
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          {name("city1")}
        </Label>
        <Animated.View style={{ opacity: pulse }}>
          <Label
            color={colors.ink}
            style={{ textAlign: "center", marginBottom: 12 }}
          >
            {error ?? "Yolculuk hazırlanıyor"}
          </Label>
        </Animated.View>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(progress * 100),
          }}
          testID="loadingProgress"
          style={{
            height: 13,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#032a32",
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "#ffc347",
            }}
          />
        </View>
        {error && <ActionButton text="Tekrar dene" onPress={onRetry} />}
        <Label
          size={11}
          color={colors.ink}
          style={{ textAlign: "center", marginTop: 10 }}
        >
          İki aynı ürünü birleştir.
        </Label>
      </View>
      {preview && (
        <Button
          testID="continueLoadingReview"
          label="Tahtaya dön"
          onPress={onContinue}
          style={{
            position: "absolute",
            right: 18,
            top: insets.top + 8,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.navy,
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          <Label size={25} color={colors.goldLight}>
            ×
          </Label>
        </Button>
      )}
    </ImageBackground>
  );
}
