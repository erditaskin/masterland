import { memo } from "react";
import { View, type ImageSourcePropType } from "react-native";
import { AppButton, Button } from "./Controls";
import { standardArtForCity } from "./standardCityArt";
import { PaperCard } from "./PagePrimitives";
import { useCityTheme } from "./CityThemeProvider";
import {
  DesignBox,
  DesignImage,
  DesignSpace,
  DesignText,
  useDesignSpace,
} from "./DesignSpace";

/** Selection and travel are separate actions; an illustrated stamp is never a fake button. */
export const CityCard = memo(function CityCard({
  id,
  title,
  scene,
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
  const theme = useCityTheme(),
    { scale } = useDesignSpace();
  return (
    <View style={{ width: 1062 * scale, height: 318 * scale }}>
      <DesignSpace scale={scale} x={72} y={712}>
        <PaperCard designRect={[90, 716, 1026, 312]} selected={current} />
        <DesignImage
          source={(id === "city2" && standardArtForCity(id)?.scene) || scene}
          rect={[105, 731, 540, 282]}
          crop={id === "city2" ? [0, 130, 1206, 630] : [0, 130, 789, 430]}
          radius={25}
        />
        <DesignBox rect={[105, 731, 540, 282]}>
          <Button
            testID={`jump-${id}`}
            label={title}
            selected={selected}
            onPress={onSelect}
            style={{ flex: 1 }}
          >
            <View />
          </Button>
        </DesignBox>
        <DesignText rect={[670, 734, 418, 83]} size={58} bold fit>
          {title}
        </DesignText>
        <DesignText
          rect={[670, 816, 415, 48]}
          size={36}
          color={
            current
              ? id !== "city1"
                ? theme.primary
                : "#34852b"
              : theme.mutedInk
          }
        >
          {status}
        </DesignText>
        <AppButton
          designRect={[670, 882, 414, 132]}
          text={action}
          testID={`travel-${id}`}
          disabled={disabled}
          onPress={onAction}
        />
      </DesignSpace>
    </View>
  );
});
