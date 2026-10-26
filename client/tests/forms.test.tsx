// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FAQs, ServiceCards } from "../src/Home";
import { bookingSchema, registerSchema } from "../../shared/schemas";
afterEach(cleanup);
// jsdom has no viewport observer; viewport behavior is verified in Playwright.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
);
describe("public browsing and validation", () => {
  it("provides all service destinations without authentication", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ServiceCards />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(
      screen
        .getByRole("link", { name: "Explore Home nursing" })
        .getAttribute("href"),
    ).toBe("/services/home-nursing");
  });
  it("uses labeled, keyboard-accessible FAQ disclosures", () => {
    render(<FAQs limit={1} />);
    const summary = screen.getByRole("button", {
      name: "How do I arrange care for a loved one?",
    });
    expect(summary.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(summary);
    expect(summary.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region")).not.toBeNull();
  });
  it("rejects unchecked consent and invalid account data", () => {
    expect(bookingSchema.safeParse({ consent: false }).success).toBe(false);
    expect(
      registerSchema.safeParse({
        name: "Test",
        email: "not-email",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
