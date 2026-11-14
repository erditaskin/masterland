import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { colors, fonts } from "./theme";
export function Label({
  children,
  title = false,
  size = 14,
  color = colors.ink,
  style,
}: {
  children: React.ReactNode;
  title?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.15}
      style={[
        {
          fontFamily: title ? fonts.title : fonts.body,
          fontSize: size,
          color,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  children,
  onPress,
  onLongPress,
  label,
  testID,
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  label: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const opacity = useMemo(() => new Animated.Value(1), []);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      onPressIn={() =>
        Animated.timing(opacity, {
          toValue: 0.84,
          duration: 65,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }
      style={style}
    >
      <Animated.View
        style={{
          opacity,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
export function ActionButton({
  text,
  onPress,
  testID,
}: {
  text: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Button
      label={text}
      testID={testID}
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.navy,
        borderColor: colors.gold,
        borderWidth: 1,
        marginVertical: 5,
      }}
    >
      <Label color={colors.goldLight} size={15}>
        {text}
      </Label>
    </Button>
  );
}
export function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: colors.outline, marginVertical: 12 }}
    />
  );
}
