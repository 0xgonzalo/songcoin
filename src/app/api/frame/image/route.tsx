import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'welcome';

  let title = 'Songcoin';
  let subtitle = 'Create your songcoins with Zora';
  let description = 'Explore, Create & Trade Music Tokens';

  switch (action) {
    case 'welcome':
      title = 'Welcome to Songcoin';
      subtitle = 'Coins for Musicians';
      description = 'Create your songcoins with Zora';
      break;
    case 'explore-coins':
      title = 'Explore Songcoins';
      subtitle = 'Discover & Trade Artist Tokens';
      description = 'Find your favorite artists and invest in their music';
      break;
    case 'signin':
      title = 'Connect Your Wallet';
      subtitle = 'Start Creating Songcoins';
      description = 'Join the decentralized music economy';
      break;
    case 'learn-more':
      title = 'How Songcoin Works';
      subtitle = 'Zora Protocol on Base';
      description = 'Explore, Create & Trade Music Tokens';
      break;
  }

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
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(ellipse at center, #1a1a2e 0%, #000000 70%)',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, #7c3aed 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, #ec4899 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
            padding: '80px',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              border: '4px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              SC
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#e2e8f0',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              margin: '0',
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            {description}
          </p>

          {/* Bottom Badge */}
          <div
            style={{
              marginTop: '60px',
              padding: '12px 24px',
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#a855f7',
            }}
          >
            🎵 Powered by Zora Protocol on Base
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 