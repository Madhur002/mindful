import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { WellnessResponse } from "@/components/ai/WellnessResponse";
import { renderWithApp } from "@/test/test-utils";

const response = {
  copingStrategy: "Take one small reset before the next revision block.",
  motivation: "JEE preparation is difficult, and one tough day is not your identity.",
  mindfulnessExercise: "Inhale for four counts, hold, exhale, and relax your shoulders.",
  studyTip: "Keep a short formula review after your mock analysis."
};

describe("WellnessResponse", () => {
  it("shows a skeleton during loading", () => {
    renderWithApp(
      <WellnessResponse status="loading" response={null} error={null} fallback={false} />
    );

    expect(screen.getByRole("status", { name: /generating wellness support/i })).toBeInTheDocument();
  });

  it("renders an empty state before check-in", () => {
    renderWithApp(
      <WellnessResponse status="idle" response={null} error={null} fallback={false} />
    );

    expect(screen.getByText("AI support appears after your check-in")).toBeInTheDocument();
  });

  it("renders AI text accessibly", async () => {
    const { container } = renderWithApp(
      <WellnessResponse status="success" response={response} error={null} fallback={false} />
    );

    expect(screen.getByText(response.motivation)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows fallback messaging on error", () => {
    renderWithApp(
      <WellnessResponse
        status="success"
        response={response}
        error="Showing fallback support."
        fallback={true}
      />
    );

    expect(screen.getByText("Fallback")).toBeInTheDocument();
    expect(screen.getByText("Showing fallback support.")).toBeInTheDocument();
  });
});
