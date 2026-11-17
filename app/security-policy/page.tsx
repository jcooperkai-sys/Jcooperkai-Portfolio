import type { Metadata } from "next";
import source from "../../public/security-policy.txt?raw";
import { TextPage } from "../text-page";

export const metadata: Metadata = { title: "Responsible disclosure, jcooperkai", alternates: { canonical: "/security-policy" } };

export default function SecurityPolicy() {
  return <TextPage source={source} plain="/security-policy.txt" />;
}
