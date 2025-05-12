import { Metadata, ResolvingMetadata } from 'next';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ username: string }>;
};

export async function generateMetadata(
  { params }: LayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = (await params).username;
  
  // Construct base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.klyro.dev';
  
  // Generate OG image URL
  const ogImageUrl = `${baseUrl}/api/og?username=${encodeURIComponent(username)}`;
  
  return {
    title: `${username} | Klyro Developer Profile`,
    description: `Check out ${username}'s developer profile on Klyro, showcasing their GitHub and on-chain activity.`,
    openGraph: {
      title: `${username} | Klyro Developer Profile`,
      description: `Check out ${username}'s developer profile on Klyro, showcasing their GitHub and on-chain activity.`,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${username}'s Klyro Developer Profile`
      }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username} | Klyro Developer Profile`,
      description: `Check out ${username}'s developer profile on Klyro, showcasing their GitHub and on-chain activity.`,
      images: [ogImageUrl],
    }
  };
}

// @ts-ignore
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}