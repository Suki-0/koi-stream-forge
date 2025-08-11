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
  const [servers, setServers] = useState<{ name: string; url: string }[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    if (!state.title || !state.episode) return;
    (async () => {
      try {
        setError(null);
        setSources([]);
        setSubs([]);
        setEpisodeId(null);

        const eid = await resolveEpisodeIdByTitle(state.title!, state.episode!);
        if (!eid) throw new Error("Unable to resolve episode.");
        setEpisodeId(eid);

        const serverList = await getEpisodeServers(eid);
        const preferred =
          serverList.find((s) => s.name.toLowerCase().includes("vid")) || serverList[0];
        // Save servers and selected
        //@ts-ignore
        setServers(serverList);
        setSelectedServer(preferred?.name || null);
      } catch (e: any) {
        setError(e?.message || "Playback unavailable.");
      }
    })();
  }, [state.title, state.episode]);
  useEffect(() => {
    if (!episodeId || !selectedServer) return;
    (async () => {
      try {
        const data = await getEpisodeSources(episodeId, selectedServer);
        setSources(data.sources || []);
        setSubs(data.subtitles || []);
      } catch (e: any) {
        setError(e?.message || "Playback unavailable.");
      }
    })();
  }, [episodeId, selectedServer]);

  const title = useMemo(() => {
    return state.title ? `${state.title} — Episode ${state.episode}` : "Watch on Koi";
  }, [state.title, state.episode]);

  const tryNextServer = () => {
    if (!servers?.length) return setError("Playback unavailable.");
    const idx = servers.findIndex((s) => s.name === selectedServer);
    const next = servers[idx + 1];
    if (next) {
      setSelectedServer(next.name);
      setError(null);
    } else {
      setError("Playback unavailable on all servers.");
    }
  };

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
        <div className="space-y-3">
          {servers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Server</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={selectedServer ?? undefined}
                onChange={(e) => setSelectedServer(e.target.value)}
              >
                {servers.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <VideoPlayer
            sources={sources}
            subtitles={subs}
            onError={() => tryNextServer()}
          />
        </div>
      ) : (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Loading sources…</p>
        </div>
      )}
    </main>
  );
}
