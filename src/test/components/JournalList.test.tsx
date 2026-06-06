import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { JournalList } from "@/components/journal/JournalList";
import { createMoodEntry, renderWithApp } from "@/test/test-utils";

describe("JournalList", () => {
  const entries = [
    createMoodEntry({ reflectionNote: "NEET biology felt steady.", examType: "NEET" }),
    createMoodEntry({
      id: "entry-2",
      date: "2026-06-05",
      reflectionNote: "CAT mocks felt heavy.",
      examType: "CAT",
      triggers: ["Mock test results"]
    })
  ];

  it("renders entries and filters by exam type", async () => {
    const user = userEvent.setup();
    renderWithApp(<JournalList entries={entries} />);

    expect(screen.getByText("NEET biology felt steady.")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Exam"), "CAT");

    expect(screen.getByText("CAT mocks felt heavy.")).toBeInTheDocument();
    expect(screen.queryByText("NEET biology felt steady.")).not.toBeInTheDocument();
  });

  it("renders empty state and passes axe", async () => {
    const { container } = renderWithApp(<JournalList entries={[]} />);

    expect(screen.getByText("No journal entries match")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("filters by search, dates, and trigger", async () => {
    const user = userEvent.setup();
    renderWithApp(<JournalList entries={entries} />);

    await user.type(screen.getByLabelText("Search"), "mocks");
    await user.type(screen.getByLabelText("From"), "2026-06-05");
    await user.selectOptions(screen.getByLabelText("Trigger"), "Mock test results");

    expect(screen.getByText("CAT mocks felt heavy.")).toBeInTheDocument();
    expect(screen.queryByText("NEET biology felt steady.")).not.toBeInTheDocument();
  });

  it("calls delete from journal entries", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    renderWithApp(<JournalList entries={entries} onDelete={onDelete} />);

    const deleteButton = screen
      .getAllByRole("button", { name: /delete journal entry/i })[0];
    expect(deleteButton).toBeDefined();
    if (!deleteButton) return;
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith("entry-1");
  });
});
