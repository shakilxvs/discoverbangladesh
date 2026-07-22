import { MapPin } from 'lucide-react';

export function LocationButton({ url }: { url: string }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-full bg-river-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-river-700"
    >
      <MapPin className="h-4 w-4" />
      Location
    </a>
  );
}
