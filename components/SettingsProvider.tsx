"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface Settings {
  photoPath: string | null;
  language: string;
  timezone: string;
  userName: string;
  soundEnabled: boolean;
}

const defaultSettings: Settings = {
  photoPath: null,
  language: "es",
  timezone: "America/Mexico_City",
  userName: "Pablo",
  soundEnabled: false,
};

const SettingsContext = createContext<{
  settings: Settings;
  refresh: () => void;
}>({ settings: defaultSettings, refresh: () => {} });

export function useSettings() {
  return useContext(SettingsContext);
}

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setSettings({
        photoPath: data.photoPath ?? null,
        language: data.language ?? "es",
        timezone: data.timezone ?? "America/Mexico_City",
        userName: data.userName ?? "Pablo",
        soundEnabled: data.soundEnabled ?? false,
      });
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}
