import type { Metadata } from "next";
import { BiayaPerTahunView } from "./view";

export const metadata: Metadata = { title: "Biaya per Tahun" };

export default function Page() {
  return <BiayaPerTahunView />;
}
