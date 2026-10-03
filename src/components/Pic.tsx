import type { CSSProperties } from "react";
import type { Img } from "@/lib/types";

type Props = {
  img: Img;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** se false, nessun object-position dal punto focale */
  focal?: boolean;
  alt?: string;
};

const set = (img: Img, ext: string) => img.widths.map((w) => `${img.base}-${w}.${ext} ${w}w`).join(", ");

/** <picture> AVIF → WebP → JPEG, con srcset responsive, alt e punto focale. */
export function Pic({ img, sizes, priority, className, style, focal = true, alt }: Props) {
  const fallbackW = img.widths.find((w) => w >= 1280) ?? img.widths[img.widths.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={set(img, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set(img, "webp")} sizes={sizes} />
      <img
        src={`${img.base}-${fallbackW}.jpg`}
        srcSet={set(img, "jpg")}
        sizes={sizes}
        alt={alt ?? img.alt}
        width={img.w}
        height={img.h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className={className}
        style={{
          backgroundColor: img.color,
          ...(focal ? { objectPosition: `${(img.focal.x * 100).toFixed(1)}% ${(img.focal.y * 100).toFixed(1)}%` } : null),
          ...style,
        }}
      />
    </picture>
  );
}
