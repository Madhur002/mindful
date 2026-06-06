import { screen } from "@testing-library/react";
import HistoryClient from "@/components/history/HistoryClient";
import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import { createMoodEntry, renderWithApp } from "@/test/test-utils";

describe("HistoryClient", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        entries: [createMoodEntry()]
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it("renders trends, calendar, journal, and streak", () => {
    renderWithApp(<HistoryClient />);

    expect(screen.getByText("History and trends")).toBeInTheDocument();
    expect(screen.getByText("Mood calendar")).toBeInTheDocument();
    expect(screen.getByText("Emotion journal")).toBeInTheDocument();
  });
});
