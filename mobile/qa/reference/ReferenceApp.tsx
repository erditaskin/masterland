/** Independent, read-only design harness. Never imported by the application entry. */
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Apple from "expo-apple-authentication";
import { sources } from "./assets";

type Rect = [number, number, number, number];
interface Command {
  kind: string;
  rect: Rect;
  clip?: Rect;
  fill?: string;
  end?: string;
  stroke?: string;
  line?: number;
  radius?: number;
  text?: string;
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
  font?: string;
  file?: string;
  crop?: Rect;
  fit?: boolean;
  previewOnly?: boolean;
}
interface Scene {
  id: string;
  width: number;
  height: number;
  commands: Command[];
}
const scenes = require("./scenes.json") as Record<string, Scene>;

function Layer({
  command: c,
  scale,
  onImage,
}: {
  command: Command;
  scale: number;
  onImage: () => void;
}) {
  if (c.previewOnly || c.kind === "system-home-indicator") return null;
  const [x, y, w, h] = c.rect;
  const clip = c.clip;
  const style: ViewStyle = {
    position: "absolute",
    left: (x - (clip?.[0] ?? 0)) * scale,
    top: (y - (clip?.[1] ?? 0)) * scale,
    width: w * scale,
    height: h * scale,
  };
  let content;
  if (c.kind === "rect") {
    content = (
      <View
        style={[
          style,
          {
            borderRadius: (c.radius ?? 0) * scale,
            backgroundColor: c.fill,
            borderColor: c.stroke,
            borderWidth: c.stroke ? (c.line ?? 2) * scale : 0,
            backgroundImage:
              c.fill && c.end
                ? `linear-gradient(135deg, ${c.fill} 0%, ${c.end} 100%)`
                : undefined,
          },
        ]}
      />
    );
  } else if (c.kind === "image") {
    const source = sources[c.file!]!;
    const meta = Image.resolveAssetSource(source);
    if (!meta?.width || !meta.height)
      throw Error("Missing reference asset dimensions: " + c.file);
    const [sx, sy, sw, sh]: Rect = c.crop ?? [0, 0, meta.width, meta.height];
    const factor = c.fit ? Math.min(w / sw, h / sh) : 0;
    const dw = c.fit ? sw * factor : w,
      dh = c.fit ? sh * factor : h;
    content = (
      <View
        style={[
          style,
          { overflow: "hidden", borderRadius: (c.radius ?? 0) * scale },
        ]}
      >
        <View
          style={{
            position: "absolute",
            left: ((w - dw) * scale) / 2,
            top: ((h - dh) * scale) / 2,
            width: dw * scale,
            height: dh * scale,
            overflow: "hidden",
          }}
        >
          <Image
            source={source}
            fadeDuration={0}
            onLoadEnd={onImage}
            resizeMode="stretch"
            style={{
              position: "absolute",
              left: ((-sx * dw) / sw) * scale,
              top: ((-sy * dh) / sh) * scale,
              width: ((meta.width * dw) / sw) * scale,
              height: ((meta.height * dh) / sh) * scale,
            }}
          />
        </View>
      </View>
    );
  } else if (c.kind === "text") {
    content = (
      <View style={[style, { justifyContent: "center", overflow: "hidden" }]}>
        <Text
          accessible={false}
          allowFontScaling={false}
          style={{
            fontFamily: c.font ?? (c.bold ? "Georgia-Bold" : "Georgia"),
            fontSize: (c.size ?? 42) * scale,
            color: c.fill,
            textAlign: c.align ?? "left",
            includeFontPadding: false,
          }}
        >
          {c.text}
        </Text>
      </View>
    );
  } else if (c.kind === "native-apple") {
    content = (
      <Apple.AppleAuthenticationButton
        buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={style}
        onPress={() => {}}
      />
    );
  } else return null;
  return clip ? (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: clip[0] * scale,
        top: clip[1] * scale,
        width: clip[2] * scale,
        height: clip[3] * scale,
        overflow: "hidden",
      }}
    >
      {content}
    </View>
  ) : (
    content
  );
}

function Canvas({ scene }: { scene: Scene }) {
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const loaded = useRef(0);
  const expected = scene.commands.filter(
    (c) => c.kind === "image" && !c.previewOnly,
  ).length;
  const correctViewport =
    Math.round(width * 3) === scene.width &&
    Math.round(height * 3) === scene.height;
  const onImage = () => {
    loaded.current += 1;
    if (loaded.current >= expected)
      requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };
  if (!correctViewport)
    return (
      <Text testID="referenceWrongViewport">
        Wrong reference viewport: {width}×{height}
      </Text>
    );
  return (
    <View pointerEvents="none" style={{ flex: 1 }}>
      {scene.commands.map((command, index) => (
        <Layer
          key={index}
          command={command}
          scale={width / scene.width}
          onImage={onImage}
        />
      ))}
      {ready && (
        <View
          accessible
          accessibilityLabel={scene.id}
          testID="referenceReady"
          style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1 }}
        />
      )}
    </View>
  );
}

export function ReferenceApp() {
  const [id, setID] = useState("city1-board");
  useEffect(() => {
    const select = (url: string | null | undefined) => {
      const key = /^masterland:\/\/design-reference\/([a-z0-9-]+)$/.exec(
        url ?? "",
      )?.[1];
      if (key && scenes[key]) setID(key);
    };
    void Linking.getInitialURL().then(select);
    const listener = Linking.addEventListener("url", (event) =>
      select(event.url),
    );
    return () => listener.remove();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden />
      <Canvas key={id} scene={scenes[id]!} />
    </View>
  );
}
