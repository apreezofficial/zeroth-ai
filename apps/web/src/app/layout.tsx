import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Closing";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zeroth.apcodesphere.xyz/#organization",
      name: "Zeroth",
      url: "https://zeroth.apcodesphere.xyz/",
      sameAs: ["https://www.npmjs.com/org/zeroth-ai", "https://github.com/apreezofficial/zeroth-ai"],
    },
    {
      "@type": "WebSite",
      "@id": "https://zeroth.apcodesphere.xyz/#website",
      name: "Zeroth",
      url: "https://zeroth.apcodesphere.xyz/",
      publisher: { "@id": "https://zeroth.apcodesphere.xyz/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://zeroth.apcodesphere.xyz/#software",
      name: "Zeroth",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Node.js, macOS, Windows, Linux; browser and React Native previews",
      description: "An SDK for running open-weight language models locally inside apps.",
      url: "https://zeroth.apcodesphere.xyz/",
      codeRepository: "https://github.com/apreezofficial/zeroth-ai",
      publisher: { "@id": "https://zeroth.apcodesphere.xyz/#organization" },
    },
  ],
};

const grotesk = Hanken_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zeroth.apcodesphere.xyz"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Zeroth",
    url: "https://zeroth.apcodesphere.xyz/",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Zeroth — private, on-device AI for apps" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  verification: { google: "1cFaK2RI5pPIpetkkRA7e0S5qFz66x4fdb4ZhvMT5eE" },
  title: { default: "On-Device AI SDK for Private Apps", template: "%s | Zeroth" },
  description:
    "Build private AI features with an on-device AI SDK. Run open-weight models locally in Node, Electron, web and mobile apps, with no inference server or per-token API bill.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
