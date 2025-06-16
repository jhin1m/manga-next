import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          position: 'relative',
        }}
      >
        {/* Book/Manga icon */}
        <div
          style={{
            width: '120px',
            height: '90px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '8px',
          }}
        >
          {/* Lines representing text */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                width: '60px',
                height: '6px',
                background: 'white',
                borderRadius: '3px',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                width: '60px',
                height: '6px',
                background: 'white',
                borderRadius: '3px',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                width: '45px',
                height: '6px',
                background: 'white',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
