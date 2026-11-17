import type { Metadata } from "next";
import source from "../../public/privacy.txt?raw";
import { TextPage } from "../text-page";

export const metadata: Metadata = { title: "Privacy and local files, jcooperkai", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return <TextPage source={source} plain="/privacy.txt" />;
}
