"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ym_recently_viewed";
const MAX_ITEMS = 5;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function addViewed(propertyId: string) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: string[] = stored ? JSON.parse(stored) : [];
      const updated = [propertyId, ...current.filter(id => id !== propertyId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentIds(updated);
    } catch {
      // ignore localStorage errors
    }
  }

  function clearViewed() {
    localStorage.removeItem(STORAGE_KEY);
    setRecentIds([]);
  }

  return { recentIds, addViewed, clearViewed };
}
