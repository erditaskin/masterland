import { View } from "react-native";
import { cityProducers, name, producers, type Save } from "../game/engine";
import { Item } from "./Art";
import { AppProgress, Button, Label } from "./Controls";
import { PaperCard, squareTileSize } from "./PagePrimitives";
import { ProducerPortrait } from "./ProducerDetails";
import { useCityTheme } from "./CityThemeProvider";

export function CollectionPage({
  save,
  width,
  onProducer,
}: {
  save: Save;
  width: number;
  onProducer: (index: number) => void;
}) {
  const theme = useCityTheme();
  const groups = cityProducers(save);
  const found = new Set(save.discoveries);
  const total = groups.reduce((sum, p) => sum + p.products.length, 0);
  const discovered = groups.reduce(
    (sum, p) => sum + p.products.filter((a) => found.has(a.id)).length,
    0,
  );
  const side = squareTileSize(width - 26);
  return (
    <>
      <PaperCard>
        <Label title size={22}>
          {name(save.cityID)}
        </Label>
        <Label color={theme.primary}>
          {discovered} / {total} keşif
        </Label>
        <AppProgress value={discovered} total={total} />
      </PaperCard>
      {groups.map((p) => {
        const index = producers.indexOf(p);
        return (
          <PaperCard
            key={p.id}
            header={
              <Button
                testID={`collection-producer-${p.id}`}
                label={p.name + " ürün alanları"}
                onPress={() => onProducer(index)}
                style={{ minHeight: 44, marginBottom: 4 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <ProducerPortrait index={index} size={58} />
                  <Label title size={16} style={{ flex: 1 }}>
                    {p.name} ·{" "}
                    {p.products.filter((a) => found.has(a.id)).length}/
                    {p.products.length}
                  </Label>
                  <Label title size={24} color={theme.primary}>
                    ›
                  </Label>
                </View>
              </Button>
            }
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {p.products.map((a) => {
                const known = found.has(a.id);
                return (
                  <Button
                    key={a.id}
                    label={known ? a.name : "Keşfedilmedi"}
                    onPress={() => onProducer(index)}
                    style={{
                      width: side,
                      height: side,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.edge,
                      backgroundColor: known ? theme.paperLight : theme.paper,
                    }}
                  >
                    {known ? (
                      <>
                        <Item id={a.id} size={side * 0.77} />
                        <Label
                          size={11}
                          color={theme.primary}
                          style={{ position: "absolute", bottom: 2, right: 4 }}
                        >
                          ✓
                        </Label>
                      </>
                    ) : (
                      <Label title size={side * 0.48} color={theme.mutedInk}>
                        ?
                      </Label>
                    )}
                  </Button>
                );
              })}
            </View>
          </PaperCard>
        );
      })}
    </>
  );
}
