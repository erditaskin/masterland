import { Fragment, memo } from "react";
import { Image, View } from "react-native";
import { Button } from "./Controls";
import {
  DesignBox,
  DesignImage,
  DesignSpace,
  DesignSurface,
  DesignText,
} from "./DesignSpace";
import { MaterialTray } from "./DesignMaterial";
import { cityArt } from "./cityArt";
import { art } from "./theme";
import { useCityTheme } from "./CityThemeProvider";
import { level, type Save } from "../game/engine";
import type { Page } from "./Pages";

export const CityBackdrop = memo(function CityBackdrop({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const theme = useCityTheme(),
    source = cityArt[theme.id]!.scene;
  const m = Image.resolveAssetSource(source);
  if (!m?.width || !m.height) throw Error("Eksik şehir görseli.");
  return (
    <DesignSpace scale={width / 1206}>
      <DesignImage
        source={source}
        rect={[0, 0, 1206, (height * 1206) / width]}
        crop={[
          0,
          80,
          m.width,
          Math.min(m.height - 80, Math.round((m.width * height) / width)),
        ]}
      />
    </DesignSpace>
  );
});

export function ChromeSprite({
  index,
  rect,
}: {
  index: number;
  rect: readonly [number, number, number, number];
}) {
  const m = Image.resolveAssetSource(art.icons);
  if (!m?.width || !m.height) throw Error("Eksik ikon atlası.");
  return (
    <DesignImage
      source={art.icons}
      rect={rect}
      crop={[
        ((index % 4) * m.width) / 4,
        (Math.floor(index / 4) * m.height) / 2,
        m.width / 4,
        m.height / 2,
      ]}
      fit
    />
  );
}

export const WalletHUD = memo(function WalletHUD({
  save,
  width,
  top = 0,
  open,
}: {
  save: Save;
  width: number;
  top?: number;
  open: (page: Page) => void;
}) {
  return (
    <View
      style={{ position: "absolute", inset: 0, top }}
      pointerEvents="box-none"
    >
      <DesignSpace scale={width / 1206}>
        <DesignImage
          source={require("../../assets/art/level-shield-v11.png")}
          rect={[26, 145, 140, 142]}
          crop={[161, 85, 930, 1050]}
          fit
        />
        <DesignText
          rect={[26, 145, 140, 128]}
          size={65}
          bold
          color="#fff2bf"
          align="center"
        >
          {level(save)}
        </DesignText>
        <DesignBox rect={[26, 145, 140, 142]}>
          <Button
            testID="profile"
            label={`Seviye ${level(save)}, profil`}
            onPress={() => open({ kind: "profile" })}
            style={{ flex: 1 }}
          >
            <View />
          </Button>
        </DesignBox>
        {(
          [
            ["stamina", String(save.stamina), 5, 190, 324],
            ["gold", save.gold.toLocaleString("tr-TR"), 6, 530, 324],
            ["gems", String(save.gems), 7, 870, 310],
          ] as const
        ).map(([id, value, index, x, w]) => (
          <View
            key={id}
            pointerEvents="box-none"
            style={{ position: "absolute", inset: 0 }}
          >
            <DesignSurface
              rect={[x, 157, w, 105]}
              fill="#163749"
              end="#071f2e"
              stroke="#d8ae58"
              radius={46}
              line={4}
            />
            <ChromeSprite index={index} rect={[x - 4, 156, 103, 103]} />
            <DesignText
              rect={[x + 100, 162, w - 152, 92]}
              size={51}
              bold
              color="#fff0c2"
              align="center"
            >
              {value}
            </DesignText>
            <DesignText
              rect={[x + w - 48, 166, 44, 80]}
              size={40}
              color="#edcb7b"
              align="center"
            >
              +
            </DesignText>
            <DesignBox rect={[x, 140, w, 140]}>
              <Button
                testID={id}
                label={value}
                onPress={() =>
                  open({ kind: id === "stamina" ? "energy" : "market" })
                }
                style={{ flex: 1 }}
              >
                <View />
              </Button>
            </DesignBox>
          </View>
        ))}
      </DesignSpace>
    </View>
  );
});

const tabs = [
  ["Tahta", "board"],
  ["Koleksiyon", "collection"],
  ["Şehirler", "cities"],
  ["Depo", "storage"],
  ["Market", "market"],
] as const;
export const GameNavigation = memo(function GameNavigation({
  width,
  height,
  bottom,
  active,
  open,
  onBoard,
}: {
  width: number;
  height: number;
  bottom: number;
  active: string;
  open: (page: Page) => void;
  onBoard: () => void;
}) {
  const theme = useCityTheme();
  const scale = width / 1206;
  // The target is 34 pt at @3x. Other safe areas move the whole tray, never its individual controls.
  const top = height - bottom - 160 * scale;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", inset: 0 }}>
      <DesignSpace scale={scale} y={2360 - top / scale}>
        <MaterialTray rect={[42, 2360, 1122, 160]} />
        {tabs.map(([label, id], index) => {
          const x = 60 + index * 220,
            selected = active === id;
          return (
            <Fragment key={id}>
              {selected && (
                <DesignSurface
                  rect={[x, 2371, 212, 137]}
                  fill={theme.navSelectedLight}
                  end={theme.navSelected}
                  stroke={theme.highlight}
                  radius={27}
                  line={4}
                />
              )}
              <ChromeSprite index={index} rect={[x + 67, 2372, 78, 78]} />
              <DesignText
                rect={[x, 2450, 212, 51]}
                size={34}
                bold
                color={selected ? theme.navSelectedInk : "#fff0cb"}
                align="center"
              >
                {label}
              </DesignText>
              <DesignBox rect={[x, 2360, 212, 160]}>
                <Button
                  testID={"tab-" + id}
                  selected={selected}
                  label={label}
                  onPress={() =>
                    id === "board" ? onBoard() : open({ kind: id })
                  }
                  style={{ flex: 1 }}
                >
                  <View />
                </Button>
              </DesignBox>
            </Fragment>
          );
        })}
      </DesignSpace>
    </View>
  );
});
