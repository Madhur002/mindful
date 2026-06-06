import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriggerSelector } from "@/components/mood/TriggerSelector";
import { renderWithApp } from "@/test/test-utils";
import type { StressTrigger } from "@/types";

describe("TriggerSelector", () => {
  it("supports keyboard selection and aria-checked state", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn((next: StressTrigger[]) => {
      rerender(
        <TriggerSelector selectedTriggers={next} onChange={onChange} />
      );
    });
    const { rerender } = renderWithApp(
      <TriggerSelector selectedTriggers={[]} onChange={onChange} />
    );
    const option = screen.getByRole("checkbox", { name: "Sleep deprivation" });

    option.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Sleep deprivation" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    await user.keyboard("{Enter}");
    expect(screen.getByRole("checkbox", { name: "Sleep deprivation" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });
});
