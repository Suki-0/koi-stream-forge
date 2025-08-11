import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime, getSeasonNow, JikanAnime } from "@/services/jikan";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";

function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) callback();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [callback]);
  return ref;
}

export default function AnimeGrid() {
  const [pagePopular, setPagePopular] = useState(1);
  const [pageAiring, setPageAiring] = useState(1);

  const { data: popular, isLoading: loadingPopular } = useQuery<JikanAnime[]>({
    queryKey: ["popular", pagePopular],
    queryFn: () => getTopAnime(pagePopular),
    staleTime: 1000 * 60,
  });

  const { data: airing, isLoading: loadingAiring } = useQuery<JikanAnime[]>({
    queryKey: ["airing", pageAiring],
    queryFn: () => getSeasonNow(pageAiring),
    staleTime: 1000 * 60,
  });

  const loadMorePopular = () => setPagePopular((p) => p + 1);
  const loadMoreAiring = () => setPageAiring((p) => p + 1);

  const sentinelPopular = useInfiniteScroll(loadMorePopular);
  const sentinelAiring = useInfiniteScroll(loadMoreAiring);

  const renderGrid = (items?: JikanAnime[], loading?: boolean) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items?.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
      {loading && Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <section className="container mx-auto space-y-10">
      <div id="popular" className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Popular</h2>
          <span className="text-sm text-muted-foreground">Infinite scroll</span>
        </div>
        {renderGrid(popular, loadingPopular)}
        <div ref={sentinelPopular} />
      </div>

      <div id="airing" className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Airing</h2>
          <span className="text-sm text-muted-foreground">Infinite scroll</span>
        </div>
        {renderGrid(airing, loadingAiring)}
        <div ref={sentinelAiring} />
      </div>
    </section>
  );
}
