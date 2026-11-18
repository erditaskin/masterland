import { memo } from "react";
import {
  DesignImage,
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
}: {
  rect: DesignRect;
  paper?: boolean;
}) {
  const theme = useCityTheme(),
    [x, y, w, h] = rect;
  const [sx, sy, sw, sh] = (frames as Record<string, number[]>)[theme.id]!;
  const edge = 48,
    b = 128;
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
  return (
    <>
      <DesignImage
        source={cityArt[theme.id]!.chrome}
        rect={rect}
        crop={
          (chrome as Record<string, number[][]>)[
            theme.id
          ]![0] as unknown as DesignRect
        }
      />
      <DesignText
        rect={[x + w * 0.17, y, w * 0.66, h]}
        size={64}
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
