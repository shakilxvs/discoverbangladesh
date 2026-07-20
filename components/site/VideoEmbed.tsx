import { parseVideoUrl } from '@/lib/video';

export function VideoEmbed({ url }: { url?: string }) {
  const video = parseVideoUrl(url);
  if (!video) return null;

  if (video.type === 'direct') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={video.embedUrl}
        controls
        className="aspect-video w-full rounded-2xl bg-black"
      />
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={video.embedUrl}
        title="Spot video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
