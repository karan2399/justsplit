import { useState } from "react";
import type { Person } from "../types";

const PEOPLE_STORAGE_KEY = "easy-split-people";

function readSavedPeople(): Person[] {
  try {
    const saved = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (person): person is Person =>
        typeof person === "object" &&
        person !== null &&
        "id" in person &&
        typeof person.id === "string" &&
        "name" in person &&
        typeof person.name === "string",
    );
  } catch (error) {
    console.error("Could not load saved people.", error);
    return [];
  }
}

export function useSavedPeople() {
  const [people, setPeople] = useState<Person[]>(readSavedPeople);
  const [storageError, setStorageError] = useState(false);

  const savePeople = (updatedPeople: Person[]) => {
    try {
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(updatedPeople));
      setStorageError(false);
    } catch (error) {
      console.error("Could not save people to local storage.", error);
      setStorageError(true);
    }
  };

  return { people, setPeople, savePeople, storageError };
}
