import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Enhanced Health Check API Endpoint for PM2 Monitoring
 *
 * Provides comprehensive health status including:
 * - Database connectivity with response time
 * - Memory usage monitoring
 * - Environment configuration validation
 * - System uptime and process information
 */

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    server: {
      status: 'running';
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      pid: number;
    };
  };
  checks: {
    database: boolean;
    environment: boolean;
    memory: boolean;
  };
}

// Database connectivity check with timing
async function checkDatabase() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: 'connected' as const,
      responseTime,
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Memory usage monitoring
function checkMemory() {
  const used = process.memoryUsage();
  const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);

  return {
    used: Math.round(used.heapUsed / 1024 / 1024), // MB
    total: Math.round(used.heapTotal / 1024 / 1024), // MB
    percentage,
  };
}

// Environment validation
function checkEnvironment() {
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NODE_ENV'];
  return requiredEnvVars.every(envVar => process.env[envVar]);
}

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Run health checks
    const databaseCheck = await checkDatabase();
    const memoryCheck = checkMemory();
    const environmentCheck = checkEnvironment();

    // Determine overall health
    const checks = {
      database: databaseCheck.status === 'connected',
      environment: environmentCheck,
      memory: memoryCheck.percentage < 90,
    };

    const allChecksPass = Object.values(checks).every(check => check);
    const criticalChecksFail = !checks.database || !checks.environment;

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (criticalChecksFail) {
      status = 'unhealthy';
    } else if (!allChecksPass) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseCheck,
        server: {
          status: 'running',
          memory: memoryCheck,
          pid: process.pid,
        },
      },
      checks,
    };

    const responseTime = Date.now() - startTime;
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (_error) {
    console.error('Health check endpoint error:', _error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: _error instanceof Error ? _error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

// Support HEAD requests for simple health checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (_error) {
    return new NextResponse(null, { status: 503 });
  }
}
