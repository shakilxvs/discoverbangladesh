'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseVideoUrl } from '@/lib/video';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types';

const AUTOPLAY_MS = 6000;

function SlideMedia({ slide }: { slide: HeroSlide }) {
  if (slide.type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.mediaUrl}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    );
  }

  const video = parseVideoUrl(slide.mediaUrl);
  if (!video) return <div className="h-full w-full bg-neutral-900" />;

  if (video.type === 'direct') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={video.embedUrl}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  // YouTube / Vimeo: append autoplay/mute/loop params so it behaves like a
  // background video rather than a player the visitor has to press play on.
  const bg =
    video.type === 'youtube'
      ? `${video.embedUrl}?autoplay=1&mute=1&loop=1&controls=0&playlist=${video.embedUrl.split('/').pop()}`
      : `${video.embedUrl}?autoplay=1&muted=1&loop=1&background=1`;

  return (
    <iframe
      src={bg}
      title="Banner video"
      className="h-full w-full scale-[1.02] border-0 object-cover"
      allow="autoplay; encrypted-media"
    />
  );
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;

  const slide = slides[index];
  const goTo = (i: number) => setIndex((i + count) % count);

  return (
    <div className="group relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-900">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <SlideMedia slide={s} />
        </div>
      ))}

      {/* Bottom-left text overlay, readable over any image/video */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-4xl">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
        )}
        {slide.ctaLabel && slide.ctaUrl && (
          <Link
            href={slide.ctaUrl}
            className="pointer-events-auto mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90"
          >
            {slide.ctaLabel}
          </Link>
        )}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1.5 sm:bottom-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
