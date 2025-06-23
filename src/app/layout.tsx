import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { APP_NAME, APP_DESCRIPTION } from "~/lib/constants";
import { AppHeader } from "~/components/AppHeader";
import { AppFooter } from "~/components/AppFooter";
import { AudioPlayerProvider } from "../components/providers/AudioPlayerProvider";
import AudioPlayerBar from "../components/AudioPlayerBar";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

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
