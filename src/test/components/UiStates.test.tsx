import { screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ExamSelect } from "@/components/mood/ExamSelect";
import { MoodScoreSlider } from "@/components/mood/MoodScoreSlider";
import { TriggerSelector } from "@/components/mood/TriggerSelector";
import { JournalEntry } from "@/components/journal/JournalEntry";
import { createMoodEntry, renderWithApp } from "@/test/test-utils";

const Broken = (): JSX.Element => {
  throw new Error("boom");
};

describe("UI default and error states", () => {
  it("renders default loading label, button as child, and default error title", () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    renderWithApp(
      <>
        <LoadingSkeleton />
        <Button asChild variant="outline" size="sm">
          <a href="/test">Child link</a>
        </Button>
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>
      </>
    );

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Child link" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("This section could not load.");
  });

  it("renders form control error branches", () => {
    renderWithApp(
      <>
        <ExamSelect value="NEET" onChange={jest.fn()} error="Choose an exam" />
        <MoodScoreSlider value={5} onChange={jest.fn()} error="Pick a score" />
        <TriggerSelector selectedTriggers={[]} onChange={jest.fn()} error="Pick one" />
      </>
    );

    expect(screen.getByText("Choose an exam")).toBeInTheDocument();
    expect(screen.getByText("Pick a score")).toBeInTheDocument();
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("renders journal entry without note, triggers, or delete action", () => {
    renderWithApp(
      <JournalEntry
        entry={createMoodEntry({ reflectionNote: "", triggers: [] })}
      />
    );

    expect(screen.getByText("No reflection note added.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
