import { standardArtForCity } from "./standardCityArt";
import { memo } from "react";
import { Image } from "react-native";
import {
  DesignImage,
  DesignBox,
  DesignSurface,
  DesignText,
  type DesignRect,
} from "./DesignSpace";
import { useCityTheme } from "./CityThemeProvider";
import { cityArt } from "./cityArt";
import frames from "../../assets/art/cities-v1/frame-bounds.json";
import chrome from "../../assets/art/cities-v1/chrome-bounds.json";

export const MaterialFrame = memo(function MaterialFrame({
  rect,
  paper = true,
  purpose = "panel",
}: {
  rect: DesignRect;
  paper?: boolean;
  purpose?: "panel" | "board";
}) {
  const theme = useCityTheme(),
    [x, y, w, h] = rect;
  const approved = purpose === "board" ? cityArt[theme.id]!.board : undefined;
  const measured = approved ? Image.resolveAssetSource(approved.frame) : null;
  const [sx, sy, sw, sh] = measured
    ? [0, 0, measured.width, measured.height]
    : (frames as Record<string, number[]>)[theme.id]!;
  const edge = approved ? (theme.id === "city1" ? (58 * 164) / 139 : 34) : 48,
    b = approved ? 22 : 128;
  return (
    <>
      {paper && (
        <DesignSurface
          rect={[x + 10, y + 10, w - 20, h - 20]}
          fill={theme.paperLight}
          end={theme.paper}
          radius={40}
        />
      )}
      {Array.from({ length: 9 }, (_, i) => {
        if (i === 4) return null;
        const row = Math.floor(i / 3),
          col = i % 3;
        const target: DesignRect = [
          [x, x + edge, x + w - edge][col]!,
          [y, y + edge, y + h - edge][row]!,
          [edge, w - 2 * edge, edge][col]!,
          [edge, h - 2 * edge, edge][row]!,
        ];
        if (approved)
          return (
            <DesignBox key={i} rect={target}>
              <Image
                source={approved.slices[i]!}
                resizeMode="stretch"
                fadeDuration={0}
                style={{ width: "100%", height: "100%" }}
                accessible={false}
              />
            </DesignBox>
          );
        return (
          <DesignImage
            key={i}
            source={cityArt[theme.id]!.frame}
            rect={[
              [x, x + edge, x + w - edge][col]!,
              [y, y + edge, y + h - edge][row]!,
              [edge, w - 2 * edge, edge][col]!,
              [edge, h - 2 * edge, edge][row]!,
            ]}
            crop={[
              [sx!, sx! + b, sx! + sw! - b][col]!,
              [sy!, sy! + b, sy! + sh! - b][row]!,
              [b, sw! - 2 * b, b][col]!,
              [b, sh! - 2 * b, b][row]!,
            ]}
          />
        );
      })}
    </>
  );
});
export function MaterialPlaque({
  rect,
  title,
}: {
  rect: DesignRect;
  title: string;
}) {
  const theme = useCityTheme(),
    [x, y, w, h] = rect;
  const approvedHeading = cityArt[theme.id]!.heading;
  const harborHeading =
    theme.id === "city3" ? standardArtForCity(theme.id)?.heading : undefined;
  if (approvedHeading?.label === title)
    return (
      <DesignBox rect={rect} style={{ borderRadius: 999, overflow: "hidden" }}>
        <Image
          source={approvedHeading.source}
          resizeMode="stretch"
          fadeDuration={0}
          accessible
          accessibilityRole="header"
          accessibilityLabel={title}
          style={{ width: "100%", height: "100%" }}
        />
      </DesignBox>
    );
  return (
    <>
      <DesignImage
        source={harborHeading ?? cityArt[theme.id]!.chrome}
        rect={rect}
        crop={
          harborHeading
            ? undefined
            : ((chrome as Record<string, number[][]>)[
                theme.id
              ]![0] as unknown as DesignRect)
        }
      />
      <DesignText
        rect={[x + w * 0.17, y, w * 0.66, h]}
        size={64}
        fit
        bold
        color={theme.onHeading}
        align="center"
      >
        {title}
      </DesignText>
    </>
  );
}
export function MaterialTray({ rect }: { rect: DesignRect }) {
  const theme = useCityTheme();
  return (
    <DesignImage
      source={cityArt[theme.id]!.chrome}
      rect={rect}
      crop={
        (chrome as Record<string, number[][]>)[
          theme.id
        ]![1] as unknown as DesignRect
      }
    />
  );
}
