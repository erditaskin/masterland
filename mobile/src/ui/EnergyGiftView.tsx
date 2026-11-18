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
}: {
  used: number;
  text: string;
  disabled: boolean;
  message?: string;
  onWatch: () => void;
  onCancel: () => void;
}) {
  return (
    <DesignContent end={message ? 2580 : 2300}>
      <ChromeSprite index={5} rect={[372, 760, 462, 462]} />
      <DesignText rect={[90, 1250, 1026, 156]} size={100} bold align="center">
        +25 enerji
      </DesignText>
      <DesignText rect={[110, 1430, 986, 90]} size={43} align="center">
        İsteğe bağlı reklamı tamamla.
      </DesignText>
      <PaperCard designRect={[250, 1570, 706, 132]} />
      <DesignText rect={[250, 1570, 706, 132]} size={39} bold align="center">
        Günlük hediyeler: {used}/4
      </DesignText>
      <AppButton
        designRect={[90, 1770, 1026, 132]}
        text={text}
        disabled={disabled}
        testID="watchEnergyAd"
        onPress={onWatch}
      />
      <AppButton
        designRect={[240, 1940, 726, 132]}
        text="Vazgeç"
        tone="secondary"
        onPress={onCancel}
      />
      <DesignText rect={[110, 2160, 986, 110]} size={37} align="center">
        Reklam tamamlanmadan ödül verilmez.
      </DesignText>
      {message && (
        <DesignText rect={[110, 2320, 986, 210]} size={38} align="center">
          {message}
        </DesignText>
      )}
    </DesignContent>
  );
}
