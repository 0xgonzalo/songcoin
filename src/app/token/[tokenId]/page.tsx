import Token from "~/components/Token";
import { Metadata } from "next";
import { getTokenById } from "~/lib/tracks";

interface TokenPageProps {
  params: {
    tokenId: string;
  };
}

export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const token = getTokenById(params.tokenId);
  
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

export default function TokenPage({ params }: TokenPageProps) {
  return <Token tokenId={params.tokenId} />;
} 