import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentis Planor",
  description:
    "Application for planning your study time, where 4 hrs of studying per day considered as best",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=" inset-0 bg-cover bg-center bg-fixed bg-black"
        style={{
        }}
      >
        <main className="z-10">
          <div className={`antialiased bg-transparent`}>{children}</div>
        </main>
      </body>
    </html>
  );
}
