import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Purchase",
  description: "Group purchase landing page with i18n support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
