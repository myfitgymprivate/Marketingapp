"use client";

import { useEffect, useState } from "react";

export function TaskCompleteButton({
  storageKey = "myfit-daily-task",
}: {
  storageKey?: string;
}) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCompleted(window.localStorage.getItem(storageKey) === "completed");
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [storageKey]);

  function toggleCompleted() {
    setCompleted((value) => {
      const nextValue = !value;
      window.localStorage.setItem(storageKey, nextValue ? "completed" : "open");
      return nextValue;
    });
  }

  return (
    <button
      className={`primary-button ${completed ? "completed-button" : ""}`}
      onClick={toggleCompleted}
      type="button"
    >
      {completed ? "✓ Hotovo · další kontrola zítra" : "✓ Zkontrolováno"}
    </button>
  );
}
