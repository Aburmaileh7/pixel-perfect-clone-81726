import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { EnvelopeIntro } from "@/components/EnvelopeIntro";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MusicToggle } from "@/components/MusicToggle";
import { HeroSection } from "@/components/HeroSection";
import { SiteSignature } from "@/components/SiteSignature";
import { LanguageProvider } from "@/lib/language";
import musicAsset from "@/assets/background-music.mp3.asset.json";
import ogImageAsset from "@/assets/og-preview.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Save The Date | Omar & ٌRahaf — 10.09.26" },
      {
        name: "description",
        content:
          "Scratch the lace card to reveal our wedding announcement: Omar & Rahaf, 10.09.26 at Al Yousefi Palace, Amman.",
      },
      { property: "og:title", content: "Save The Date | Omar & Rahaf" },
      {
        property: "og:description",
        content: "Open the envelope and scratch to reveal our save the date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Save The Date | Omar & Rahaf" },
      {
        name: "twitter:description",
        content: "Open the envelope and scratch to reveal our save the date.",
      },
      { property: "og:image", content: `https://omar-wedding.lovable.app${ogImageAsset.url}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://omar-wedding.lovable.app${ogImageAsset.url}` },
    ],
  }),
  component: SaveTheDatePage,
});

const MUSIC_SRC = musicAsset.url;

function SaveTheDatePage() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Start the soundtrack on the first gesture and fade it in over 12s. */
  const startMusic = () => {
    if (audioRef.current) return;
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    void audio.play().catch(() => {});

    const target = 0.6;
    const steps = 120;
    const duration = 12000;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = progress * progress * (3 - 2 * progress); // smoothstep
      audio.volume = Math.min(target, target * eased);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  };

  // Pause while the tab is hidden; resume when it returns.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (!muted) void audio.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [muted]);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        if (!next && audio.paused) void audio.play().catch(() => {});
      }
      return next;
    });
  };

  return (
    <LanguageProvider>
      <LanguageToggle />
      <main className="bg-transparent">
        <HeroSection />
        <MusicToggle muted={muted} onToggle={toggleMute} />
        <SiteSignature />
        {!entered && (
          <EnvelopeIntro onEnter={() => setEntered(true)} onInteraction={startMusic} />
        )}
      </main>
    </LanguageProvider>
  );
}
