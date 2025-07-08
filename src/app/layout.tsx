import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { 
  APP_NAME, 
  APP_DESCRIPTION, 
  APP_URL, 
  APP_ICON_URL,
  APP_OG_IMAGE_URL 
} from "~/lib/constants";
import { AppHeader } from "~/components/AppHeader";
import { AppFooter } from "~/components/AppFooter";
import { AudioPlayerProvider } from "../components/providers/AudioPlayerProvider";
import AudioPlayerBar from "../components/AudioPlayerBar";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    metadataBase: new URL(APP_URL),
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      url: APP_URL,
      siteName: APP_NAME,
      images: [
        {
          url: APP_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: APP_NAME,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
    },
    icons: {
      icon: APP_ICON_URL,
      apple: APP_ICON_URL,
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': APP_OG_IMAGE_URL,
      'fc:frame:button:1': 'Launch App',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': APP_URL,
    },
  }
}

// Force dynamic rendering since we use getSession which requires headers
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  const session = await getSession()

  return (
    <html lang="en">
      <body>
        <AudioPlayerProvider>
          <Providers session={session}>
            <AppHeader />
            <div className="pb-16">
              {children}
            </div>
            <AppFooter />
            <AudioPlayerBar />
          </Providers>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
