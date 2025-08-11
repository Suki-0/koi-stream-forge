import { Link } from "react-router-dom";
import { JikanAnime } from "@/services/jikan";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeCard({ anime }: { anime: JikanAnime }) {
  const img = anime.images.webp?.image_url || anime.images.jpg?.image_url;
  return (
    <Link to={`/anime/${anime.mal_id}`} className="hover-scale">
      <Card className="overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={`${anime.title} cover`}
            loading="lazy"
            className="h-56 w-full object-cover"
          />
        ) : (
          <Skeleton className="h-56 w-full" />
        )}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium">{anime.title}</h3>
          {anime.year && (
            <p className="text-xs text-muted-foreground">{anime.year}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
