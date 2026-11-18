import type { ImageSourcePropType } from "react-native";

/** Static Metro references; artwork is decoded only when its city is displayed. */
export const cityArt: Readonly<
  Record<
    string,
    {
      scene: ImageSourcePropType;
      environment?: ImageSourcePropType;
      navigationFrame?: ImageSourcePropType;
      shelfFrame?: ImageSourcePropType;
      frame: ImageSourcePropType;
      chrome: ImageSourcePropType;
      heading?: { label: string; source: ImageSourcePropType };
      board?: {
        cell: ImageSourcePropType;
        frame: ImageSourcePropType;
        slices: readonly (ImageSourcePropType | null)[];
      };
    }
  >
> = Object.freeze({
  city1: {
    shelfFrame: require("../../assets/art/wood-composites-v2/navigation.png"),
    navigationFrame: require("../../assets/art/wood-composites-v2/shelf.png"),
    environment: require("../../assets/art/approved-iphone-v1/city1-environment.png"),
    heading: {
      label: "Belenyaka",
      source: require("../../assets/art/approved-iphone-v1/city1-heading.png"),
    },
    board: {
      cell: require("../../assets/art/belenyaka-html/cell.png"),
      frame: require("../../assets/art/approved-iphone-v1/city1-frame.png"),
      slices: [
        require("../../assets/art/belenyaka-html/frame-0.png"),
        require("../../assets/art/belenyaka-html/frame-1.png"),
        require("../../assets/art/belenyaka-html/frame-2.png"),
        require("../../assets/art/belenyaka-html/frame-3.png"),
        null,
        require("../../assets/art/belenyaka-html/frame-5.png"),
        require("../../assets/art/belenyaka-html/frame-6.png"),
        require("../../assets/art/belenyaka-html/frame-7.png"),
        require("../../assets/art/belenyaka-html/frame-8.png"),
      ],
    },
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
