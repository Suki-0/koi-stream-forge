import { useQuery } from "@tanstack/react-query";
import { getTopAnime } from "@/services/jikan";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingHero() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTopAnime(1),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <section className="container mx-auto my-6">
        <Skeleton className="h-60 w-full rounded-lg" />
      </section>
    );
  }

  if (isError || !data?.length) {
    return (
      <section className="container mx-auto my-6 rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Trending</h2>
        <p className="text-muted-foreground">Unable to load trending now. Try again later.</p>
      </section>
    );
  }

  const top = data[0];
  const img = top.images.webp?.large_image_url || top.images.jpg?.large_image_url;

  return (
    <section className="container mx-auto my-6 overflow-hidden rounded-xl border">
      <div className="relative grid min-h-[320px] grid-cols-1 md:grid-cols-2">
        <div className="relative order-2 flex flex-col gap-4 p-6 md:order-1">
          <h1 className="font-playfair text-3xl md:text-4xl">{top.title}</h1>
          <p className="line-clamp-4 text-muted-foreground">{top.synopsis || "No synopsis available."}</p>
          <div className="mt-auto flex gap-3">
            <Link to={`/anime/${top.mal_id}`}>
              <Button variant="hero">View Details</Button>
            </Link>
            <a href="#popular" className="story-link self-center text-sm">Browse Popular</a>
          </div>
        </div>
        <div className="order-1 md:order-2">
          {img ? (
            <img
              src={img}
              alt={`${top.title} key visual`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>
    </section>
  );
}
