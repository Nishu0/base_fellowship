import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Klyro: Discover Talent backed by Proof of Work'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Grid pattern */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />
        
        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <p
            style={{
              color: 'white',
              fontSize: '120px',
              fontWeight: 'bold',
              fontStyle: 'italic',
              fontFamily: 'serif',
              margin: 0,
            }}
          >
            Klyro
          </p>
          <p
            style={{
              color: '#aaa',
              fontSize: '24px',
              margin: '20px 0 0 0',
            }}
          >
            Discover Talent backed by Proof of Work
          </p>
        </div>
      </div>
    ),
    { ...size }
  )
} 