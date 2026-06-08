import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AppShell } from "@/components/layout/AppShell";
import { renderWithApp } from "@/test/test-utils";
import type { ReactNode } from "react";

let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname
}));

jest.mock("next/link", () => {
  const Link = ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  return Link;
});

describe("AppShell", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("renders the immersive home shell and passes axe", async () => {
    const { container } = renderWithApp(
      <AppShell>
        <section>Page content</section>
      </AppShell>
    );

    expect(screen.queryByRole("navigation", { name: /primary navigation/i })).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders semantic navigation for legacy internal pages and passes axe", async () => {
    mockPathname = "/settings";

    const { container } = renderWithApp(
      <AppShell>
        <section>Page content</section>
      </AppShell>
    );

    expect(screen.getByRole("navigation", { name: /primary navigation/i })).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
