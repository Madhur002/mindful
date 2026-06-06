import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MoodCheckIn } from "@/components/mood/MoodCheckIn";
import { createMoodEntry, renderWithApp } from "@/test/test-utils";

describe("MoodCheckIn", () => {
  it("renders and submits a valid form", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { container } = renderWithApp(
      <MoodCheckIn todayEntry={null} isSubmitting={false} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText("Mood score"), { target: { value: "8" } });
    await user.selectOptions(screen.getByLabelText("Exam type"), "JEE");
    await user.click(screen.getByRole("checkbox", { name: "Study load" }));
    await user.type(
      screen.getByLabelText("Reflection note"),
      "Study load was high but I finished revision."
    );
    await user.click(screen.getByRole("button", { name: /save check-in/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ moodScore: 8, examType: "JEE" })
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows validation errors for invalid values", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithApp(
      <MoodCheckIn todayEntry={null} isSubmitting={false} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText("Reflection note"), {
      target: { value: "a".repeat(501) }
    });
    await user.click(screen.getByRole("button", { name: /save check-in/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("blocks submit while an existing entry is already submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithApp(
      <MoodCheckIn
        todayEntry={createMoodEntry()}
        isSubmitting={true}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("Edit your entry until midnight.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /update check-in/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
