import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Closing";

const grotesk = Hanken_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zeroth.apcodesphere.xyz"),
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: "Zeroth", url: "./", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  title: "Zeroth — AI that runs fully offline",
  description:
    "Run open-weight AI models inside your app, on the device. Install from npm, download a model once, then chat, get schema-checked JSON and call tools with no server, no API key and no per-token bill.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
