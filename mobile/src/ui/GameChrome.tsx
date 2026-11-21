import {
  cityAchievementsTitle,
  earnedAchievementsLabel,
  languageStore,
} from "../i18n/locale";
import { Fragment, memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Image, PixelRatio, View } from "react-native";
import { Button } from "./Controls";
import {
  approvedDesignRect,
  approvedLayout,
  referenceNavigationRect,
} from "./layout";
import {
  DesignBox,
  DesignImage,
  DesignSpace,
  DesignSurface,
  DesignText,
} from "./DesignSpace";
import { MaterialTray } from "./DesignMaterial";
import { belenyakaLayout, belenyakaRect } from "./belenyakaLayout";
import { standardArtForCity } from "./standardCityArt";
import { cityArt } from "./cityArt";
import { art } from "./theme";
import { useCityTheme } from "./CityThemeProvider";
import {
  achievementState,
  cityAchievements,
  level,
  nextEnergySeconds,
  name,
  type Save,
} from "../game/engine";
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
  const standardArt = standardArtForCity(theme.id);
  if (standardArt)
    return (
      <DesignSpace scale={width / 1206}>
        <DesignImage
          source={standardArt.scene}
          rect={[0, 0, 1206, (height * 1206) / width]}
        />
      </DesignSpace>
    );
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
  crop,
}: {
  index: number;
  crop?: readonly [number, number, number, number];
  rect: readonly [number, number, number, number];
}) {
  const m = Image.resolveAssetSource(art.icons);
  if (!m?.width || !m.height) throw Error("Eksik ikon atlası.");
  return (
    <DesignImage
      source={art.icons}
      rect={rect}
      crop={
        crop ?? [
          ((index % 4) * m.width) / 4,
          (Math.floor(index / 4) * m.height) / 2,
          m.width / 4,
          m.height / 2,
        ]
      }
      fit
    />
  );
}

const achievementBadgeCrop = (
  require("../../assets/art/route-icons-v2-bounds.json") as number[][]
)[1] as [number, number, number, number];

function EnergyRefillTimer({ save, bounds }: { save: Save; bounds: readonly [number, number, number, number] }) {
  const [now, setNow] = useState(Date.now);
  const filling = save.stamina < 100;
  useEffect(() => {
    if (!filling) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [filling, save.energyAt]);
  const seconds = nextEnergySeconds(save, Math.max(now, save.energyAt));
  if (seconds === null) return null;
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <>
      <DesignSurface rect={bounds} fill="#163749" stroke="#d8ae58" radius={11} line={1} />
      <DesignText rect={bounds} size={24} fit bold align="center" color="#fff0c2">{`+1 · ${time}`}</DesignText>
    </>
  );
}

function GoldCounter({ target, reduced, language, bounds, size }: {
  target: number; reduced: boolean; language: string;
  bounds: readonly [number, number, number, number]; size: number;
}) {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      const frame = requestAnimationFrame(() => setShown(target));
      return () => cancelAnimationFrame(frame);
    }
    if (current.current === target) return;
    const from = current.current;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / 800);
      current.current = Math.round(from + (target - from) * progress);
      setShown(current.current);
      if (progress === 1) clearInterval(timer);
    }, 33);
    return () => clearInterval(timer);
  }, [target, reduced]);
  return <DesignText rect={bounds} size={size} fit bold align="center" color="#fff0c2" accessible={false}>
    {(reduced ? target : shown).toLocaleString(language === "tr" ? "tr-TR" : "en-US")}
  </DesignText>;
}

