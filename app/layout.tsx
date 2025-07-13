import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import { ThirdwebProviderWrapper } from "./libs/providers/thirdweb-provider";
import { PlayerProvider } from "./libs/providers/player-provider";
import { Toaster } from "sonner";
import { NotificationToaster } from "./components/NotificationToaster";

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
            <NotificationToaster />
          </PlayerProvider>
        </ThirdwebProviderWrapper>
        <Toaster 
          position="top-center"
          richColors={false}
          closeButton
          duration={4000}
          toastOptions={{
            className: 'ui1 p-6',
            style: {
              fontSize: '14px',
              fontFamily: Arcadepix.style.fontFamily,
              background: `
                url('/ui/ui2_bottom_right.png') no-repeat 100% 100%,
                url('/ui/ui2_bottom_left.png') no-repeat 0 100%,
                url('/ui/ui2_bottom_center.png') no-repeat 50% 100%,
                url('/ui/ui2_top_right.png') no-repeat 100% 0,
                url('/ui/ui2_top_left.png') no-repeat 0 0,
                url('/ui/ui2_top_center.png') no-repeat 50% 0,
                url('/ui/ui2_middle_left.png') no-repeat 0 50%,
                url('/ui/ui2_middle_right.png') no-repeat 100% 50%,
                url('/ui/ui2_middle_center.png') no-repeat 50% 50%
              `,
              backgroundSize: '32px 32px, 32px 32px, calc(100% - 61px) 32px, 32px 32px, 32px 32px, calc(100% - 61px) 32px, 32px calc(100% - 61px), 32px calc(100% - 61px), calc(100% - 61px) calc(100% - 61px)',
              filter: 'drop-shadow(5px 5px 0px rgba(0, 0, 0, 0.25))',
              border: 'none',
              borderRadius: '0',
              padding: '16px',
              color: 'white',
              minWidth: '300px',
            },
          }}
        />
      </body>
    </html>
  );
}
