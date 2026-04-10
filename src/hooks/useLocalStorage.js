import { useState, useEffect } from "react";

export function useLocalStorage(key) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  });

  // Update localStorage + state
  const updateValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));

    // 🔥 Notify same-tab listeners manually
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const item = localStorage.getItem(key);
      setValue(item ? JSON.parse(item) : null);
    };

    // Cross-tab changes
    window.addEventListener("storage", handleStorageChange);

    // Same-tab manual event
    window.addEventListener("localStorageUpdate", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdate", handleStorageChange);
    };
  }, [key]);

  return [value, updateValue];
}
