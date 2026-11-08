import type { Metadata } from "next";
import { ProjectionView } from "./view";

export const metadata: Metadata = { title: "Projection" };

export default function Page() {
  return <ProjectionView />;
}
