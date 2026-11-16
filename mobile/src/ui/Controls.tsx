import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  type AccessibilityRole,
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { colors, fonts, parchment } from "./theme";
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
  selected,
  role = "button",
  checked,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  label: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  selected?: boolean;
  role?: AccessibilityRole;
  checked?: boolean;
}) {
  const opacity = useMemo(() => new Animated.Value(1), []);
  return (
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled, checked }}
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
const paperButtonSurface: ViewStyle = {
  borderRadius: parchment.radius,
  backgroundColor: parchment.paper,
  backgroundImage: parchment.gradient,
  borderWidth: 1,
  borderBottomWidth: 2,
  borderColor: parchment.edge,
};
/** Non-interactive face for a button already owned by its surrounding achievement card. */
export function AppButtonStamp({ text }: { text: string }) {
  return (
    <View
      style={[
        paperButtonSurface,
        { paddingHorizontal: 10, paddingVertical: 3 },
      ]}
    >
      <Label title size={12} color={parchment.greenInk}>
        {text}
      </Label>
    </View>
  );
}
export function AppProgress({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label?: string;
}) {
  const fraction = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <View
      style={{
        height: label ? 18 : 10,
        width: "100%",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: parchment.edge,
        backgroundColor: "#dec28d",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${fraction * 100}%`,
          backgroundColor: "#62834b",
        }}
      />
      {label && (
        <Label title size={11} style={{ textAlign: "center" }}>
          {label}
        </Label>
      )}
    </View>
  );
}
/** Parchment controls share their surfaces, typography and press feedback. */
export function AppButton({
  text,
  onPress,
  testID,
  tone = "primary",
  style,
  disabled = false,
}: {
  text: string;
  onPress: () => void;
  testID?: string;
  tone?: "primary" | "secondary" | "muted";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Button
      label={text}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={[
        paperButtonSurface,
        {
          minHeight: parchment.controlHeight,
          paddingHorizontal: 14,
          paddingVertical: 9,
          marginVertical: 4,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <Label
        title
        size={parchment.fontSize}
        color={
          tone === "primary"
            ? parchment.greenInk
            : tone === "muted"
              ? parchment.mutedInk
              : parchment.ink
        }
        style={{ textAlign: "center", lineHeight: 19 }}
      >
        {text}
      </Label>
    </Button>
  );
}
// Existing call sites inherit the common parchment button rather than a second design.
export const ActionButton = AppButton;

export function AppCheckbox({
  label,
  checked,
  onChange,
  testID,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  testID?: string;
}) {
  return (
    <Button
      label={label}
      role="checkbox"
      checked={checked}
      testID={testID}
      onPress={onChange}
      style={{ minHeight: 48, marginVertical: 2 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 25,
            height: 25,
            borderWidth: 1.5,
            borderColor: parchment.ink,
            borderRadius: 4,
            transform: [{ rotate: "-3deg" }],
            backgroundColor: "#f0cf8c44",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && (
            <Label
              size={27}
              color={parchment.greenInk}
              style={{ fontStyle: "italic", lineHeight: 29 }}
            >
              ✓
            </Label>
          )}
        </View>
        <Label size={15} style={{ flex: 1, fontStyle: "italic" }}>
          {label}
        </Label>
      </View>
    </Button>
  );
}

export function AppInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={parchment.mutedInk}
      selectionColor={parchment.greenInk}
      {...props}
      style={[
        {
          minHeight: parchment.controlHeight,
          borderBottomWidth: 1,
          borderColor: parchment.edge,
          backgroundColor: "#f0cf8c33",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 5,
          color: parchment.ink,
          fontFamily: fonts.body,
          fontSize: 15,
          fontStyle: "italic",
        },
        style,
      ]}
    />
  );
}

export function AppChoice({
  selected,
  style,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      selected={selected}
      style={[
        {
          borderRadius: parchment.radius,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? parchment.greenInk : parchment.edge,
          backgroundColor: selected ? parchment.selected : parchment.paper,
        },
        style,
      ]}
    />
  );
}

export function AppCloseButton({
  onPress,
  testID,
}: {
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Button
      label="Bitti"
      testID={testID}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f5d69799",
        borderColor: parchment.edge,
        borderWidth: 1,
      }}
    >
      <Label size={28} color={parchment.ink}>
        ×
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
