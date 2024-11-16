import type { Metadata } from "next";
import localFont from "next/font/local";
import StoreProvider from "./StoreProvider";
import Header from "@/components/Header/Header";
import "@/styles/globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tic Tac Toe",
  description: "Enjoy a classic simple Tic-Tac-Toe game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}