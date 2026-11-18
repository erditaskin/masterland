import { View } from "react-native";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import {
  city,
  productionPlan,
  type Save,
  type Producer,
  type Action,
  type Result,
} from "../game/engine";
import { EnergyAdPanel } from "./EnergyAdPanel";
import { AppButton, Button } from "./Controls";
import { useCityTheme } from "./CityThemeProvider";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignImage, DesignText } from "./DesignSpace";
import { PaperCard } from "./PagePrimitives";
import { DesignItem, ProducerArt } from "./BoardChrome";
export { ProducerPortrait } from "./ProducerPortrait";

export function ProducerDetails({
  producer: p,
  index,
  save,
  dispatch,
  variant = "producer",
  onProducer,
  displayNow,
  adControl,
}: {
  displayNow?: number;
  adControl?: ReactNode;
  width: number;
  variant?: "producer" | "collection";
  onProducer: () => void;
  producer: Producer;
  index: number;
  save: Save;
  dispatch: (a: Action) => Result | null;
}) {
  const theme = useCityTheme(),
    c = city(save);
  const [selected, setSelected] = useState(() => p.products[0]!.id);
  const item = p.products.find((a) => a.id === selected) ?? p.products[0]!;
  const owned = c.owned.includes(p.id),
    known = save.discoveries.includes(item.id);
  const [now, setNow] = useState(Date.now),
    readyAt = c.batches[p.id]?.readyAt ?? 0;
  useEffect(() => {
    if (displayNow !== undefined || readyAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [readyAt, displayNow]);
  const seconds = Math.max(
    0,
    Math.ceil((readyAt - (displayNow ?? now)) / 1000),
  );
  const cooldown = variant === "producer" && owned && seconds > 0;
  const gridY = cooldown ? 1700 : 1120,
    gridHeight = Math.ceil(p.products.length / 4) * 244;
  const detailY = gridY + Math.max(cooldown ? 720 : 520, gridHeight + 32);
  return (
    <DesignContent end={detailY + 1450}>
      {index === 0 ? (
        <DesignImage
          source={require("../../assets/art/skara-field-hero-v2.png")}
          rect={[110, 730, 986, 360]}
          fit
        />
      ) : (
        <ProducerArt index={index} rect={[110, 730, 986, 360]} />
      )}
      {cooldown && (
        <>
          <PaperCard designRect={[90, 1120, 1026, 550]} />
          <DesignText rect={[120, 1135, 966, 90]} size={54} bold align="center">
            Üretici hazırlanıyor
          </DesignText>
          <DesignText
            rect={[120, 1225, 966, 110]}
            size={70}
            bold
            align="center"
          >
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </DesignText>
          <AppButton
            designRect={[120, 1350, 966, 132]}
            text="Şimdi hazırla · 3 elmas"
            testID="refillProducerGems"
            onPress={() => dispatch({ type: "producer-refill", id: p.id })}
          />
          <DesignBox rect={[120, 1510, 966, 132]} local>
            {adControl ?? (
              <EnergyAdPanel save={save} producerID={p.id} compact />
            )}
          </DesignBox>
        </>
      )}
      {p.products.map((a, i) => {
        const x = 114 + (i % 4) * 244,
          y = gridY + Math.floor(i / 4) * 244,
          found = save.discoveries.includes(a.id);
        return (
          <Fragment key={a.id}>
            <PaperCard
              designRect={[x, y, 232, 232]}
              selected={a.id === selected}
            />
            {found ? (
              <DesignItem id={a.id} rect={[x + 15, y + 15, 202, 202]} />
            ) : (
              <DesignText
                rect={[x, y, 232, 232]}
                size={111}
                bold
                color={theme.mutedInk}
                align="center"
              >
                ?
              </DesignText>
            )}
            <DesignBox rect={[x, y, 232, 232]}>
              <Button
                label={a.name + (found ? ", Açık" : ", Kilitli")}
                testID={"product-slot-" + a.id}
                selected={a.id === selected}
                onPress={() => setSelected(a.id)}
                style={{ flex: 1 }}
              >
                <View />
              </Button>
            </DesignBox>
          </Fragment>
        );
      })}
      <DesignText rect={[90, detailY, 1026, 100]} size={62} bold align="center">
        {item.name}
      </DesignText>
      <DesignText
        rect={[90, detailY + 105, 1026, 90]}
        size={42}
        align="center"
      >{`Basamak ${item.tier} · ${known ? "Keşfedildi" : "Keşfedilmedi"}`}</DesignText>
      <DesignText
        rect={[120, detailY + 225, 966, 160]}
        size={44}
        align="center"
      >
        İki aynı ürünü birleştirerek zincirde ilerle.
      </DesignText>
      {variant === "collection" ? (
        <AppButton
          designRect={[220, detailY + 430, 766, 132]}
          text="Üreticiyi gör"
          tone="secondary"
          testID="viewProducerFromCollection"
          onPress={onProducer}
        />
      ) : !owned ? (
        <AppButton
          designRect={[90, detailY + 430, 1026, 132]}
          testID="buyProducer"
          text={`Aç · ${p.price} altın · Seviye ${p.level}`}
          onPress={() => dispatch({ type: "buy", id: p.id })}
        />
      ) : null}
      {variant === "producer" && p.products[item.tier] && (
        <>
          <PaperCard designRect={[90, detailY + 620, 1026, 260]} />
          <DesignItem
            id={p.products[item.tier]!.id}
            rect={[120, detailY + 650, 190, 190]}
          />
          <DesignText rect={[350, detailY + 630, 700, 80]} size={38}>
            Sonraki ürün
          </DesignText>
          <DesignText rect={[350, detailY + 730, 700, 120]} size={48} bold>
            {p.products[item.tier]!.name}
          </DesignText>
        </>
      )}
      {owned && (
        <DesignText
          rect={[120, detailY + 940, 966, 180]}
          size={38}
          color={theme.mutedInk}
          align="center"
        >
          Üretim gücü {2 ** (productionPlan(save, p).selected - 1)}x.
          Değiştirmek için tahtadaki üreticiye basılı tut.
        </DesignText>
      )}
      {variant === "producer" && owned && !cooldown && (
        <DesignBox rect={[120, detailY + 1150, 966, 300]}>
          <EnergyAdPanel save={save} producerID={p.id} />
        </DesignBox>
      )}
    </DesignContent>
  );
}
