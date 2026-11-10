// إعدادات اللاعب (على هذا الجهاز): الصوت والمهلة الافتراضية.
import { useEffect, useState } from "react";
import { GAME_CONFIG } from "./config";
import { setMuted, setVolume } from "./sound";

export type Settings = { music: number; sfx: number; muted: boolean; seconds: number };

const KEY = "hrf-settings";
const DEFAULTS: Settings = {
  music: GAME_CONFIG.sound.music,
  sfx: GAME_CONFIG.sound.sfx,
  muted: false,
  seconds: GAME_CONFIG.answerSeconds.default,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function apply(s: Settings) {
  setVolume("music", s.music);
  setVolume("sfx", s.sfx);
  setMuted(s.muted);
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  useEffect(() => {
    apply(settings);
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* التخزين غير متاح */
    }
  }, [settings]);
  return [settings, (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))] as const;
}

/** يطبّق الإعدادات المحفوظة مرة عند بدء التطبيق */
export function applySavedSettings() {
  apply(loadSettings());
}
