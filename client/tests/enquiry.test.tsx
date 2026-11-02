// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EnquiryForm } from "../src/EnquiryForm";
import { LanguageProvider } from "../src/i18n";
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
it("requires agreement and sends a dated named enquiry to the company WhatsApp without an API submission", () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  const fetcher = vi.spyOn(globalThis, "fetch");
  render(
    <MemoryRouter>
      <EnquiryForm />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Sample Client" },
  });
  fireEvent.change(screen.getByLabelText("Mobile number"), {
    target: { value: "9876543210" },
  });
  fireEvent.change(screen.getByLabelText("City / area"), {
    target: { value: "Pune" },
  });
  fireEvent.change(
    screen.getByLabelText("Care required / preferred dates and shift"),
    { target: { value: "Day care" } },
  );
  fireEvent.click(screen.getByRole("button"));
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button"));
  const url = new URL(String(open.mock.calls[0][0]));
  expect(url.pathname).toBe("/918803602030");
  expect(url.searchParams.get("text")).toContain(
    "Acknowledged by: Sample Client",
  );
  expect(url.searchParams.get("text")).toContain("Date / time (IST)");
  expect(url.searchParams.get("text")).toContain("prior written approval");
  expect(fetcher).not.toHaveBeenCalled();
  expect(screen.getByRole("status").textContent).toContain(
    "only when you tap Send",
  );
});
it.each(["hi", "mr"])(
  "offers the agreement and professional enquiry in %s",
  (language) => {
    localStorage.setItem("atharv-language", language);
    render(
      <LanguageProvider>
        <MemoryRouter>
          <EnquiryForm careers />
        </MemoryRouter>
      </LanguageProvider>,
    );
    expect(
      screen.getByRole("combobox").getAttribute("value") ??
        (screen.getByRole("combobox") as HTMLSelectElement).value,
    ).toBe("professional");
    expect((screen.getByRole("checkbox") as HTMLInputElement).required).toBe(
      true,
    );
    expect(screen.getByRole("button").textContent).not.toContain(
      "continue to WhatsApp",
    );
  },
);
