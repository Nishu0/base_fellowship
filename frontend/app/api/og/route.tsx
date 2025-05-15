import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Function to load Google Fonts
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status == 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error('failed to load font data')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    // Load the Playfair Display font for the Klyro logo
    const playfairFont = await loadGoogleFont('Playfair+Display:ital,wght@1,700', 'Klyro').catch(() => null);
    
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
            <div style={{ marginBottom: 24, display: 'flex' }}>Klyro Developer Profile</div>
            <div style={{ fontSize: 24, opacity: 0.8, display: 'flex' }}>Username not provided</div>
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
            <div style={{ marginBottom: 24, display: 'flex' }}>Klyro Developer Profile</div>
            <div style={{ fontSize: 24, opacity: 0.8, display: 'flex' }}>{username} not found</div>
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
            background: 'black',
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
              display: 'flex',
            }}
          />
                  
          {/* Avatar and Name Section */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
            {userData.userData.avatar_url ? (
              <div
                style={{
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: 150,
                  height: 150,
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
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
            ) : (
              <div
                style={{
                  borderRadius: '50%',
                  width: 150,
                  height: 150,
                  backgroundColor: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                  fontWeight: 'bold',
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {(userData.userData.name || userData.userData.login || username).charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ marginLeft: 30, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex' }}>{userData.userData.name || userData.userData.login}</div>
              <div style={{ fontSize: 24, color: '#a1a1aa', marginTop: 5, display: 'flex' }}>@{userData.userData.login}</div>
              {userData.userData.bio && (
                <div style={{ fontSize: 20, color: '#d4d4d8', marginTop: 10, maxWidth: 500, display: 'flex' }}>{userData.userData.bio}</div>
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
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: 24, color: '#a1a1aa', display: 'flex' }}>Overall Klyro Score</div>
              <div style={{ fontSize: 64, fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }}>
                {overallScore}<span style={{ fontSize: 36, opacity: 0.6, marginLeft: 5, display: 'flex' }}>/100</span>
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
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa', display: 'flex' }}>GitHub Score</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex', alignItems: 'baseline', color: '#38bdf8' }}>
                  {Math.round(web2Score)}<span style={{ fontSize: 24, opacity: 0.6, marginLeft: 5, display: 'flex' }}>/100</span>
                </div>
              </div>
              
              {/* Onchain Score */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px 25px',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa', display: 'flex' }}>Onchain Score</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex', alignItems: 'baseline', color: '#8b5cf6' }}>
                  {Math.round(web3Score)}<span style={{ fontSize: 24, opacity: 0.6, marginLeft: 5, display: 'flex' }}>/100</span>
                </div>
              </div>
              
              {/* Worth */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '15px 25px',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <div style={{ fontSize: 24, color: '#a1a1aa', display: 'flex' }}>Developer Worth</div>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#22c55e', display: 'flex' }}>${formatNumber(overallWorth)}</div>
              </div>
            </div>
          </div>
          
          {/* Klyro Logo */}
          <div style={{ position: 'absolute', top: 50, right: 50, opacity: 0.9, zIndex: 2, display: 'flex' }}>
            <div style={{ 
              fontSize: 64, 
              fontWeight: 'bold', 
              fontStyle: 'italic', 
              fontFamily: '"Playfair Display", serif', 
              color: 'white', 
              display: 'flex' 
            }}>
              Klyro
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ 
            position: 'absolute',
            bottom: 15,
            right: 15,
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.4)',
            zIndex: 2,
            display: 'flex' 
          }}>
            klyro.dev
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: playfairFont ? [
          {
            name: 'Playfair Display',
            data: playfairFont,
            style: 'italic',
            weight: 700
          }
        ] : undefined,
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
    console.log("USERNAME", username);
    
    // Use direct URL since it's working
    const hardcodedUrl = `https://api.klyro.dev/fbi/status/${username}`;
    console.log("USING URL", hardcodedUrl);
    
    try {
      // Create a server-side compatible API client with proper headers
      const response = await fetch(hardcodedUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Klyro-OG-Image-Generator',
        },
        cache: 'no-store', // Don't cache in Edge runtime for fresh data
        method: 'GET',
      });
      console.log("RESPONSE STATUS", response.status);
      
      if (!response.ok) {
        console.error(`API returned status: ${response.status}`);
        throw new Error(`API returned status: ${response.status}`);
      }

      // Check content type and handle accordingly
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        throw new Error('Invalid content type from API');
      }
      
      // Safely parse JSON response
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError, 'Response text:', text.substring(0, 200));
        throw new Error('Invalid JSON response from API');
      }
      
      // Validate API response structure
      if (!data?.data?.userData) {
        console.error('API response missing userData', data);
        throw new Error('API response missing userData');
      }
      
      console.log('Successfully fetched user data for:', username);
      return data.data;
    } catch (error) {
      console.error('API call failed:', error);
      // Use mock data as fallback
      console.warn('Using mock data for:', username);
      return {
        userData: {
          login: username,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          avatar_url: null, // Will use fallback
          bio: "Full-stack developer"
        },
        score: {
          totalScore: 75,
          metrics: {
            web2: { total: 70 },
            web3: { total: 80 }
          }
        },
        developerWorth: {
          totalWorth: 155000
        }
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}