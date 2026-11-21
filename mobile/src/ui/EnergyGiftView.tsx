import { exchanges } from "../game/engine";
import { accountText as tx } from "../i18n/locale";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { ChromeSprite } from "./GameChrome";
import { PaperCard } from "./PagePrimitives";
import { AppButton } from "./Controls";

/** The ad controller supplies facts and actions; this view never grants a reward. */
export function EnergyGiftView({
  used,
  text,
  disabled,
  message,
  onWatch,
  onCancel,
  purchase,
}: {
  used: number;
  text: string;
  disabled: boolean;
  message?: string;
  onWatch: () => void;
  onCancel: () => void;
  purchase?: { balance: number; onPress: () => void };
}) {
  const offer = exchanges.find(({ id }) => id === "energy25")!;
  const offset = purchase ? 170 : 0;
  return (
    <DesignContent end={(message ? 2580 : 2300) + offset}>
      <ChromeSprite index={5} rect={[372, 760, 462, 462]} />
      <DesignText rect={[90, 1250, 1026, 156]} size={100} bold align="center">
        +25 enerji
      </DesignText>
      <DesignText rect={[110, 1430, 986, 90]} size={43} align="center">
        {tx("Reklam izle veya elmas kullan.", "Watch an ad or use gems.")}
      </DesignText>
      <PaperCard designRect={[250, 1570, 706, 132]} />
      <DesignText rect={[250, 1570, 706, 132]} size={39} bold align="center">
        {tx(`Günlük reklam ödülleri: ${used}/4`, `Daily ad rewards: ${used}/4`)}
      </DesignText>
      <AppButton
        designRect={[90, 1770, 1026, 132]}
        text={text}
        disabled={disabled}
        testID="watchEnergyAd"
        onPress={onWatch}
      />
      {purchase && (
        <AppButton
          designRect={[90, 1940, 1026, 132]}
          text={tx(
            `${offer.gems} elmas · +${offer.energy} enerji`,
            `${offer.gems} gems · +${offer.energy} energy`,
          )}
          tone="secondary"
          disabled={purchase.balance < offer.gems}
          testID="buyEnergyGems"
          onPress={purchase.onPress}
        />
      )}
      <AppButton
        designRect={[240, 1940 + offset, 726, 132]}
        text="Vazgeç"
        tone="secondary"
        onPress={onCancel}
      />
      <DesignText rect={[110, 2160 + offset, 986, 110]} size={37} align="center">
        Reklam tamamlanmadan ödül verilmez.
      </DesignText>
      {message && (
        <DesignText rect={[110, 2320 + offset, 986, 210]} size={38} align="center">
          {message}
        </DesignText>
      )}
    </DesignContent>
  );
}
