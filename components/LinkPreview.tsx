'use client';

import { isYouTubeUrl, isTwitterUrl } from '@/lib/utils';
import YouTubePreview from './YouTubePreview';
import TwitterPreview from './TwitterPreview';

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  if (isYouTubeUrl(url)) {
    return <YouTubePreview url={url} />;
  }

  if (isTwitterUrl(url)) {
    return <TwitterPreview url={url} />;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-900">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
      >
        {url}
      </a>
    </div>
  );
}
