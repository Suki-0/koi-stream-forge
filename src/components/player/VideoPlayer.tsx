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
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<{ label: string; level: number }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | 'auto'>('auto');
  const [activeSubtitle, setActiveSubtitle] = useState<number>(0);

  useEffect(() => {
    if (!sources || sources.length === 0) return;
    // Prefer highest quality m3u8
    const best =
      sources.find((s) => s.isM3U8 || s.url.endsWith('.m3u8')) || sources.sort((a, b) => Number(b.quality) - Number(a.quality))[0];
    setCurrent(best);
  }, [sources]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current) return;

    if (Hls.isSupported() && (current.isM3U8 || current.url.endsWith(".m3u8"))) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(current.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const list = [
          { label: "Auto", level: -1 },
          ...hls.levels.map((l, idx) => ({ label: l.height ? `${l.height}p` : `${Math.round((l.bitrate||0)/1000)}kbps`, level: idx }))
        ];
        setQualities(list);
        if (selectedQuality !== 'auto') {
          hls.currentLevel = Number(selectedQuality);
        } else {
          hls.currentLevel = -1;
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) onError?.(data.type || "fatal");
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
        setQualities([]);
        setSelectedQuality('auto');
      };
    } else {
      video.src = current.url;
    }
  }, [current, onError]);

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

  // apply selected quality changes
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (selectedQuality === 'auto') hls.currentLevel = -1;
    else hls.currentLevel = Number(selectedQuality);
  }, [selectedQuality]);

  // subtitle activation
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === activeSubtitle ? 'showing' : 'disabled';
    }
  }, [activeSubtitle, subtitles]);

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
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {qualities.length > 0 && (
            <label className="flex items-center gap-2">
              <span>Quality</span>
              <select
                className="rounded-md border bg-background px-2 py-1"
                value={selectedQuality === 'auto' ? -1 : Number(selectedQuality)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedQuality(val === -1 ? 'auto' : val);
                }}
              >
                {qualities.map((q) => (
                  <option key={q.level} value={q.level}>{q.label}</option>
                ))}
              </select>
            </label>
          )}

          {subtitles.length > 0 && (
            <label className="flex items-center gap-2">
              <span>Subtitles</span>
              <select
                className="rounded-md border bg-background px-2 py-1"
                value={activeSubtitle}
                onChange={(e) => setActiveSubtitle(Number(e.target.value))}
              >
                {subtitles.map((s, i) => (
                  <option key={i} value={i}>{s.label || s.lang || `Track ${i+1}`}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
