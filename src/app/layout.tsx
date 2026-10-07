import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Analytics } from "@/components/site/analytics";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cartel Deportivo – Lo más completo en deportes",
    template: "%s · Cartel Deportivo",
  },
  description:
    "Lo más reciente del deporte: béisbol, baloncesto, fútbol, boxeo y más desde Santiago de los Caballeros.",
  metadataBase: new URL(process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  icons: {
    icon: "/brand/favicon.jpg",
    apple: "/brand/favicon.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-DO" suppressHydrationWarning className={`${sourceSans.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <AuthSessionProvider>
            <TooltipProvider>
              {children}
              <Analytics />
            </TooltipProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
