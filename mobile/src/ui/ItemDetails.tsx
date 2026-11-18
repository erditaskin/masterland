import { product, producerCatalog as producers } from "../game/engine";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { DesignItem } from "./BoardChrome";
import { AppButton } from "./Controls";

export function ItemDetails({
  itemID,
  onStore,
  onProducer,
}: {
  itemID: string;
  onStore: () => void;
  onProducer: () => void;
}) {
  const item = product(itemID),
    producer = producers[item.producer]!;
  return (
    <DesignContent end={2080}>
      <DesignItem id={itemID} rect={[350, 740, 506, 506]} />
      <DesignText rect={[90, 1280, 1026, 115]} size={70} bold align="center">
        {item.name}
      </DesignText>
      <DesignText rect={[90, 1410, 1026, 90]} size={42} align="center">
        Basamak {item.tier} · {producer.name}
      </DesignText>
      <DesignText rect={[130, 1530, 946, 150]} size={43} align="center">
        Bu ürünü ilanlarda teslim edebilir veya depoya kaldırabilirsin.
      </DesignText>
      <AppButton
        designRect={[90, 1740, 1026, 132]}
        text="Depoya gönder"
        testID="storeSelected"
        onPress={onStore}
      />
      <AppButton
        designRect={[90, 1910, 1026, 132]}
        text="Üreticiyi gör"
        tone="secondary"
        onPress={onProducer}
      />
    </DesignContent>
  );
}
