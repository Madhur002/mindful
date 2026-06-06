import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AppShell } from "@/components/layout/AppShell";
import { renderWithApp } from "@/test/test-utils";
import type { ReactNode } from "react";

jest.mock("next/navigation", () => ({
  usePathname: () => "/"
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
  it("renders semantic navigation and passes axe", async () => {
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
