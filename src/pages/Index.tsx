import TrendingHero from "@/components/hero/TrendingHero";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Koi — Robust Anime Streaming MVP</title>
        <meta name="description" content="Stream trending anime with live search, smooth UI, and resilient playback on Koi." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
      </Helmet>

      <div className="bg-koi">
        <TrendingHero />
      </div>

      <main className="space-y-10 py-6">
        <AnimeGrid />
      </main>

      <footer className="border-t py-10">
        <div className="container mx-auto flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Koi. All rights reserved.</div>
          <div>Built with performance, resilience, and anime love.</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
