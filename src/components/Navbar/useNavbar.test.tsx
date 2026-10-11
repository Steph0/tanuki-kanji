import { renderHook } from "@testing-library/preact";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useNavbar } from "./useNavbar.ts";

const { mockRoute } = vi.hoisted(() => ({ mockRoute: vi.fn() }));

vi.mock("preact-iso", () => ({
  useLocation: () => ({ route: mockRoute }),
}));

describe("useNavbar", () => {
  beforeEach(() => {
    mockRoute.mockClear();
  });

  test("returns the user to the homepage when the home action fires", () => {
    const { result } = renderHook(() => useNavbar());
    result.current.handleHomeClick();
    expect(mockRoute).toHaveBeenCalledTimes(1);
    expect(mockRoute).toHaveBeenCalledWith("/");
  });
});
