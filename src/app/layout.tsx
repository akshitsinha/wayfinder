import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/lib/sw";

export const metadata: Metadata = {
  title: "Wayfinder",
  description: "An open source wayfinding app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Wayfinder" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
