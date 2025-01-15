import { Metadata } from "next";
import { DAOLayoutClient } from "./layout-client";
import { supabase } from "@/utils/supabase/client";

// Twitter recommends 2:1 ratio images
// Minimum dimensions: 300x157
// Maximum dimensions: 4096x4096
// Recommended dimensions: 1200x600
const TWITTER_IMAGE_WIDTH = 1200;
const TWITTER_IMAGE_HEIGHT = 600;

// Open Graph recommends 1.91:1 ratio
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 628;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const [{ data: dao }, { data: token }] = await Promise.all([
    supabase
      .from("daos")
      .select("name, description")
      .eq("id", params.id)
      .single(),
    supabase
      .from("tokens")
      .select("image_url")
      .eq("dao_id", params.id)
      .single(),
  ]);

  if (!dao) {
    return {
      title: "DAO Not Found",
      description: "The requested DAO could not be found.",
    };
  }

  // Generate separate URLs for Twitter and Open Graph with correct dimensions
  const twitterImageUrl = token?.image_url
    ? `${token.image_url}?w=${TWITTER_IMAGE_WIDTH}&h=${TWITTER_IMAGE_HEIGHT}&fit=cover&auto=format`
    : undefined;

  const ogImageUrl = token?.image_url
    ? `${token.image_url}?w=${OG_IMAGE_WIDTH}&h=${OG_IMAGE_HEIGHT}&fit=cover&auto=format`
    : undefined;

  return {
    title: dao.name,
    description: dao.description,
    openGraph: {
      title: dao.name,
      description: dao.description,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: OG_IMAGE_WIDTH,
              height: OG_IMAGE_HEIGHT,
              alt: `${dao.name} token logo`,
            },
          ]
        : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dao.name,
      description: dao.description,
      // Twitter specific image with 2:1 ratio
      images: twitterImageUrl ? [twitterImageUrl] : undefined,
      creator: "@aibtcdev",
    },
    alternates: {
      canonical: `/daos/${params.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [dao.name, "DAO", "Blockchain", "Governance", "Token"],
  };
}

export default function DAOLayout({ children }: { children: React.ReactNode }) {
  return <DAOLayoutClient>{children}</DAOLayoutClient>;
}
