import { supabase } from "@/integrations/supabase/client";

const BASE = "https://api.consumet.org";

async function proxyFetch<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke("proxy-consumet", {
      body: { url, init },
    });
    if (error) throw error;
    return data as T;
  } catch {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`Consumet error ${res.status}`);
    const contentType = res.headers.get("content-type") || "application/json";
    const result = contentType.includes("application/json") ? await res.json() : await res.text();
    return result as T;
  }
}

export type GogoSearchItem = {
  id: string; // e.g., one-piece
  title: string;
  type?: string;
  releaseDate?: string | number;
  image?: string;
};

export type GogoInfo = {
  id: string;
  title: string;
  episodes: { id: string; number: number }[];
};

export type GogoServers = { name: string; url: string }[];

export type GogoSources = {
  headers?: Record<string, string>;
  sources: { url: string; isM3U8?: boolean; quality?: string | number }[];
  subtitles?: { url: string; lang?: string; label?: string }[];
};

export async function searchGogo(query: string) {
  const url = `${BASE}/anime/gogoanime/${encodeURIComponent(query)}`;
  const data = await proxyFetch<{ results: GogoSearchItem[] }>(url);
  return data.results;
}

export async function getGogoInfo(id: string) {
  const url = `${BASE}/anime/gogoanime/info/${id}`;
  return await proxyFetch<GogoInfo>(url);
}

export async function getEpisodeServers(episodeId: string) {
  const url = `${BASE}/anime/gogoanime/servers/${episodeId}`;
  const data = await proxyFetch<{ results: GogoServers }>(url);
  return data.results;
}

export async function getEpisodeSources(episodeId: string) {
  const url = `${BASE}/anime/gogoanime/watch/${episodeId}`;
  return await proxyFetch<GogoSources>(url);
}

export async function resolveEpisodeIdByTitle(
  title: string,
  episodeNumber: number,
) {
  const results = await searchGogo(title);
  if (!results?.length) return null;
  const best = results[0];
  const info = await getGogoInfo(best.id);
  const match = info.episodes.find((e) => e.number === episodeNumber) || info.episodes[0];
  return match?.id ?? null;
}
