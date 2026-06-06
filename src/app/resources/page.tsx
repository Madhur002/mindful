"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const ResourcesClient = dynamic(
  () => import("@/components/resources/ResourcesClient"),
  {
    loading: () => <LoadingSkeleton label="Loading resources" />
  }
);

export default function ResourcesPage(): JSX.Element {
  return <ResourcesClient />;
}
