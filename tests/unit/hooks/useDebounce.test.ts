import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("test", { delay: 500 }));
    expect(result.current).toBe("test");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset timer on multiple changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("b");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("c");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 300 }),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 100 });
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(100);
  });

  it("should work with objects", () => {
    const obj = { key: "value" };
    const { result } = renderHook(() => useDebounce(obj, { delay: 500 }));
    expect(result.current).toEqual({ key: "value" });
  });
});
