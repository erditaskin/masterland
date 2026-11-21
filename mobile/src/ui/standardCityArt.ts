import { belenyakaArt } from "./belenyakaArt";

const badincaArt: typeof belenyakaArt = {
  level: belenyakaArt.level,
  wallet: belenyakaArt.wallet,
  scene: require("../../assets/art/badinca/scene.png"),
  upperPanel: require("../../assets/art/badinca/upper-panel.png"),
  board: require("../../assets/art/badinca/board-6x9.png"),
  filter: require("../../assets/art/badinca/05-filtre.png"),
  heading: require("../../assets/art/badinca/heading.png"),
  profile: require("../../assets/art/badinca/07-profil.png"),
  shelf: require("../../assets/art/badinca/11-uretici-rafi.png"),
  navigation: require("../../assets/art/cities-v1/city2-chrome.png"),
  navigationCrop: [52, 754, 1432, 198],
  navigationBakedDividers: false,
  navigationSelected: require("../../assets/art/badinca/menu-selected.png"),
  order: belenyakaArt.order,
  orderMissing: [
    require("../../assets/art/badinca/ilan-sol-kenar-eksik.png"),
    require("../../assets/art/badinca/ilan-orta-doku-eksik.png"),
    require("../../assets/art/badinca/ilan-sag-kenar-eksik.png"),
  ],
  give: require("../../assets/art/badinca/ilan-ver-dugmesi.png"),
  producers: [
    require("../../assets/art/producer-hd/city2-1.jpg"),
    require("../../assets/art/producer-hd/city2-2.jpg"),
    require("../../assets/art/producer-hd/city2-3.jpg"),
    require("../../assets/art/producer-hd/city2-4.jpg"),
    require("../../assets/art/producer-hd/city2-5.jpg"),
  ],
};

const yalikoruArt: typeof belenyakaArt = {
  ...belenyakaArt,
  scene: require("../../assets/art/cities-v1/city3-scene.png"),
  heading: require("../../assets/art/yalikoru/heading.png"),
  shelf: require("../../assets/art/yalikoru/shelf.png"),
  navigation: require("../../assets/art/yalikoru/navigation.png"),
  navigationCrop: undefined,
  navigationBakedDividers: true,
  navigationSelected: require("../../assets/art/yalikoru/menu-selected.png"),
  orderMissing: badincaArt.orderMissing,
  producers: [
    require("../../assets/art/producer-hd/city3-1.jpg"),
    require("../../assets/art/producer-hd/city3-2.jpg"),
    require("../../assets/art/producer-hd/city3-3.jpg"),
    require("../../assets/art/producer-hd/city3-4.jpg"),
    require("../../assets/art/producer-hd/city3-5.jpg"),
  ],
};

const ipekyoluArt: typeof belenyakaArt = {
  ...belenyakaArt,
  scene: require("../../assets/art/cities-v1/city5-scene.png"),
  heading: require("../../assets/art/ipekyolu/heading.png"),
  shelf: require("../../assets/art/ipekyolu/shelf.png"),
  board: require("../../assets/art/ipekyolu/board-6x9.png"),
  navigation: require("../../assets/art/ipekyolu/navigation.png"),
  navigationCrop: undefined,
  navigationSelected: undefined,
  orderMissing: badincaArt.orderMissing,
  producers: [
    require("../../assets/art/producer-hd/city5-1.jpg"),
    require("../../assets/art/producer-hd/city5-2.jpg"),
    require("../../assets/art/producer-hd/city5-3.jpg"),
    require("../../assets/art/producer-hd/city5-4.jpg"),
    require("../../assets/art/producer-hd/city5-5.jpg"),
  ],
};

const demirdereArt: typeof belenyakaArt = {
  ...belenyakaArt,
  scene: require("../../assets/art/cities-v1/city4-scene.png"),
  upperPanel: require("../../assets/art/demirdere/shelf.png"),
  heading: require("../../assets/art/demirdere/heading.png"),
  shelf: require("../../assets/art/demirdere/shelf.png"),
  board: require("../../assets/art/demirdere/board-6x9.png"),
  navigation: require("../../assets/art/demirdere/navigation.png"),
  navigationCrop: undefined,
  navigationSelected: undefined,
  orderMissing: badincaArt.orderMissing,
  producers: [
    require("../../assets/art/producer-hd/city4-1.jpg"),
    require("../../assets/art/producer-hd/city4-2.jpg"),
    require("../../assets/art/producer-hd/city4-3.jpg"),
    require("../../assets/art/producer-hd/city4-4.jpg"),
    require("../../assets/art/producer-hd/city4-5.jpg"),
  ],
};

const cities: Readonly<Partial<Record<string, typeof belenyakaArt>>> = {
  city1: belenyakaArt,
  city2: badincaArt,
  city3: yalikoruArt,
  city4: demirdereArt,
  city5: ipekyoluArt,
};

export function standardArtForCity(cityID: string) {
  return cities[cityID];
}