export const WalletHUD = memo(function WalletHUD({
  save,
  width,
  height,
  safeTop = 0,
  open,
}: {
  save: Save;
  width: number;
  height: number;
  safeTop?: number;
  open: (page: Page) => void;
}) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const scale = width / 1206;
  const standardArt = standardArtForCity(useCityTheme().id);
  const source = standardArt ? belenyakaLayout : approvedLayout.wallet;
  const place = standardArt ? belenyakaRect : approvedDesignRect;
  const levelRect = place(source.level, width, height);
  const offset = Math.max(0, safeTop + 4 - levelRect[1] * scale) / scale;
  const rect = (value: readonly number[]) => {
    const r = place(value, width, height);
    return [r[0], r[1] + offset, r[2], r[3]] as const;
  };
  const [, shieldY, , shieldH] = rect(source.level);
  const badge = [76, shieldY - 5, 112, shieldH + 10] as const;
  const earned = useMemo(
    () =>
      cityAchievements(save.cityID)
        .map((a) => achievementState(save, a))
        .filter((state) => state === "ready" || state === "claimed").length,
    [save],
  );
  const achievementRect = [1000, badge[1], 130, badge[3]] as const;
  return (
    <View style={{ position: "absolute", inset: 0 }} pointerEvents="box-none">
      <DesignSpace scale={scale}>
        <DesignImage
          source={
            standardArt
              ? standardArt.level
              : require("../../assets/art/level-shield-v11.png")
          }
          rect={badge}
          crop={standardArt ? undefined : [161, 85, 930, 1050]}
          fit
        />
        <DesignText
          rect={badge}
          size={48}
          bold
          color="#fff2bf"
          align="center"
          accessible={false}
        >
          {level(save)}
        </DesignText>
        <DesignBox
          rect={[
            badge[0] - 10,
            badge[1] - 8,
            132,
            Math.max(132, badge[3] + 16),
          ]}
        >
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
            ["stamina", String(save.stamina), 5, source.energy],
            [
              "gold",
              save.gold.toLocaleString(language === "tr" ? "tr-TR" : "en-US"),
              6,
              source.gold,
            ],
            ["gems", String(save.gems), 7, source.gems],
          ] as const
        ).map(([id, value, index, bounds]) => {
          const [, y, , h] = rect(bounds);
          const x = 208 + (index - 5) * 264;
          const w = 249;
          const diameter = h * 0.54;
          return (
            <Fragment key={id}>
              {standardArt ? (
                <DesignImage
                  source={standardArt.wallet[index - 5]}
                  rect={[x, y, w, h]}
                />
              ) : (
                <DesignSurface
                  rect={[x, y, w, h]}
                  fill="#163749"
                  end="#071f2e"
                  stroke="#d8ae58"
                  radius={h * 0.45}
                  line={2.5}
                />
              )}
              <ChromeSprite
                index={index}
                rect={[x + 7, y + h * 0.1, h * 0.8, h * 0.8]}
              />
              {id === "stamina" && <EnergyRefillTimer save={save} bounds={[x + 64, y + h + 3, w - 128, 33]} />}
              {id === "gold" ? <GoldCounter target={save.gold} reduced={save.reducedMotion} language={language}
                bounds={[x + w * 0.29, y, w * 0.46, h]} size={Math.min(34, h * 0.65)} /> : <DesignText
                rect={[x + w * 0.29, y, w * 0.46, h]}
                size={Math.min(34, h * 0.65)}
                fit
                bold
                color="#fff0c2"
                align="center"
                accessible={false}
              >
                {value}
              </DesignText>}
              <DesignSurface
                rect={[
                  x + w - diameter - 7,
                  y + (h - diameter) / 2,
                  diameter,
                  diameter,
                ]}
                fill="#173e50"
                stroke="#d8ae58"
                radius={diameter / 2}
                line={2}
              />
              <DesignText
                rect={[x + w - diameter - 7, y, diameter, h]}
                size={28}
                color="#edcb7b"
                align="center"
                accessible={false}
              >
                +
              </DesignText>
              <DesignBox
                rect={[x, y - (Math.max(h, 132) - h) / 2, w, Math.max(h, 132)]}
              >
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
            </Fragment>
          );
        })}
        <DesignSurface
          rect={achievementRect}
          fill="#163749"
          end="#071f2e"
          stroke="#d8ae58"
          radius={31}
          line={3}
        />
        <DesignImage
          source={require("../../assets/art/route-icons-v2.png")}
          crop={achievementBadgeCrop}
          rect={[1011, badge[1] + 20, 61, badge[3] - 40]}
          fit
        />
        <DesignText
          rect={[1069, badge[1], 54, badge[3]]}
          size={42}
          bold
          fit
          align="center"
          color="#fff0c2"
          accessible={false}
        >
          {earned}
        </DesignText>
        <DesignBox
          rect={[999, badge[1] - 9, 132, Math.max(132, badge[3] + 18)]}
        >
          <Button
            testID="cityAchievementsHUD"
            label={`${cityAchievementsTitle(name(save.cityID), language)}, ${earnedAchievementsLabel(earned, language)}`}
            onPress={() => open({ kind: "achievements", cityID: save.cityID })}
            style={{ flex: 1 }}
          >
            <View />
          </Button>
        </DesignBox>
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

