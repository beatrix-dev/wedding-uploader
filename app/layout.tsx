import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Romano Wedding Uploads",
  description: "Private wedding photo upload and gallery experience for guests.",
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
