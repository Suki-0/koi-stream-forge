export type JikanAnime = {
  mal_id: number;
  title: string;
  images: {
    jpg?: { image_url?: string; large_image_url?: string };
    webp?: { image_url?: string; large_image_url?: string };
  };
  year?: number | null;
  type?: string | null;
  score?: number | null;
  synopsis?: string | null;
};

export type JikanAnimeDetails = JikanAnime & {
  episodes?: number | null;
  genres?: { name: string }[];
  status?: string | null;
};

export type JikanEpisode = {
  mal_id: number;
  title?: string | null;
  episode?: number;
};

const BASE = "https://api.jikan.moe/v4";

async function jikanFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...(init || {}),
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`Jikan error ${res.status}`);
  const data = await res.json();
  return data as T;
}

export async function getTopAnime(page = 1) {
  const data = await jikanFetch<{ data: JikanAnime[] }>(`/top/anime?page=${page}`);
  return data.data;
}

export async function getSeasonNow(page = 1) {
  const data = await jikanFetch<{ data: JikanAnime[] }>(`/seasons/now?page=${page}`);
  return data.data;
}

export async function searchAnime(query: string, page = 1) {
  const data = await jikanFetch<{ data: JikanAnime[] }>(
    `/anime?q=${encodeURIComponent(query)}&page=${page}`,
  );
  return data.data;
}

export async function getAnimeDetails(malId: number) {
  const data = await jikanFetch<{ data: JikanAnimeDetails }>(`/anime/${malId}`);
  return data.data;
}

export async function getAnimeEpisodes(malId: number, page = 1) {
  const data = await jikanFetch<{ data: JikanEpisode[] }>(
    `/anime/${malId}/episodes?page=${page}`,
  );
  return data.data;
}
