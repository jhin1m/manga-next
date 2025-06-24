import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkStorageHealth, getStorageProvider } from '@/lib/storage-provider';

// Detect S3-compatible provider based on endpoint
function detectS3Provider(): string {
  const endpoint = process.env.S3_ENDPOINT;

  if (!endpoint) {
    return 'AWS S3';
  }

  if (endpoint.includes('wasabisys.com')) {
    return 'Wasabi';
  }

  if (endpoint.includes('backblazeb2.com')) {
    return 'Backblaze B2';
  }

  if (endpoint.includes('digitaloceanspaces.com')) {
    return 'DigitalOcean Spaces';
  }

  if (endpoint.includes('r2.cloudflarestorage.com')) {
    return 'Cloudflare R2';
  }

  return 'Custom S3-Compatible';
}

/**
 * GET /api/storage/health
 * Check storage provider health and configuration
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users (optional - you might want to make this admin-only)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = getStorageProvider();
    const health = await checkStorageHealth();

    return NextResponse.json({
      provider,
      health: health.healthy,
      error: health.error,
      timestamp: new Date().toISOString(),
      configuration: {
        cloudinary: {
          configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
        },
        s3: {
          configured: !!(
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            process.env.AWS_S3_BUCKET
          ),
          region: process.env.AWS_REGION || null,
          bucket: process.env.AWS_S3_BUCKET || null,
          endpoint: process.env.S3_ENDPOINT || null,
          forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
          cdnUrl: process.env.AWS_CLOUDFRONT_URL || null,
          provider: detectS3Provider(),
        },
      },
    });
  } catch (error) {
    console.error('Storage health check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check storage health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
