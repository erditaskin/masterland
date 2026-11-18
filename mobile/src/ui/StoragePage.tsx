import { View } from "react-native";
import { Fragment, useState } from "react";
import {
  city,
  name,
  product,
  type Action,
  type Result,
  type Save,
} from "../game/engine";
import { AppButton, Button } from "./Controls";
import { PaperCard } from "./PagePrimitives";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignText } from "./DesignSpace";
import { DesignItem } from "./BoardChrome";
import { DesignProgress } from "./DesignProgress";

export function StoragePage({
  save,
  dispatch,
  onBoard,
}: {
  save: Save;
  width: number;
  dispatch: (a: Action) => Result | null;
  onBoard: () => void;
}) {
  const c = city(save);
  // Track tile identity, never a moving array index after a restore.
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const selectedIndex = c.storage.findIndex((t) => t.id === selectedID),
    selected = c.storage[selectedIndex];
  const full = !c.board.some((t) => t === null),
    factor = 1 + (c.storageCapacity - 12) / 4;
  const extra = Math.max(0, Math.ceil(c.storageCapacity / 4) - 3) * 244;
  return (
    <DesignContent end={2330 + extra + (full ? 160 : 0)}>
      <DesignText rect={[90, 730, 1026, 90]} size={56} bold align="center">
        {name(save.cityID)} · {c.storage.length} / {c.storageCapacity} alan
      </DesignText>
      <DesignProgress
        rect={[126, 840, 954, 52]}
        value={c.storage.length}
        total={c.storageCapacity}
      />
      {Array.from({ length: c.storageCapacity }, (_, i) => {
        const tile = c.storage[i],
          x = 114 + (i % 4) * 244,
          y = 930 + Math.floor(i / 4) * 244;
        return (
          <Fragment key={tile?.id ?? `empty-${i}`}>
            <PaperCard
              designRect={[x, y, 232, 232]}
              selected={!!tile && tile.id === selectedID}
            />
            {tile && (
              <DesignItem id={tile.item} rect={[x + 20, y + 20, 192, 192]} />
            )}
            <DesignBox rect={[x, y, 232, 232]}>
              <Button
                testID={`storage-${i}`}
                label={tile ? product(tile.item).name : "Boş depo alanı"}
                disabled={!tile}
                selected={!!tile && tile.id === selectedID}
                onPress={() => tile && setSelectedID(tile.id)}
                style={{ flex: 1 }}
              >
                <View />
              </Button>
            </DesignBox>
          </Fragment>
        );
      })}
      <DesignText rect={[114, 1680 + extra, 990, 85]} size={38} align="center">
        Eşyayı tahtaya geri almak için seç.
      </DesignText>
      {selected && (
        <>
          <PaperCard designRect={[90, 1780 + extra, 1026, 280]} selected />
          <DesignItem id={selected.item} rect={[120, 1805 + extra, 170, 170]} />
          <DesignText rect={[320, 1800 + extra, 740, 93]} size={50} bold>
            {product(selected.item).name}
          </DesignText>
          <AppButton
            designRect={[320, 1910 + extra, 750, 132]}
            testID="restoreSelected"
            text={full ? "Tahtada boş alan yok" : "Tahtaya geri al"}
            disabled={full}
            onPress={() => {
              const result = dispatch({
                type: "restore",
                index: selectedIndex,
                expectedID: selected.id,
              });
              if (result?.kind === "move") setSelectedID(null);
            }}
          />
        </>
      )}
      <DesignText
        rect={[90, 2080 + extra, 1026, 75]}
        size={48}
        bold
        align="center"
      >
        Depoyu genişlet
      </DesignText>
      <AppButton
        designRect={[90, 2170 + extra, 495, 132]}
        testID="expandStorageGold"
        text={`+4 alan · ${100 * factor} altın`}
        tone="secondary"
        onPress={() => dispatch({ type: "expand", gems: false })}
      />
      <AppButton
        designRect={[615, 2170 + extra, 495, 132]}
        testID="expandStorageGems"
        text={`+4 alan · ${5 * factor} elmas`}
        tone="secondary"
        onPress={() => dispatch({ type: "expand", gems: true })}
      />
      {full && (
        <AppButton
          designRect={[90, 2340 + extra, 1026, 132]}
          text="Tahtaya dön"
          tone="secondary"
          onPress={onBoard}
        />
      )}
    </DesignContent>
  );
}