const belenyakaTabIcons = [
  [91, 106, 291, 289],
  [457, 92, 388, 291],
  [921, 41, 374, 346],
  [1384, 85, 327, 316],
  [50, 511, 370, 320],
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
  const standardArt = standardArtForCity(theme.id);
  const [left, top, w, h] = referenceNavigationRect(
    width,
    height,
    bottom,
    theme.id,
  );
  const iconSize = h * 0.34;
  const labelHeight = h * 0.28;
  const iconTopMargin = 1 / (PixelRatio.get() * scale);
  const iconTop = standardArt
    ? top + (h - iconSize - labelHeight - iconTopMargin) / 2 + iconTopMargin
    : top + h * 0.08;
  const labelTop = standardArt
    ? iconTop + iconSize
    : Math.min(top + h * 0.78, (height - Math.min(bottom, 20)) / scale) -
      labelHeight;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", inset: 0 }}>
      <DesignSpace scale={scale}>
        {standardArt ? (
          <DesignImage
            rect={[left, top, w, h]}
            source={standardArt.navigation}
            crop={standardArt.navigationCrop}
            radius={standardArt.navigationCrop ? 52 : 0}
          />
        ) : cityArt[theme.id]!.navigationFrame ? (
          <DesignImage
            rect={[left, top, w, h]}
            source={cityArt[theme.id]!.navigationFrame!}
          />
        ) : (
          <MaterialTray rect={[left, top, w, h]} />
        )}
        {tabs.map(([label, id], index) => {
          const inset = w * 0.024;
          const tabWidth = (w - 2 * inset) / tabs.length;
          const x = left + inset + index * tabWidth;
          const selected = active === id;
          return (
            <Fragment key={id}>
              {standardArt &&
                !standardArt.navigationBakedDividers &&
                index > 0 && (
                  <DesignSurface
                    rect={[x - 2, top + 14, 4, h - 28]}
                    fill="#2f130d"
                    end="#4c2416"
                  />
                )}
              {selected &&
                (standardArt?.navigationSelected ? (
                  <DesignImage
                    source={standardArt.navigationSelected}
                    rect={[x + 5, top + 7, tabWidth - 10, h - 14]}
                  />
                ) : (
                  <DesignSurface
                    rect={
                      standardArt
                        ? [x + 5, top + 7, tabWidth - 10, h - 14]
                        : [x + 8, top + 9, tabWidth - 16, h - 24]
                    }
                    fill={theme.navSelectedLight}
                    end={theme.navSelected}
                    stroke={theme.highlight}
                    radius={27}
                    line={4}
                  />
                ))}
              <ChromeSprite
                index={index}
                crop={standardArt ? belenyakaTabIcons[index] : undefined}
                rect={[
                  x + (tabWidth - iconSize) / 2,
                  iconTop,
                  iconSize,
                  iconSize,
                ]}
              />
              <DesignText
                rect={[x, labelTop, tabWidth, labelHeight]}
                size={34}
                bold
                color={selected ? theme.navSelectedInk : "#fff0cb"}
                align="center"
                accessible={false}
              >
                {label}
              </DesignText>
              <DesignBox rect={[x, top, tabWidth, h]}>
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
