import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  muted: boolean;
  onToggle: () => void;
}

/** Fixed circular mute / unmute control for the ambient soundtrack. */
export function MusicToggle({ muted, onToggle }: MusicToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute music" : "Mute music"}
      className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-ink backdrop-blur-sm transition-colors hover:bg-ink/20"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
