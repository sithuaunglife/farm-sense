import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Farm Sense | Myanmar Earth Observation",
  description: "Regional environmental observations and agricultural decision support for Myanmar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
