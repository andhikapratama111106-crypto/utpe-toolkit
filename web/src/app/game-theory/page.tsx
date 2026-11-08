import type { Metadata } from "next";
import { GameView } from "./view";

export const metadata: Metadata = { title: "Game Theory" };

export default function Page() {
  return <GameView />;
}
