import React, { createContext, useState, useRef, useEffect } from "react";

export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current.duration);
      });

      audioRef.current.addEventListener("timeupdate", () => {
        setProgress(audioRef.current.currentTime);
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playTrack = (track) => {
    if (typeof window === "undefined") return;

    // Support both snake_case (from DB) and camelCase field names
    const audioSrc = track?.audio_url || track?.audioUrl;
    if (!audioSrc) {
      console.warn("playTrack: no audio URL on track", track);
      return;
    }

    if (currentTrack?.id === track.id && audioRef.current?.src) {
      // Resume same track
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else {
      // Load new track — normalise to a consistent shape
      const normalisedTrack = {
        ...track,
        audioUrl: audioSrc,
        audio_url: audioSrc,
        coverUrl:  track.cover_url  || track.coverUrl  || null,
        cover_url: track.cover_url  || track.coverUrl  || null,
      };
      setCurrentTrack(normalisedTrack);
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.load();
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol) => {
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        pauseTrack,
        seekTo,
        setVolume,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
