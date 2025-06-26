/**
 * PM2 Ecosystem Configuration for NextJS 15 Manga Website
 *
 * Production-ready configuration with:
 * - Cluster mode for optimal performance
 * - Advanced monitoring and health checks
 * - Comprehensive logging and error handling
 * - Memory and CPU optimization
 * - Auto-restart policies with exponential backoff
 * - Environment-specific configurations
 *
 * Usage:
 * - pm2 start ecosystem.config.js --env production
 * - pm2 restart ecosystem.config.js --env production
 * - pm2 reload ecosystem.config.js --env production (zero-downtime)
 * - pm2 stop ecosystem.config.js
 * - pm2 delete ecosystem.config.js
 */

// const os = require('os'); // Reserved for future CPU-based scaling

module.exports = {
  apps: [
    {
      // Application Configuration
      name: 'manga-website',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: process.cwd(),

      // Environment Configuration
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXT_TELEMETRY_DISABLED: 1,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXT_TELEMETRY_DISABLED: 1,
        // Performance optimizations
        UV_THREADPOOL_SIZE: 128,
        NODE_OPTIONS: '--max-old-space-size=2048',
      },

      // Cluster Configuration for Production
      instances: '2',
      exec_mode: 'cluster',

      // Auto-restart Configuration with Exponential Backoff
      autorestart: true,
      watch: false,
      max_memory_restart: '5G',
      restart_delay: 4000,

      // Logging Configuration with Rotation
      log_file: './logs/pm2/combined.log',
      out_file: './logs/pm2/out.log',
      error_file: './logs/pm2/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_type: 'json',
      merge_logs: true,

      // Advanced Process Management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Health Monitoring with Exponential Backoff
      min_uptime: '10s',
      max_restarts: 15,
      exponential_backoff_restart_delay: 100,

      // Performance Monitoring
      pmx: true,
      automation: false,

      // Environment File
      env_file: '.env.production',

      // Source Map Support
      source_map_support: true,

      // Process Title
      name: 'manga-website-prod',
    },
  ],

  // Deployment Configuration for VPS
  deploy: {
    production: {
      // Server Configuration (customize for your VPS)
      user: 'deploy',
      host: ['your-server.com'], // Can be array for multiple servers
      ref: 'origin/main',
      repo: 'git@github.com:your-username/manga-website.git',
      path: '/var/www/manga-website',
      ssh_options: 'StrictHostKeyChecking=no',

      // Pre-deployment (local machine)
      'pre-deploy-local': ['echo "🚀 Starting deployment..."', 'git add -A', 'git status'].join(
        ' && '
      ),

      // Pre-setup (first time only)
      'pre-setup': [
        'mkdir -p /var/www/manga-website',
        'mkdir -p /var/www/manga-website/logs/pm2',
        'curl -fsSL https://get.pnpm.io/install.sh | sh -',
      ].join(' && '),

      // Post-deployment (on server)
      'post-deploy': [
        'source ~/.bashrc',
        'pnpm install --frozen-lockfile',
        'npx prisma generate',
        'npx prisma migrate deploy',
        'pnpm build',
        'pm2 reload ecosystem.config.js --env production',
        'pm2 save',
      ].join(' && '),

      // Environment
      env: {
        NODE_ENV: 'production',
      },
    },

    // Staging environment (optional)
    staging: {
      user: 'deploy',
      host: ['staging.your-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/manga-website.git',
      path: '/var/www/manga-website-staging',
      'post-deploy': [
        'pnpm install --frozen-lockfile',
        'npx prisma generate',
        'npx prisma db push',
        'pnpm build',
        'pm2 reload ecosystem.config.js --env staging',
      ].join(' && '),
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
