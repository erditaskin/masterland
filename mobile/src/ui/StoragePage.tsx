import { useState } from "react";
import { View } from "react-native";
import {
  city,
  name,
  product,
  type Action,
  type Result,
  type Save,
} from "../game/engine";
import { Item } from "./Art";
import { AppButton, AppChoice, AppProgress, Label } from "./Controls";
import { PaperCard, squareTileSize } from "./PagePrimitives";
import { useCityTheme } from "./CityThemeProvider";

export function StoragePage({
  save,
  width,
  dispatch,
  onBoard,
}: {
  save: Save;
  width: number;
  dispatch: (a: Action) => Result | null;
  onBoard: () => void;
}) {
  const theme = useCityTheme();
  const c = city(save);
  // Track tile identity, never a moving array index after a restore.
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const selectedIndex = c.storage.findIndex((t) => t.id === selectedID);
  const selected = c.storage[selectedIndex];
  const full = !c.board.some((t) => t === null);
  const side = squareTileSize(width - 26);
  const factor = 1 + (c.storageCapacity - 12) / 4;
  return (
    <PaperCard>
      <Label title size={20} style={{ textAlign: "center" }}>
        {name(save.cityID)} · {c.storage.length} / {c.storageCapacity} alan
      </Label>
      <AppProgress
        value={c.storage.length}
        total={c.storageCapacity}
        label={`${c.storage.length} / ${c.storageCapacity}`}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {Array.from({ length: c.storageCapacity }, (_, i) => {
          const tile = c.storage[i];
          return (
            <AppChoice
              key={tile?.id ?? `empty-${i}`}
              testID={`storage-${i}`}
              label={tile ? product(tile.item).name : "Boş depo alanı"}
              selected={!!tile && tile.id === selectedID}
              disabled={!tile}
              onPress={() => tile && setSelectedID(tile.id)}
              style={{ width: side, height: side }}
            >
              {tile && <Item id={tile.item} size={side * 0.85} />}
            </AppChoice>
          );
        })}
      </View>
      <Label size={13} style={{ textAlign: "center" }}>
        Eşyayı tahtaya geri almak için seç.
      </Label>
      {selected && (
        <PaperCard selected style={{ marginBottom: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Item id={selected.item} size={60} />
            <Label title size={18} style={{ flex: 1 }}>
              {product(selected.item).name}
            </Label>
          </View>
          {full && <Label color={theme.mutedInk}>Tahtada boş alan yok.</Label>}
          <AppButton
            testID="restoreSelected"
            text="Tahtaya geri al"
            disabled={full}
            onPress={() => {
              const result = dispatch({
                type: "restore",
                index: selectedIndex,
              });
              if (result?.kind === "tap") setSelectedID(null);
            }}
          />
          {full && (
            <AppButton text="Tahtaya dön" tone="secondary" onPress={onBoard} />
          )}
        </PaperCard>
      )}
      <Label title size={19} style={{ textAlign: "center", marginTop: 6 }}>
        Depoyu genişlet
      </Label>
      <AppButton
        testID="expandStorageGold"
        tone="secondary"
        text={`+4 alan · ${100 * factor} altın`}
        onPress={() => dispatch({ type: "expand", gems: false })}
      />
      <AppButton
        testID="expandStorageGems"
        tone="secondary"
        text={`+4 alan · ${5 * factor} elmas`}
        onPress={() => dispatch({ type: "expand", gems: true })}
      />
    </PaperCard>
  );
}
