import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CORS Online Tester",
  description: "Test CORS on any URL",
  authors: [{ name: "Marcia Ong", url: "https://www.mrmarciaong.com" }],
  creator: "Marcia Ong",
  openGraph: {
    title: "CORS Online Tester",
    description: "Test CORS on any URL",
    url: "https://www.mrmarciaong.com",
    siteName: "CORS Online Tester",
    type: "website",
  },
  twitter: {
    card: "summary",
    creator: "@Marcia_Ong",
  },
  other: {
    github: "https://github.com/MrMarciaOng",
    linkedin: "https://www.linkedin.com/in/mrmarciaong/",
  },
  icons: {
    icon: "/detective-otter.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  );
}
