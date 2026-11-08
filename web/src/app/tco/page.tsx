import type { Metadata } from "next";
import { TcoView } from "./view";

export const metadata: Metadata = { title: "TCO" };

export default function Page() {
  return <TcoView />;
}
