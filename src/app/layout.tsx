import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentis Planor",
  description: "Application for planning your study time, where 4 hrs of studying per day considered as best",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=" inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/background.png')",
        }}
      >
        <div className="inset-0 bg-black/40" />
        <main className=" z-10">
          <div className={`antialiased bg-transparent`}>{children}</div>
        </main>
      </body>
    </html>
  );
}
