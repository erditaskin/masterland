import { cityArt } from "./cityArt";
import { cityThemes } from "./cityTheme";
export const cityScenes = Object.fromEntries(
  Object.entries(cityArt).map(([id, art]) => [
    id,
    { source: art.scene, color: cityThemes[id]!.primary },
  ]),
);
export const upcomingCities = [
  { reference: "Yew", tr: "Yelepınar", en: "Manespring" },
  { reference: "Moonglow", tr: "Hilalkapı", en: "Moongate" },
  { reference: "Wind", tr: "Yeraltı", en: "Undercity" },
  { reference: "Trinsic", tr: "Gümüşhisar", en: "Silverhold" },
  { reference: "Jhelom", tr: "Çelikova", en: "Steelvale" },
  { reference: "Britain", tr: "Altınhisar", en: "Goldspire" },
  { reference: "Buccaneer's Den", tr: "Saklıkoy", en: "Treasurebay" },
  { reference: "Nujel'm", tr: "Sedefyaka", en: "Pearlshore" },
  { reference: "Delucia", tr: "Karayonca", en: "Darkclover" },
  { reference: "Papua", tr: "Sazlıdere", en: "Reedmire" },
  { reference: "Magincia", tr: "Rünyaka", en: "Runeshore" },
];
