import { Metadata, ResolvingMetadata } from 'next';
import { env } from '@/config/env';

type Props = {
  params: { username: string };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username;
  
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

export default function UserLayout({ children }: Props) {
  return children;
} 