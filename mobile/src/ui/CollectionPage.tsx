import { Fragment } from "react";
import { View } from "react-native";
import { cityProducers, name, producerCatalog as producers, type Save } from "../game/engine";
import { Button } from "./Controls";
import { PaperCard } from "./PagePrimitives";
import { useCityTheme } from "./CityThemeProvider";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignText } from "./DesignSpace";
import { DesignProgress } from "./DesignProgress";
import { DesignItem, ProducerArt } from "./BoardChrome";

export function CollectionPage({
  save,
  onProducer,
}: {
  save: Save;
  width: number;
  onProducer: (index: number) => void;
}) {
  const theme = useCityTheme();
  const groups = cityProducers(save),
    found = new Set(save.discoveries);
  const total = groups.reduce((sum, p) => sum + p.products.length, 0);
  const discovered = groups.reduce(
    (sum, p) => sum + p.products.filter((a) => found.has(a.id)).length,
    0,
  );
  const heights = groups.map(
    (p) => 178 + Math.ceil(p.products.length / 4) * 260,
  );
  const rows = groups.map((p, index) => ({
    p,
    y: 990 + heights.slice(0, index).reduce((a, b) => a + b, 0),
  }));
  const nextY = 990 + heights.reduce((a, b) => a + b, 0);
  return (
    <DesignContent end={nextY + 20}>
      <PaperCard designRect={[90, 730, 1026, 230]} />
      <DesignText rect={[126, 745, 940, 80]} size={62} bold>
        {name(save.cityID)}
      </DesignText>
      <DesignText rect={[126, 825, 940, 55]} size={38} color="#34852b">
        {discovered} / {total} keşif
      </DesignText>
      <DesignProgress
        rect={[126, 888, 940, 52]}
        value={discovered}
        total={total}
      />
      {rows.map(({ p, y }) => {
        const index = producers.indexOf(p);
        return (
          <Fragment key={p.id}>
            <PaperCard
              designRect={[
                90,
                y,
                1026,
                146 + Math.ceil(p.products.length / 4) * 260,
              ]}
            />
            <ProducerArt index={index} rect={[112, y + 21, 132, 88]} />
            <DesignText rect={[268, y + 15, 795, 92]} size={42} bold>
              {p.name} · {p.products.filter((a) => found.has(a.id)).length}/
              {p.products.length}
            </DesignText>
            <DesignBox rect={[90, y, 1026, 120]}>
              <Button
                label={p.name + " ürün alanları"}
                testID={`collection-producer-${p.id}`}
                onPress={() => onProducer(index)}
                style={{ flex: 1 }}
              >
                <View />
              </Button>
            </DesignBox>
            {p.products.map((item, i) => {
              const x = 120 + (i % 4) * 246,
                yy = y + 142 + Math.floor(i / 4) * 260,
                known = found.has(item.id);
              return (
                <Fragment key={item.id}>
                  <PaperCard designRect={[x, yy, 218, 218]} />
                  {known ? (
                    <>
                      <DesignItem
                        id={item.id}
                        rect={[x + 18, yy + 12, 180, 180]}
                      />
                      <DesignText
                        rect={[x + 158, yy + 160, 50, 52]}
                        size={35}
                        bold
                        color="#34852b"
                        align="center"
                      >
                        ✓
                      </DesignText>
                    </>
                  ) : (
                    <DesignText
                      rect={[x, yy, 218, 218]}
                      size={111}
                      bold
                      color={theme.mutedInk}
                      align="center"
                    >
                      ?
                    </DesignText>
                  )}
                  <DesignBox rect={[x, yy, 218, 218]}>
                    <Button
                      label={known ? item.name : "Keşfedilmedi"}
                      onPress={() => onProducer(index)}
                      style={{ flex: 1 }}
                    >
                      <View />
                    </Button>
                  </DesignBox>
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </DesignContent>
  );
}
