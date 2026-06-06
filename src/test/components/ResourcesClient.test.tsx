import { screen } from "@testing-library/react";
import ResourcesClient from "@/components/resources/ResourcesClient";
import { renderWithApp } from "@/test/test-utils";

describe("ResourcesClient", () => {
  it("renders wellness resources and helpline links", () => {
    renderWithApp(<ResourcesClient />);

    expect(screen.getByText("Breathing Techniques")).toBeInTheDocument();
    expect(screen.getByText(/Vandrevala Foundation/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iCALL contact details/i })).toBeInTheDocument();
  });
});
