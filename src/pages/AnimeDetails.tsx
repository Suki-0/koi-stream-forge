import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimeDetails, getAnimeEpisodes } from "@/services/jikan";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function AnimeDetails() {
  const { malId } = useParams();
  const id = Number(malId);

  const { data: details, isLoading } = useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnimeDetails(id),
    enabled: !!id,
  });

  const { data: episodes, isLoading: loadingEps } = useQuery({
    queryKey: ["episodes", id],
    queryFn: () => getAnimeEpisodes(id, 1),
    enabled: !!id,
  });

  if (isLoading || !details) {
    return (
      <div className="container mx-auto my-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const cover = details.images.webp?.large_image_url || details.images.jpg?.large_image_url;

  return (
    <main className="container mx-auto my-8 space-y-6">
      <Helmet>
        <title>{`Watch ${details.title} — Koi`}</title>
        <meta name="description" content={`Details and episodes for ${details.title}.`} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
      </Helmet>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <div>
          {cover ? (
            <img src={cover} alt={`${details.title} cover`} className="w-full rounded-lg object-cover" />
          ) : (
            <Skeleton className="h-80 w-full" />
          )}
        </div>
        <div className="space-y-4">
          <h1 className="font-playfair text-3xl">{details.title}</h1>
          {details.synopsis && (
            <p className="max-w-prose text-muted-foreground">{details.synopsis}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {details.genres?.map((g) => (
              <span key={g.name} className="rounded-full border px-3 py-1 text-xs">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Episodes</h2>
        {loadingEps && <Skeleton className="h-24 w-full" />}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {episodes?.map((e) => (
            <Link
              key={e.mal_id}
              to={`/watch`}
              state={{ title: details.title, episode: e.episode ?? 1 }}
            >
              <Button className="w-full" variant="secondary">
                Ep {e.episode}
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
