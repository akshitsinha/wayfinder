import type { Metadata } from "next";
import "./globals.css";

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="apple-mobile-web-app-title" content="Wayfinder" />
      </head>
      <body>{children}</body>
    </html>
  );
}
