import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom right, #000000, #1a365d)',
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            <div style={{ marginBottom: 24 }}>Klyro Developer Profile</div>
            <div style={{ fontSize: 24, opacity: 0.8 }}>Username not provided</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }
    
    // Fetch user data from the API
    const userData = await fetchUserData(username);
    
    // If no data found, show an error message
    if (!userData) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom right, #000000, #1a365d)',
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            <div style={{ marginBottom: 24 }}>Klyro Developer Profile</div>
            <div style={{ fontSize: 24, opacity: 0.8 }}>{username} not found</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }
    
    // Format numbers for display
    const formatNumber = (value: number): string => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      } else {
        return value.toString();
      }
    };
    
    // Calculate scores
    const web2Score = userData.score?.metrics?.web2?.total || 0; 
    const web3Score = userData.score?.metrics?.web3?.total || 0;
    const overallScore = web2Score && web3Score
      ? Math.round((web2Score + web3Score) / 2)
      : userData.score?.totalScore 
        ? Math.round(userData.score.totalScore) 
        : web2Score || web3Score || 0;
    
    const overallWorth = userData.developerWorth?.totalWorth || 0;
    
    // Generate OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 50,
            background: 'linear-gradient(to bottom right, #000000, #1a365d)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          {/* Grid pattern overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(to right, rgba(30, 41, 59, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.2) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              zIndex: 1,
            }}
          />
                  
          {/* Avatar and Name Section */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
            <div
              style={{
                borderRadius: '50%',
                overflow: 'hidden',
                width: 150,
                height: 150,
                border: '4px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={userData.userData.avatar_url}
                alt={userData.userData.name || userData.userData.login}
                width={150}
                height={150}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div style={{ marginLeft: 30, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, fontWeight: 'bold' }}>{userData.userData.name || userData.userData.login}</div>
              <div style={{ fontSize: 24, color: '#a1a1aa', marginTop: 5 }}>@{userData.userData.login}</div>
              {userData.userData.bio && (
                <div style={{ fontSize: 20, color: '#d4d4d8', marginTop: 10, maxWidth: 500 }}>{userData.userData.bio}</div>
              )}
            </div>
          </div>
          
          {/* Score Cards Row */}
          <div 
            style={{
              position: 'absolute',
              bottom: 50,
              left: 50,
              right: 50,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 15,
              zIndex: 2,
            }}
          >
            {/* Overall Score */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '15px 25px',
                borderRadius: 16,
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: 24, color: '#a1a1aa' }}>Overall Klyro Score</div>
              <div style={{ fontSize: 64, fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }}>
                {overallScore}<span style={{ fontSize: 36, opacity: 0.6, marginLeft: 5 }}>/100</span>
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div style={{ display: 'flex', gap: 15 }}>
              {/* GitHub Score */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px 25px',
                  borderRadius: 16,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa' }}>GitHub Score</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex', alignItems: 'baseline', color: '#38bdf8' }}>
                  {Math.round(web2Score)}<span style={{ fontSize: 24, opacity: 0.6, marginLeft: 5 }}>/100</span>
                </div>
              </div>
              
              {/* Onchain Score */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px 25px',
                  borderRadius: 16,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa' }}>Onchain Score</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex', alignItems: 'baseline', color: '#8b5cf6' }}>
                  {Math.round(web3Score)}<span style={{ fontSize: 24, opacity: 0.6, marginLeft: 5 }}>/100</span>
                </div>
              </div>
              
              {/* Worth */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px 25px',
                  borderRadius: 16,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa' }}>Developer Worth</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#22c55e' }}>${formatNumber(overallWorth)}</div>
              </div>
            </div>
          </div>
          
          {/* Klyro Logo */}
          <div style={{ position: 'absolute', top: 50, right: 50, opacity: 0.7, zIndex: 2 }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', fontStyle: 'italic', color: 'white' }}>
              Klyro
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate OG image: ${e}`, {
      status: 500,
    });
  }
}

// Function to fetch user data
async function fetchUserData(username: string) {
  try {
    // Get the API URL properly considering the environment
    // In the Edge runtime, we need to use environment variables carefully
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.klyro.dev';
    
    // Create a server-side compatible API client
    const response = await fetch(`${baseUrl}/fbi/status/${username}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache in Edge runtime for fresh data
    });
    
    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Check for required userData and shape the response to match the expected format
    if (!data?.data?.userData) {
      console.error('API response missing userData');
      return null;
    }
    
    // Create a properly formatted object based on the actual API response
    return data.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}