import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Digital Business Card — Create & Share NFC Cards",
  description: "Create stunning, interactive digital business cards with premium templates. Share via NFC, QR code, or link.",
};

import config from "@/lib/config";

export default function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";

  return (
    <html lang="en" className="h-dvh w-full" data-theme={theme}>
      <body className={`${inter.variable} ${inter.className} ${outfit.variable} h-full w-full flex flex-col antialiased bg-bg-page text-primary-text font-sans`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
