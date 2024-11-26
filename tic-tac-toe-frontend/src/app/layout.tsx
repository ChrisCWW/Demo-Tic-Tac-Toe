import type { Metadata } from 'next';
import Head from 'next/head';
import localFont from'next/font/local';
import StoreProvider from '@/app/StoreProvider';
import Header from '@/components/Header/Header';
import { images } from '@/lib/utils/assets';
import '@/styles/globals.css';

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
      <Head>
        {
          Object.values(images).map((imagePath, idx) => (
            <link key={idx} rel="preload" as="image" href={imagePath} />
          ))
        }
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
