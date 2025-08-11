import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import VideoPlayer from "@/components/player/VideoPlayer";
import { getEpisodeServers, getEpisodeSources, resolveEpisodeIdByTitle } from "@/services/consumet";
import { Button } from "@/components/ui/button";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as { title?: string; episode?: number };
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<{ url: string; isM3U8?: boolean; quality?: string | number }[]>([]);
  const [subs, setSubs] = useState<{ url: string; lang?: string; label?: string }[]>([]);

  useEffect(() => {
    if (!state.title || !state.episode) return;
    (async () => {
      try {
        const eid = await resolveEpisodeIdByTitle(state.title!, state.episode!);
        if (!eid) throw new Error("Unable to resolve episode.");
        setEpisodeId(eid);
        const servers = await getEpisodeServers(eid);
        // Prefer "vidstream" or first server
        const chosen = servers[0];
        const data = await getEpisodeSources(eid);
        setSources(data.sources || []);
        setSubs(data.subtitles || []);
      } catch (e: any) {
        setError(e?.message || "Playback unavailable.");
      }
    })();
  }, [state.title, state.episode]);

  const title = useMemo(() => {
    return state.title ? `${state.title} — Episode ${state.episode}` : "Watch on Koi";
  }, [state.title, state.episode]);

  return (
    <main className="container mx-auto my-8 space-y-4">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Watch ${state.title || ''} episode ${state.episode || ''} on Koi.`} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/watch'} />
      </Helmet>

      {!state.title ? (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Invalid watch request.</p>
          <Button variant="hero" className="mt-4" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      ) : error ? (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Try again later or switch servers on refresh.</p>
        </div>
      ) : sources.length > 0 ? (
        <VideoPlayer
          sources={sources}
          subtitles={subs}
          onError={(e) => setError(e)}
        />
      ) : (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Loading sources…</p>
        </div>
      )}
    </main>
  );
}
