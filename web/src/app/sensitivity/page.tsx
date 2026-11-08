import type { Metadata } from "next";
import { SensitivityView } from "./view";

export const metadata: Metadata = { title: "Sensitivity" };

export default function Page() {
  return <SensitivityView />;
}
