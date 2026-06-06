import { screen } from "@testing-library/react";
import { MoodCalendar } from "@/components/mood/MoodCalendar";
import { MoodChart } from "@/components/mood/MoodChart";
import { createMoodEntry, renderWithApp } from "@/test/test-utils";

describe("MoodChart and MoodCalendar", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty state without data", () => {
    renderWithApp(<MoodChart entries={[]} />);

    expect(screen.getByText("No trend data yet")).toBeInTheDocument();
  });

  it("renders charts with data", () => {
    renderWithApp(
      <MoodChart
        entries={[
          createMoodEntry({ moodScore: 8 }),
          createMoodEntry({ id: "entry-2", date: "2026-06-05", moodScore: 3, triggers: ["Mock test results"] })
        ]}
      />
    );

    expect(screen.getByText("Mood trends")).toBeInTheDocument();
    expect(screen.getByText("Most frequent triggers")).toBeInTheDocument();
  });

  it("renders the calendar heatmap", () => {
    renderWithApp(<MoodCalendar entries={[createMoodEntry()]} />);

    expect(screen.getByText("Mood calendar")).toBeInTheDocument();
  });
});
