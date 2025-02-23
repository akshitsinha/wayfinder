import type { Metadata } from "next";
import ServiceWorkerRegistrar from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayfinder",
  description: "An open source wayfinding app",
  keywords: ["navigation", "wayfinding", "maps"],
  creator: "Akshit Sinha",
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
        <main>{children}</main>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
