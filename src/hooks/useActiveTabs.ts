import { useEffect, useState } from "react";

const ACTIVE_TABS_STORAGE_KEY = "easy-split-active-tabs";
const ACTIVE_TAB_TTL = 20_000;
const ACTIVE_TAB_HEARTBEAT = 5_000;

function readActiveTabs(): Record<string, number> {
  const saved = localStorage.getItem(ACTIVE_TABS_STORAGE_KEY);
  if (!saved) return {};

  const parsed: unknown = JSON.parse(saved);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed).filter(
      (entry): entry is [string, number] =>
        typeof entry[0] === "string" &&
        typeof entry[1] === "number" &&
        Number.isFinite(entry[1]),
    ),
  );
}

export function useActiveTabs() {
  const [onlineTabs, setOnlineTabs] = useState(1);
  const [presenceUnavailable, setPresenceUnavailable] = useState(false);

  useEffect(() => {
    const tabId = crypto.randomUUID();

    const getFreshTabs = () => {
      const now = Date.now();
      return Object.fromEntries(
        Object.entries(readActiveTabs()).filter(([, lastSeen]) => now - lastSeen < ACTIVE_TAB_TTL),
      );
    };

    const syncPresence = () => {
      try {
        setOnlineTabs(Math.max(1, Object.keys(getFreshTabs()).length));
        setPresenceUnavailable(false);
      } catch (error) {
        console.error("Could not read local active-tab presence.", error);
        setOnlineTabs(1);
        setPresenceUnavailable(true);
      }
    };

    const heartbeat = () => {
      try {
        const activeTabs = getFreshTabs();
        activeTabs[tabId] = Date.now();
        localStorage.setItem(ACTIVE_TABS_STORAGE_KEY, JSON.stringify(activeTabs));
        setOnlineTabs(Object.keys(activeTabs).length);
        setPresenceUnavailable(false);
      } catch (error) {
        console.error("Could not update local active-tab presence.", error);
        setOnlineTabs(1);
        setPresenceUnavailable(true);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_TABS_STORAGE_KEY) syncPresence();
    };

    const removeTab = () => {
      try {
        const activeTabs = readActiveTabs();
        delete activeTabs[tabId];
        localStorage.setItem(ACTIVE_TABS_STORAGE_KEY, JSON.stringify(activeTabs));
      } catch (error) {
        console.error("Could not remove this tab from local presence.", error);
      }
    };

    const initialHeartbeat = window.setTimeout(heartbeat, 0);
    const heartbeatInterval = window.setInterval(heartbeat, ACTIVE_TAB_HEARTBEAT);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("beforeunload", removeTab);

    return () => {
      window.clearTimeout(initialHeartbeat);
      window.clearInterval(heartbeatInterval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beforeunload", removeTab);
      removeTab();
    };
  }, []);

  return { onlineTabs, presenceUnavailable };
}
