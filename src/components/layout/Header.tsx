import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchAnime, JikanAnime } from "@/services/jikan";

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        const res = await searchAnime(query, 1);
        setResults(res.slice(0, 6));
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 350);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [query]);

  const goTo = (mal_id: number) => {
    setQuery("");
    setOpen(false);
    navigate(`/anime/${mal_id}`);
  };

  const headerCls = useMemo(
    () =>
      "sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70",
    [],
  );

  return (
    <header className={headerCls}>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <div className="h-8 w-8 rounded-md bg-koi" aria-hidden />
          <span className="font-playfair text-xl">Koi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="story-link">Home</Link>
          <a href="#popular" className="story-link">Popular</a>
          <a href="#airing" className="story-link">Airing</a>
        </nav>

        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            aria-label="Search anime"
            placeholder="Search anime titles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-12 rounded-md border bg-popover p-2 shadow-md animate-enter">
              {results.map((r) => (
                <button
                  key={r.mal_id}
                  onClick={() => goTo(r.mal_id)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
                >
                  <img
                    loading="lazy"
                    className="h-12 w-9 rounded object-cover"
                    src={r.images.webp?.image_url || r.images.jpg?.image_url || "/placeholder.svg"}
                    alt={`${r.title} cover`}
                  />
                  <div>
                    <div className="text-sm font-medium line-clamp-1">{r.title}</div>
                    {r.year && (
                      <div className="text-xs text-muted-foreground">{r.year}</div>
                    )}
                  </div>
                </button>
              ))}
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
