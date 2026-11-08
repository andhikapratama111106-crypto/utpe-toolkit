import type { Metadata } from "next";
import { ValidateView } from "./view";

export const metadata: Metadata = { title: "Validate" };

export default function Page() {
  return <ValidateView />;
}
