import { Image, useWindowDimensions } from "react-native";
import { GuideSpotlight, type FocusRect } from "./GuideSpotlight";
import { View } from "react-native";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { accountText as tx } from "../i18n/locale";
import type { Action, Save } from "../game/engine";
import { ModalCard } from "./ModalCard";
import { ActionButton, Button, Label } from "./Controls";

export function FirstRunGuide({
  step,
  gift,
  powerHint,
  top,
  dispatch,
  openEnergy,
  openAccount,
  reduced,
  focus,
  waitingForPair,
  waitingForOrder,
  orderNeedsWheat,
  practice,
}: {
  step: Save["onboarding"];
  gift: boolean;
  powerHint: boolean;
  top: number;
  reduced: boolean;
  focus: readonly FocusRect[];
  practice: boolean;
  waitingForPair: boolean;
  waitingForOrder: boolean;
  orderNeedsWheat: boolean;
  dispatch: (action: Action) => unknown;
  openEnergy: () => void;
  openAccount: () => void;
}) {
  const { width, height } = useWindowDimensions();
  if (!gift && !powerHint && (!step || step === "done")) return null;
  const modal = gift || step === "welcome" || step === "energy";
  const lessons = {
    produce: tx(
      "İlk ürününü çıkarmak için tarlaya dokun.",
      "Tap the field to produce your first item.",
    ),
    merge: waitingForPair
      ? tx(
          "Eşini çıkarmak için tarlaya tekrar dokun.",
          "Tap the field again to make a matching item.",
        )
      : tx(
          "Aydınlatılan iki üründen birini eşine sürükle.",
          "Drag one highlighted item onto its match.",
        ),
    deliver: waitingForOrder
      ? orderNeedsWheat
        ? tx(
            "Sipariş için bir buğday daha üret.",
            "Produce one more wheat to fill the order.",
          )
        : tx(
            "Bir sipariş seç. Eksik ürünleri üret veya birleştir.",
            "Choose an order. Produce or merge the missing items.",
          )
      : tx(
          "Yeşil sipariş kartına dokun ve ödülünü kazan.",
          "Tap a green order card to collect your reward.",
        ),
  };
  const portrait = !gift && !powerHint;
  const compact = !modal;
  const title = gift
    ? tx("Durma, bu bizden!", "Keep going, this one's on us!")
    : step === "welcome"
      ? tx("Belenyaka’ya hoş geldin!", "Welcome to Belenyaka!")
      : step === "energy"
        ? tx("Enerjini takip et", "Keep an eye on energy")
        : null;
  return (
    <View
      pointerEvents={modal ? "auto" : "box-none"}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 45,
        alignItems: "center",
        justifyContent: modal ? "center" : "flex-start",
        paddingTop: modal ? 0 : top,
        backgroundColor: modal ? "#102419c9" : "transparent",
      }}
    >
      {!modal && focus.length > 0 && (
        <GuideSpotlight
          rects={focus}
          width={width}
          height={height}
          reduced={reduced}
        />
      )}
      <View style={{ width: "92%", maxWidth: 390 }}>
        {portrait && modal && (
          <Animated.View
            pointerEvents="none"
            entering={reduced ? undefined : SlideInLeft.duration(300)}
            style={{ height: 132, marginBottom: -15, alignSelf: "center" }}
          >
            <Image
              source={require("../../assets/art/tutorial/belenyaka-guide.png")}
              style={{ width: 150, height: 136 }}
              resizeMode="contain"
            />
          </Animated.View>
        )}
        <ModalCard
          key={gift ? "energy-gift" : powerHint ? "power-hint" : step}
          compact={compact}
          reduced={reduced}
        >
          {title && (
            <Label title size={24} style={{ textAlign: "center" }}>
              {title}
            </Label>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {portrait && compact && (
              <Animated.View
                entering={reduced ? undefined : FadeIn.duration(180)}
                pointerEvents="none"
              >
                <Image
                  source={require("../../assets/art/tutorial/belenyaka-guide.png")}
                  style={{ width: 48, height: 46 }}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
            <View style={{ flex: 1 }}>
              <Label size={15}>
                {gift
                  ? tx("+100 ücretsiz enerji", "+100 free energy")
                  : step === "welcome"
                    ? tx(
                        "Üret, birleştir ve ilk siparişini teslim et.",
                        "Produce, merge, and deliver your first order.",
                      )
                    : step === "energy"
                      ? tx(
                          "Enerji zamanla dolar. Enerji ekranından elmasla enerji de alabilirsin.",
                          "Energy refills over time. You can also exchange gems for energy.",
                        )
                      : powerHint
                        ? tx(
                            "100 üzeri enerjide üreticiye basılı tut. Keşfettiğin ürünler için 2×, 4× veya 8× gücü seç.",
                            "Above 100 energy, hold a producer to choose 2×, 4×, or 8× for discovered items.",
                          )
                        : step && step !== "done"
                          ? lessons[step]
                          : ""}
              </Label>
            </View>
            {compact && portrait && (
              <Button
                testID="tutorialFinish"
                label={tx("Geç", "Skip")}
                style={{ minWidth: 44, minHeight: 44 }}
                onPress={() => dispatch({ type: "onboarding-finish" })}
              >
                <Label size={14} title>
                  {tx("Geç", "Skip")}
                </Label>
              </Button>
            )}
          </View>
          {gift ? (
            <ActionButton
              text={tx("100 enerji al", "Claim 100 energy")}
              onPress={() => dispatch({ type: "welcome-energy" })}
            />
          ) : powerHint ? (
            <ActionButton
              text={tx("Anladım", "Got it")}
              onPress={() => dispatch({ type: "power-hint-seen" })}
            />
          ) : (
            <>
              {step === "welcome" && (
                <ActionButton
                  testID="tutorialStart"
                  text={tx("Başla", "Start")}
                  onPress={() => dispatch({ type: "onboarding-start" })}
                />
              )}
              {step === "energy" && !practice && (
                <ActionButton
                  tone="secondary"
                  text={tx("Enerji seçenekleri", "Energy options")}
                  onPress={openEnergy}
                />
              )}
              {step === "energy" && !practice && (
                <ActionButton
                  tone="secondary"
                  text={tx(
                    "Hesabını bağla (isteğe bağlı)",
                    "Connect your account (optional)",
                  )}
                  onPress={() => {
                    dispatch({ type: "onboarding-finish" });
                    openAccount();
                  }}
                />
              )}
              {!compact && (
                <ActionButton
                  testID="tutorialFinish"
                  tone="secondary"
                  text={
                    step === "energy"
                      ? tx("Tamamla", "Finish")
                      : tx("Geç", "Skip")
                  }
                  onPress={() => dispatch({ type: "onboarding-finish" })}
                />
              )}
            </>
          )}
        </ModalCard>
      </View>
    </View>
  );
}
