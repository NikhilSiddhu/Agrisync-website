import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agrisync.tech | Precision Agriculture AI",
  description:
    "Agrisync is an agricultural AI platform that combines hardware sensors and machine intelligence for targeted fertilizer and pesticide distribution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0A0A0A] text-[#E5E5E5]">{children}</body>
    </html>
  );
}
