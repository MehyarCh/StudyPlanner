import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CustomCursor from "@/components/CustomCursor";
import ShootingStars from "@/components/ShootingStars";
import EffectsToggle from "@/components/EffectsToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study Planner",
  description: "Track your courses, documents, and important dates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
          {/* Effects Toggle */}
          <EffectsToggle />
          
          {/* Ambient background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Shooting Stars */}
          <ShootingStars />

          {/* Content overlay */}
          <div className="relative z-10">
            <Navigation />
            <main className="relative">
              {children}
            </main>
          </div>
          {/* Custom Cursor */}
          <CustomCursor />
        </div>
      </body>
    </html>
  );
}
