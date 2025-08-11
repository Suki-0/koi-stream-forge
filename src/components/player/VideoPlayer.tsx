import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

export type Source = { url: string; quality?: string | number; isM3U8?: boolean };
export type Subtitle = { url: string; lang?: string; label?: string };

export default function VideoPlayer({
  sources,
  subtitles = [],
  onError,
}: {
  sources: Source[];
  subtitles?: Subtitle[];
  onError?: (e: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [current, setCurrent] = useState<Source | null>(null);

  useEffect(() => {
    if (!sources || sources.length === 0) return;
    // Prefer highest quality m3u8
    const best =
      sources.find((s) => s.isM3U8) || sources.sort((a, b) => Number(b.quality) - Number(a.quality))[0];
    setCurrent(best);
  }, [sources]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current) return;

    if (Hls.isSupported() && (current.isM3U8 || current.url.endsWith(".m3u8"))) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(current.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) onError?.(data.type || "fatal");
      });
      return () => hls.destroy();
    } else {
      video.src = current.url;
    }
  }, [current, onError]);

  // basic stall detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let stallCount = 0;
    const onStall = () => {
      stallCount += 1;
      if (stallCount >= 3) onError?.("stalled");
    };
    video.addEventListener("waiting", onStall);
    video.addEventListener("stalled", onStall);
    return () => {
      video.removeEventListener("waiting", onStall);
      video.removeEventListener("stalled", onStall);
    };
  }, [onError]);

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        className="h-[50vh] w-full rounded-lg bg-secondary"
        controls
        playsInline
        crossOrigin="anonymous"
      >
        {subtitles.map((s, i) => (
          <track
            key={i}
            kind="subtitles"
            src={s.url}
            srcLang={s.lang || s.label || `lang-${i}`}
            label={s.label || s.lang || `Track ${i + 1}`}
            default={i === 0}
          />
        ))}
      </video>
      {subtitles.length > 0 && (
        <div className="text-xs text-muted-foreground">Subtitles available: {subtitles.length}</div>
      )}
    </div>
  );
}
