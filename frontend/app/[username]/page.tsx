import { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";

// Define a proper params fetcher function
async function getUsername(params: { username: string }) {
  // This pattern ensures proper awaiting of dynamic segments
  return params.username;
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  // Properly await the username
  const username = await getUsername(params);
  
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
  params 
}: { 
  params: { username: string } 
}) {
  // Properly await the username
  const username = await getUsername(params);
  
  return <ProfileClient username={username} />;
}