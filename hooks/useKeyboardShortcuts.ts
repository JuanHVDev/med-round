"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const { key, ctrl, shift, alt, meta, action } = shortcut;

        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (shortcuts.length === 0) return;

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, shortcuts.length]);
}

export function createKeyboardShortcut(
  key: string,
  action: () => void,
  modifiers: Partial<Pick<KeyboardShortcut, "ctrl" | "shift" | "alt" | "meta">> = {}
): KeyboardShortcut {
  return {
    key,
    ...modifiers,
    action,
  };
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: "/", action: () => console.log("Abrir búsqueda") },
  { key: "n", action: () => console.log("Nueva nota SOAP") },
  { key: "t", action: () => console.log("Nueva tarea") },
  { key: "h", action: () => console.log("Ir al dashboard") },
  { key: "p", action: () => console.log("Ir a pacientes") },
  { key: "m", ctrl: true, action: () => console.log("Toggle dark mode") },
  { key: "Escape", action: () => console.log("Cerrar modal") },
];
