import { memo } from "react";
import { View, type ImageSourcePropType } from "react-native";
import { AppButton, Button, Label } from "./Controls";
import { Crop } from "./Art";
import { PaperCard } from "./PagePrimitives";
import { useCityTheme } from "./CityThemeProvider";

/** Selection and travel are separate actions; an illustrated stamp is never a fake button. */
export const CityCard = memo(function CityCard({
  id,
  title,
  scene,
  width,
  status,
  current,
  selected,
  action,
  disabled,
  onSelect,
  onAction,
}: {
  id: string;
  title: string;
  scene: ImageSourcePropType;
  width: number;
  status: string;
  current: boolean;
  selected: boolean;
  action: string;
  disabled: boolean;
  onSelect: () => void;
  onAction: () => void;
}) {
  const theme = useCityTheme();
  return (
    <PaperCard selected={current} style={{ padding: 5, marginBottom: 9 }}>
      <View style={{ flexDirection: "row", gap: 10, minHeight: 122 }}>
        <Button
          testID={`jump-${id}`}
          label={title}
          selected={selected}
          onPress={onSelect}
          style={{
            width: "51%",
            height: 122,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Crop
            source={scene}
            x={0}
            y={100}
            w={789}
            h={480}
            width={(width - 16) * 0.51}
            height={122}
          />
        </Button>
        <View
          style={{
            flex: 1,
            paddingVertical: 4,
            paddingRight: 4,
            justifyContent: "space-between",
          }}
        >
          <Label title size={21}>
            {title}
          </Label>
          <Label size={12} color={current ? "#34852b" : theme.mutedInk}>
            {status}
          </Label>
          <AppButton
            testID={`travel-${id}`}
            text={action}
            disabled={disabled}
            onPress={onAction}
            style={{
              minHeight: 38,
              marginVertical: 0,
              paddingHorizontal: 5,
              paddingVertical: 6,
            }}
          />
        </View>
      </View>
    </PaperCard>
  );
});
