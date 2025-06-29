import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import { ThirdwebProviderWrapper } from "./libs/providers/thirdweb-provider";
import { PlayerProvider } from "./libs/providers/player-provider";

const Arcadepix = localFont({ src: './fonts/Arcadepix.woff', display: 'swap', weight: '400', style: 'normal' })


export const metadata: Metadata = {
  title: "Seas Of Linkardia",
  description: "Seas Of Linkardia",
  keywords: "blockchain game, NFT, pirates, navigation, Etherlink, Tezos, Web3",
  authors: [{ name: "Seas Of Linkardia Team" }],
  openGraph: {
    title: "Seas Of Linkardia",
    description: "Seas Of Linkardia",
    type: "website",
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
          className={`${Arcadepix.className} antialiased`}
      >
        <ThirdwebProviderWrapper>
          <PlayerProvider>
        {children}
          </PlayerProvider>
        </ThirdwebProviderWrapper>
      </body>
    </html>
  );
}
