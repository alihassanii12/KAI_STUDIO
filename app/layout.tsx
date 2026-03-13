import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KAI STUDIO - Creative Design & Innovative Projects",
    template: "%s | KAI STUDIO"
  },
  description: "KAI STUDIO creates unique, innovative projects blending creativity with cutting-edge technology. Explore our portfolio of design, development, and creative solutions.",
  keywords: [
    "KAI STUDIO", 
    "creative studio", 
    "design projects", 
    "innovative design", 
    "web development", 
    "creative agency",
    "UI/UX design",
    "digital projects"
  ],
  authors: [{ name: "KAI STUDIO Team" }],
  creator: "KAI STUDIO",
  publisher: "KAI STUDIO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kai-studio.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en-US',
      'ur-PK': '/ur-PK',
    },
  },
  openGraph: {
    title: "KAI STUDIO - Creative Design & Innovative Projects",
    description: "Discover unique projects where creativity meets technology. KAI STUDIO pushes boundaries to create exceptional digital experiences.",
    url: "https://kai-studio.vercel.app",
    siteName: "KAI STUDIO",
    images: [
      {
        url: "/og-image.jpg", // Apni website ka thumbnail image yahan lagayein
        width: 1200,
        height: 630,
        alt: "KAI STUDIO - Creative Projects",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KAI STUDIO - Creative Design & Innovative Projects",
    description: "Discover unique projects where creativity meets technology.",
    images: ["/twitter-image.jpg"], // Twitter ke liye alag image bana sakte hain
    creator: "@kaistudio", // Agar Twitter handle hai to
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: "/manifest.json", // PWA ke liye agar chahein to
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}