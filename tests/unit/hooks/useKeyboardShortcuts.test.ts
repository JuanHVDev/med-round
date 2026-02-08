import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  const addEventListenerSpy = vi.spyOn(window, "addEventListener");
  const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register keydown event listener", () => {
    const shortcuts = [{ key: "k", ctrl: true, action: vi.fn() }];
    renderHook(() => useKeyboardShortcuts(shortcuts));

    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should unregister event listener on unmount", () => {
    const shortcuts = [{ key: "k", ctrl: true, action: vi.fn() }];
    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should execute action on matching key combination", () => {
    const action = vi.fn();
    const shortcuts = [{ key: "n", action }];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent("keydown", { key: "n", bubbles: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("should handle Ctrl+Key combination", () => {
    const action = vi.fn();
    const shortcuts = [{ key: "k", ctrl: true, action }];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("should not trigger action on non-matching key", () => {
    const action = vi.fn();
    const shortcuts = [{ key: "n", action }];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent("keydown", { key: "m", bubbles: true });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
    unmount();
  });

  it("should handle multiple shortcuts", () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const shortcuts = [
      { key: "n", action: action1 },
      { key: "t", action: action2 }
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event1 = new KeyboardEvent("keydown", { key: "n", bubbles: true });
    window.dispatchEvent(event1);

    const event2 = new KeyboardEvent("keydown", { key: "t", bubbles: true });
    window.dispatchEvent(event2);

    expect(action1).toHaveBeenCalledTimes(1);
    expect(action2).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("should handle empty shortcuts array", () => {
    renderHook(() => useKeyboardShortcuts([]));
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("should handle / key for search", () => {
    const action = vi.fn();
    const shortcuts = [{ key: "/", action }];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent("keydown", { key: "/", bubbles: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("should handle h key for dashboard", () => {
    const action = vi.fn();
    const shortcuts = [{ key: "h", action }];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent("keydown", { key: "h", bubbles: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });
});
