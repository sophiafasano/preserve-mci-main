import { useState } from 'react';
import { PlayCircle, CheckCircle, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration?: string;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  title,
  duration,
  onComplete,
  isCompleted = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleMarkComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <p className="text-red-600 text-base">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xl">
        {!isPlaying && !isCompleted && (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-xl z-10"
              aria-label="Play video"
            >
              <PlayCircle
                className="w-10 h-10 text-purple-700 ml-1"
                fill="currentColor"
              />
            </button>
            {duration && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                {duration}
              </div>
            )}
          </div>
        )}

        {isPlaying && !isCompleted && (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </>
        )}

        {isCompleted && (
          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">Video Completed!</p>
              <button
                onClick={() => setIsPlaying(true)}
                className="mt-4 text-sm text-white/80 hover:text-white underline"
              >
                Watch again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mark as Complete Button - Show after playing */}
      {isPlaying && !isCompleted && (
        <div className="mt-4 flex items-center justify-between bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <span className="text-base" style={{ color: '#1f1f3d' }}>
            Did you finish watching the video?
          </span>
          <button
            onClick={handleMarkComplete}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-base transition-all shadow-md hover:shadow-lg"
          >
            Mark as Watched
          </button>
        </div>
      )}

      {/* Completed Status */}
      {isCompleted && (
        <div className="mt-4 flex items-center justify-center space-x-3 bg-teal-50 rounded-xl p-4 border-2 border-teal-200">
          <CheckCircle className="w-6 h-6 text-teal-600" />
          <span className="text-base text-teal-800">Video watched ✓</span>
        </div>
      )}
    </div>
  );
}
