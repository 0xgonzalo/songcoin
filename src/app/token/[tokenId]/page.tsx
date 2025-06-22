import Token from "~/components/Token";
import { Metadata } from "next";
import { getTokenById } from "~/lib/tracks";

interface TokenPageProps {
  params: Promise<{
    tokenId: string;
  }>;
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const { tokenId } = await params;
  const token = getTokenById(tokenId);
  
  if (!token) {
    return {
      title: "Token Not Found",
      description: "The requested token does not exist."
    };
  }

  return {
    title: `${token.title} by ${token.artist} | SongCoin`,
    description: `Trade ${token.title} by ${token.artist}. Market cap: ${token.mcap}. ${token.genre} music token.`,
  };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { tokenId } = await params;
  return <Token tokenId={tokenId} />;
} 