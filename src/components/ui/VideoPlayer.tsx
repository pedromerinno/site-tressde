import * as React from "react";
import MuxPlayer from "@mux/mux-player-react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ─────────────────────────────────────────────────────────

const isColorDark = (hex: string): boolean => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.08;
};

const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// ── ProgressBar ─────────────────────────────────────────────────────

function ProgressBar({
  value,
  onChange,
  color = "#0028F0",
  light = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  color?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-full cursor-pointer py-1", className)}
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <div
        className={cn(
          "h-[7px] w-full rounded-[10px]",
          light
            ? "bg-[rgba(255,255,255,0.25)]"
            : "bg-[rgba(0,0,0,0.19)]",
        )}
      />
      <div
        className="absolute left-0 top-1/2 h-[7px] -translate-y-1/2 rounded-[10px]"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
      <div
        className="absolute top-1/2 h-[17px] w-[17px] -translate-y-1/2 rounded-full"
        style={{
          left: `calc(${value}% - 8.5px)`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// ── VideoPlayer ─────────────────────────────────────────────────────

export type VideoPlayerProps = {
  /** Mux playback ID (renders MuxPlayer) */
  muxPlaybackId?: string;
  /** File URL (renders native <video>) */
  src?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  /** Accent color for controls (default: TRESSDE blue) */
  accentColor?: string;
  className?: string;
  onEnded?: () => void;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export default function VideoPlayer({
  muxPlaybackId,
  src,
  autoPlay = false,
  muted = false,
  loop = false,
  accentColor = "#0028F0",
  className,
  onEnded,
}: VideoPlayerProps) {
  const mediaRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(muted ? 0 : 1);
  const [progress, setProgress] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [showControls, setShowControls] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);

  const previousVolumeRef = React.useRef(1);
  const speedMenuRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const isMux = Boolean(muxPlaybackId);
  const lightControls = isColorDark(accentColor);

  // ── Auto-hide timer ──────────────────────────────────────────────

  const resetHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  React.useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  // ── Media helpers (ref-based) ────────────────────────────────────

  const getEl = (): any | null => mediaRef.current;

  const togglePlay = React.useCallback(() => {
    const el = getEl();
    if (!el) return;
    if (el.paused) el.play?.()?.catch?.(() => {});
    else el.pause?.();
  }, []);

  const handleSeek = React.useCallback((value: number) => {
    const el = getEl();
    if (!el?.duration) return;
    const time = (value / 100) * el.duration;
    if (isFinite(time)) {
      el.currentTime = time;
      setProgress(value);
    }
  }, []);

  const toggleMute = React.useCallback(() => {
    const el = getEl();
    if (!el) return;
    if (!isMuted) {
      previousVolumeRef.current = volume || 1;
      el.muted = true;
      el.volume = 0;
      setVolume(0);
      setIsMuted(true);
    } else {
      const restored = previousVolumeRef.current || 1;
      el.muted = false;
      el.volume = restored;
      setVolume(restored);
      setIsMuted(false);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = React.useCallback((value: number) => {
    const el = getEl();
    if (!el) return;
    const newVolume = value / 100;
    el.volume = newVolume;
    el.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) previousVolumeRef.current = newVolume;
  }, []);

  const handleSpeedChange = React.useCallback((rate: number) => {
    const el = getEl();
    if (el) el.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isFullscreen) {
      (
        container.requestFullscreen ??
        (container as any).webkitRequestFullscreen
      )?.call(container);
    } else {
      (
        document.exitFullscreen ??
        (document as any).webkitExitFullscreen
      )?.call(document);
    }
  }, [isFullscreen]);

  // ── Shared media event handlers (React props) ────────────────────

  const onPlayHandler = React.useCallback(() => setIsPlaying(true), []);
  const onPauseHandler = React.useCallback(() => setIsPlaying(false), []);

  const onTimeUpdateHandler = React.useCallback(() => {
    const el = getEl();
    if (!el) return;
    const pct = (el.currentTime / el.duration) * 100;
    setProgress(isFinite(pct) ? pct : 0);
    setCurrentTime(el.currentTime);
    if (el.duration) setDuration(el.duration);
  }, []);

  const onLoadedMetadataHandler = React.useCallback(() => {
    const el = getEl();
    if (el?.duration) setDuration(el.duration);
  }, []);

  const onEndedHandler = React.useCallback(() => onEnded?.(), [onEnded]);

  // ── Fullscreen listener ──────────────────────────────────────────

  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        ),
      );
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  // ── Close speed menu on outside click ────────────────────────────

  React.useEffect(() => {
    if (!showSpeedMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        speedMenuRef.current &&
        !speedMenuRef.current.contains(e.target as Node)
      ) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSpeedMenu]);

  // ── Mux: extra event binding for durationchange ──────────────────

  React.useEffect(() => {
    if (!isMux) return;
    const el = mediaRef.current;
    if (!el) return;
    const onDuration = () => {
      if (el.duration) setDuration(el.duration);
    };
    el.addEventListener("durationchange", onDuration);
    return () => el.removeEventListener("durationchange", onDuration);
  }, [isMux, muxPlaybackId]);

  // ── CSS vars to hide MuxPlayer native controls ───────────────────

  const muxHiddenStyle: React.CSSProperties = {
    ["--controls" as any]: "none",
    ["--center-controls" as any]: "none",
    ["--top-controls" as any]: "none",
    ["--bottom-controls" as any]: "none",
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/vp relative w-full overflow-hidden bg-black",
        className,
      )}
      onMouseEnter={() => {
        setShowControls(true);
        resetHideTimer();
      }}
      onMouseLeave={() => {
        clearHideTimer();
        setShowControls(false);
      }}
      onMouseMove={resetHideTimer}
    >
      {/* ── Video layer ──────────────────────────────────────────── */}
      {isMux ? (
        <div className="mux-hidden-ui absolute inset-0">
          <MuxPlayer
            ref={mediaRef}
            playbackId={muxPlaybackId!}
            streamType="on-demand"
            preload="metadata"
            className="absolute inset-0 w-full h-full"
            style={muxHiddenStyle}
            controls={false}
            autoPlay={autoPlay ? "muted" : undefined}
            muted={autoPlay || muted}
            playsInline
            loop={loop}
            onPlay={onPlayHandler}
            onPause={onPauseHandler}
            onTimeUpdate={onTimeUpdateHandler}
            onLoadedMetadata={onLoadedMetadataHandler}
            onEnded={onEndedHandler}
          />
        </div>
      ) : (
        <video
          ref={mediaRef}
          src={src}
          autoPlay={autoPlay}
          muted={autoPlay || muted}
          playsInline
          loop={loop}
          preload="metadata"
          className="absolute inset-0 w-full h-full object-contain"
          onPlay={onPlayHandler}
          onPause={onPauseHandler}
          onTimeUpdate={onTimeUpdateHandler}
          onLoadedMetadata={onLoadedMetadataHandler}
          onEnded={onEndedHandler}
        />
      )}

      {/* ── Click overlay (play/pause) ───────────────────────────── */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      />

      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 md:gap-3",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showControls
            ? "translate-y-0 opacity-100"
            : "translate-y-[calc(100%+12px)] opacity-0",
        )}
      >
        {/* Left group: Play + Volume + Time */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-[100px] backdrop-blur-sm p-[6px] shrink-0",
            lightControls
              ? "bg-[rgba(255,255,255,0.25)]"
              : "bg-[rgba(0,0,0,0.25)]",
          )}
        >
          {/* Play/Pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={cn(
              "flex h-[35px] w-[35px] items-center justify-center rounded-full transition-colors",
              lightControls
                ? "bg-[rgba(255,255,255,0.5)] text-black"
                : "bg-[rgba(40,40,40,0.45)] text-white",
            )}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Volume */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className={cn(
                "flex h-[35px] w-[35px] items-center justify-center rounded-[31px] transition-colors",
                lightControls
                  ? "bg-[rgba(255,255,255,0.5)] text-black"
                  : "bg-[rgba(40,40,40,0.45)] text-white",
              )}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume > 0.5 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <Volume1 className="h-4 w-4" />
              )}
            </button>

            {showVolumeSlider && (
              <div
                className={cn(
                  "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center rounded-[12px] backdrop-blur-sm px-2 py-3",
                  lightControls
                    ? "bg-[rgba(255,255,255,0.85)]"
                    : "bg-[rgba(40,40,40,0.85)]",
                )}
              >
                <div
                  className={cn(
                    "relative h-[100px] w-[6px] cursor-pointer rounded-full",
                    lightControls
                      ? "bg-[rgba(0,0,0,0.15)]"
                      : "bg-[rgba(255,255,255,0.2)]",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = rect.bottom - e.clientY;
                    const pct = (y / rect.height) * 100;
                    handleVolumeChange(Math.min(Math.max(pct, 0), 100));
                  }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-full"
                    style={{
                      height: `${(isMuted ? 0 : volume) * 100}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 h-[12px] w-[12px] rounded-full",
                      lightControls ? "bg-black/80" : "bg-white",
                    )}
                    style={{
                      bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time (hidden on small screens) */}
          <div
            className={cn(
              "hidden md:flex h-[35px] items-center rounded-[48px] px-[10px] text-[12px] tabular-nums",
              lightControls
                ? "bg-[rgba(255,255,255,0.5)] text-black"
                : "bg-[rgba(40,40,40,0.45)] text-white",
            )}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Center: Progress bar */}
        <div className="flex flex-1 items-center self-stretch min-w-0">
          <div
            className={cn(
              "flex h-full w-full items-center rounded-[22px] px-4 md:px-[30px] py-[8px] backdrop-blur-sm",
              lightControls
                ? "bg-[rgba(255,255,255,0.25)]"
                : "bg-[rgba(0,0,0,0.25)]",
            )}
          >
            <ProgressBar
              value={progress}
              onChange={handleSeek}
              color={accentColor}
              light={lightControls}
            />
          </div>
        </div>

        {/* Right: Speed + Fullscreen */}
        <div className="flex items-center gap-1 self-stretch shrink-0">
          {/* Speed (hidden on small screens) */}
          <div className="relative hidden md:block" ref={speedMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeedMenu((v) => !v);
              }}
              className={cn(
                "flex h-full items-center rounded-[48px] px-[14px] py-[10px] text-[12px] font-medium backdrop-blur-sm",
                lightControls
                  ? "bg-[rgba(255,255,255,0.5)] text-black"
                  : "bg-[rgba(40,40,40,0.45)] text-white",
              )}
            >
              {playbackRate === 1 ? "1x" : `${playbackRate}x`}
            </button>

            {showSpeedMenu && (
              <div
                className={cn(
                  "absolute bottom-full right-0 mb-2 flex flex-col rounded-[12px] backdrop-blur-sm py-1 min-w-[80px]",
                  lightControls
                    ? "bg-[rgba(255,255,255,0.9)]"
                    : "bg-[rgba(30,30,30,0.9)]",
                )}
              >
                {SPEED_OPTIONS.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeedChange(rate);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-[12px] text-left transition-colors",
                      lightControls
                        ? "text-black hover:bg-black/10"
                        : "text-white hover:bg-white/10",
                      playbackRate === rate && "font-bold",
                    )}
                    style={
                      playbackRate === rate
                        ? { color: accentColor }
                        : undefined
                    }
                  >
                    {rate === 1 ? "Normal" : `${rate}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className={cn(
              "flex h-full items-center rounded-[48px] px-4 md:px-[24px] py-[10px] backdrop-blur-sm",
              lightControls
                ? "bg-[rgba(255,255,255,0.5)] text-black"
                : "bg-[rgba(40,40,40,0.45)] text-white",
            )}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
