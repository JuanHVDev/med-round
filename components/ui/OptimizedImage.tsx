"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  alt: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  sizes,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {hasError ? (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Imagen no disponible</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          className={`
            duration-700 ease-in-out
            ${isLoading ? "scale-110 blur-lg grayscale" : "scale-100 blur-0 grayscale-0"}
          `}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          {...props}
        />
      )}
    </div>
  );
}

interface LazyImageProps extends Omit<ImageProps, "src"> {
  src: string;
  threshold?: number;
}

export function LazyImage({ src, alt, threshold = 0.1, ...props }: LazyImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      placeholder="empty"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc: string;
  priority?: boolean;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  priority = false,
  className,
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      {mobileSrc && (
        <source srcSet={mobileSrc} media="(max-width: 640px)" />
      )}
      {tabletSrc && (
        <source srcSet={tabletSrc} media="(max-width: 1024px)" />
      )}
      <OptimizedImage
        src={desktopSrc || src}
        alt={alt}
        priority={priority}
        fill
        className="object-cover"
        sizes="100vw"
      />
    </picture>
  );
}
