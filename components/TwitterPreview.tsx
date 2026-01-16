'use client';

import { useEffect, useState } from 'react';
import { extractTwitterId } from '@/lib/utils';

interface TwitterPreviewProps {
  url: string;
}

export default function TwitterPreview({ url }: TwitterPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const tweetId = extractTwitterId(url);

  useEffect(() => {
    if (!loaded && tweetId) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
      setLoaded(true);
    }
  }, [loaded, tweetId]);

  if (!tweetId) {
    return <div className="text-sm text-gray-500">Invalid Twitter/X URL</div>;
  }

  return (
    <div className="max-w-xl">
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}
