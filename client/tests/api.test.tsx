import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
describe("separate frontend and API hosting", () => {
  it("shows a useful unavailable message for a non-JSON hosting error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 503,
        ok: false,
        json: async () => {
          throw new SyntaxError("HTML response");
        },
      }),
    );
    const { api } = await import("../src/api");
    await expect(api("/services")).rejects.toThrow(
      "The care service is unavailable. Please try again shortly.",
    );
  });
  it("keeps local API requests relative", async () => {
    vi.stubEnv("VITE_API_ORIGIN", "");
    const { apiUrl } = await import("../src/api");
    expect(apiUrl("/services")).toBe("/api/v1/services");
  });
  it("uses the configured origin for API calls, downloads and refresh", async () => {
    vi.stubEnv("VITE_API_ORIGIN", "https://api.example.test/");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 200, ok: true })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ data: { name: "Fictional user" } }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const { api, apiUrl } = await import("../src/api");
    expect(apiUrl("/portal/invoices/example/pdf")).toBe(
      "https://api.example.test/api/v1/portal/invoices/example/pdf",
    );
    await expect(api("/auth/me")).resolves.toEqual({ name: "Fictional user" });
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "https://api.example.test/api/v1/auth/me",
      "https://api.example.test/api/v1/auth/refresh",
      "https://api.example.test/api/v1/auth/me",
    ]);
    for (const call of fetchMock.mock.calls)
      expect(call[1].credentials).toBe("include");
  });
});
