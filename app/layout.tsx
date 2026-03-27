import type { Metadata } from "next";
import "./globals.css";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "F1 Predictor Pro",
  description: "Simulate upcoming F1 races and see projected championship standings in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 1, display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
