'use client';

import Image from 'next/image';
import type { HeroBackgroundProps } from './hero.types';

export default function HeroBackground({ background }: HeroBackgroundProps) {
  const overlayOpacity = background.overlayOpacity ?? 0.5;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {background.type === 'gradient' && background.gradient && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${background.gradient.direction ?? 'to bottom right'}, ${background.gradient.from}${background.gradient.via ? `, ${background.gradient.via}` : ''}, ${background.gradient.to})`,
          }}
        />
      )}

      {background.type === 'image' && background.image && (
        <Image
          src={background.image.src}
          alt={background.image.alt}
          fill
          priority
          className="object-cover"
          {...(background.image.blurDataURL
            ? {
                placeholder: 'blur' as const,
                blurDataURL: background.image.blurDataURL,
              }
            : {})}
        />
      )}

      {background.type === 'video' && background.video && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={background.video.posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src={background.video.src}
            type={background.video.type ?? 'video/mp4'}
          />
        </video>
      )}

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        data-testid="hero-overlay"
      />
    </div>
  );
}
