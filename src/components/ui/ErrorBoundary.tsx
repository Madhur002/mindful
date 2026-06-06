"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/lib/logger";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("UI subtree failed", {
      message: error.message,
      componentStack: info.componentStack
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-5"
          role="alert"
        >
          <div className="flex items-center gap-2 font-semibold text-destructive">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            {this.props.fallbackTitle ?? "This section could not load."}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your saved entries are still on this device. Please refresh and try again.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}
