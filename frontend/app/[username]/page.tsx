import { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params; // Await the params promise to get the username
      return { 
    title: `${username} | Klyro Profile`,
    description: `View ${username}'s developer profile on Klyro. Backed by proof of work.`,
    openGraph: {
      title: `${username} | Klyro Profile`,
      description: `View ${username}'s developer profile on Klyro. Backed by proof of work.`,
      images: [`/api/og?username=${username}`],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${username} | Klyro Profile`,
      description: `View ${username}'s developer profile on Klyro. Backed by proof of work.`,
      images: [`/api/og?username=${username}`],
    },
  };
}

// Server component that renders the client component
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params; // Await the params promise to get the username
  return <ProfileClient username={username} />;
}