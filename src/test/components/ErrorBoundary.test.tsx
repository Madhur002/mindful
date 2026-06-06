import { screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { renderWithApp } from "@/test/test-utils";

const BrokenSection = (): JSX.Element => {
  throw new Error("broken");
};

describe("ErrorBoundary", () => {
  it("renders fallback UI when a child throws", () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithApp(
      <ErrorBoundary fallbackTitle="Custom fallback">
        <BrokenSection />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Custom fallback");
  });
});
