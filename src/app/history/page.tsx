"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const HistoryClient = dynamic(() => import("@/components/history/HistoryClient"), {
  loading: () => <LoadingSkeleton label="Loading history" />
});

export default function HistoryPage(): JSX.Element {
  return <HistoryClient />;
}
