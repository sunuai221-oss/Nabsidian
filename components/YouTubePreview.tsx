'use client';

import { extractYouTubeId } from '@/lib/utils';

interface YouTubePreviewProps {
  url: string;
}

export default function YouTubePreview({ url }: YouTubePreviewProps) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return <div className="text-sm text-gray-500">Invalid YouTube URL</div>;
  }

  return (
    <div className="aspect-video w-full max-w-2xl">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded border border-gray-300 dark:border-gray-700"
      />
    </div>
  );
}
