import type { ImageSourcePropType } from "react-native";

/** Static Metro references; artwork is decoded only when its city is displayed. */
export const cityArt: Readonly<
  Record<
    string,
    {
      scene: ImageSourcePropType;
      frame: ImageSourcePropType;
      chrome: ImageSourcePropType;
    }
  >
> = Object.freeze({
  city1: {
    chrome: require("../../assets/art/cities-v1/city1-chrome.png"),
    scene: require("../../assets/art/cities-v1/city1-scene.png"),
    frame: require("../../assets/art/cities-v1/city1-frame.png"),
  },
  city2: {
    chrome: require("../../assets/art/cities-v1/city2-chrome.png"),
    scene: require("../../assets/art/cities-v1/city2-scene.png"),
    frame: require("../../assets/art/cities-v1/city2-frame.png"),
  },
  city3: {
    chrome: require("../../assets/art/cities-v1/city3-chrome.png"),
    scene: require("../../assets/art/cities-v1/city3-scene.png"),
    frame: require("../../assets/art/cities-v1/city3-frame.png"),
  },
  city4: {
    chrome: require("../../assets/art/cities-v1/city4-chrome.png"),
    scene: require("../../assets/art/cities-v1/city4-scene.png"),
    frame: require("../../assets/art/cities-v1/city4-frame.png"),
  },
  city5: {
    chrome: require("../../assets/art/cities-v1/city5-chrome.png"),
    scene: require("../../assets/art/cities-v1/city5-scene.png"),
    frame: require("../../assets/art/cities-v1/city5-frame.png"),
  },
});
