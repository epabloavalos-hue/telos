import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SettingsProvider from "@/components/SettingsProvider";
import SplashScreen from "@/components/SplashScreen";
import BackgroundMusic from "@/components/BackgroundMusic";
import ServiceWorker from "@/components/ServiceWorker";

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "TELOS",
  description: "El propósito último que mueve todo lo demás.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TELOS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${ibmMono.variable} ${ibmSans.variable}`}>
      <body className="flex h-screen overflow-hidden">
        <ServiceWorker />
        <SplashScreen />
        <BackgroundMusic />
        <SettingsProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  );
}
