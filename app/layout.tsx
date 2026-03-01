import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "Project Launcher",
  description: "Launch builds instantly and monitor them in real time."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} min-h-screen bg-background text-foreground font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
