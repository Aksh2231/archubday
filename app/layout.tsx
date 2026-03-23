import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archana's Birthday Memory Book",
  description: "A playful memory-sharing birthday app with prompts, uploads, and a guessing game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-[-6rem] top-20 h-52 w-52 rounded-full bg-white/60 blur-3xl" />
          <div className="pointer-events-none absolute right-[-3rem] top-48 h-64 w-64 rounded-full bg-mint/80 blur-3xl" />
          {children}
        </div>
      </body>
    </html>
  );
}
