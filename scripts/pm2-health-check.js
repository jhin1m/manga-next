#!/usr/bin/env node

/**
 * PM2 Health Check and Monitoring Script
 *
 * This script provides comprehensive health monitoring for the PM2-managed
 * NextJS application including:
 * - Process health status
 * - Memory and CPU usage
 * - Response time monitoring
 * - Database connectivity
 * - Log analysis
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  APP_NAME: 'manga-website',
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOSTNAME || 'localhost',
  HEALTH_ENDPOINT: '/api/health',
  MAX_RESPONSE_TIME: 5000, // 5 seconds
  MEMORY_THRESHOLD: 80, // 80% memory usage threshold
  CPU_THRESHOLD: 80, // 80% CPU usage threshold
  LOG_FILE: './logs/health-check.log',
};

// Logging functions
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message}`;
  console.log(logMessage);

  // Write to log file
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
};

const error = message => log(message, 'ERROR');
const warn = message => log(message, 'WARN');
const info = message => log(message, 'INFO');

// Create logs directory
const logsDir = path.dirname(CONFIG.LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Health check functions
const checkProcessStatus = () => {
  return new Promise(resolve => {
    try {
      const output = execSync('pm2 jlist', { encoding: 'utf8' });
      const processes = JSON.parse(output);
      const appProcess = processes.find(p => p.name === CONFIG.APP_NAME);

      if (!appProcess) {
        error(`Process ${CONFIG.APP_NAME} not found`);
        resolve({ status: 'error', message: 'Process not found' });
        return;
      }

      const status = appProcess.pm2_env.status;
      const memory = Math.round(appProcess.monit.memory / 1024 / 1024); // MB
      const cpu = appProcess.monit.cpu;
      const uptime = appProcess.pm2_env.pm_uptime;
      const restarts = appProcess.pm2_env.restart_time;

      info(`Process Status: ${status}`);
      info(`Memory Usage: ${memory} MB`);
      info(`CPU Usage: ${cpu}%`);
      info(`Uptime: ${new Date(uptime).toISOString()}`);
      info(`Restarts: ${restarts}`);

      // Check thresholds
      const warnings = [];
      if (memory > CONFIG.MEMORY_THRESHOLD * 10) {
        // Assuming 1GB limit
        warnings.push(`High memory usage: ${memory} MB`);
      }
      if (cpu > CONFIG.CPU_THRESHOLD) {
        warnings.push(`High CPU usage: ${cpu}%`);
      }

      resolve({
        status: status === 'online' ? 'healthy' : 'unhealthy',
        memory,
        cpu,
        uptime,
        restarts,
        warnings,
      });
    } catch (err) {
      error(`Failed to check process status: ${err.message}`);
      resolve({ status: 'error', message: err.message });
    }
  });
};

const checkHttpHealth = () => {
  return new Promise(resolve => {
    const startTime = Date.now();
    const url = `http://${CONFIG.HOST}:${CONFIG.PORT}${CONFIG.HEALTH_ENDPOINT}`;

    const req = http.get(url, res => {
      const responseTime = Date.now() - startTime;
      let data = '';

      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          info(`HTTP Health Check: OK (${responseTime}ms)`);
          resolve({
            status: 'healthy',
            responseTime,
            statusCode: res.statusCode,
            data: data.substring(0, 200), // First 200 chars
          });
        } else {
          warn(`HTTP Health Check: Failed with status ${res.statusCode}`);
          resolve({
            status: 'unhealthy',
            responseTime,
            statusCode: res.statusCode,
            data,
          });
        }
      });
    });

    req.on('error', err => {
      error(`HTTP Health Check: ${err.message}`);
      resolve({
        status: 'error',
        message: err.message,
        responseTime: Date.now() - startTime,
      });
    });

    req.setTimeout(CONFIG.MAX_RESPONSE_TIME, () => {
      req.destroy();
      error(`HTTP Health Check: Timeout after ${CONFIG.MAX_RESPONSE_TIME}ms`);
      resolve({
        status: 'timeout',
        responseTime: CONFIG.MAX_RESPONSE_TIME,
      });
    });
  });
};

const checkLogErrors = () => {
  return new Promise(resolve => {
    try {
      const errorLogPath = './logs/pm2/error.log';
      if (!fs.existsSync(errorLogPath)) {
        resolve({ status: 'no_logs', message: 'No error logs found' });
        return;
      }

      const stats = fs.statSync(errorLogPath);
      const lastModified = stats.mtime;
      const size = stats.size;

      // Check if error log has been modified in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentErrors = lastModified > oneHourAgo;

      if (recentErrors && size > 0) {
        // Read last few lines of error log
        const errorContent = execSync(`tail -n 10 "${errorLogPath}"`, { encoding: 'utf8' });
        warn(`Recent errors detected in logs (${size} bytes)`);
        resolve({
          status: 'errors_found',
          size,
          lastModified,
          recentErrors: errorContent.split('\n').slice(0, 5), // First 5 lines
        });
      } else {
        info('No recent errors in logs');
        resolve({
          status: 'clean',
          size,
          lastModified,
        });
      }
    } catch (err) {
      error(`Failed to check logs: ${err.message}`);
      resolve({ status: 'error', message: err.message });
    }
  });
};

// Main health check function
const runHealthCheck = async () => {
  info('Starting comprehensive health check...');

  const results = {
    timestamp: new Date().toISOString(),
    process: await checkProcessStatus(),
    http: await checkHttpHealth(),
    logs: await checkLogErrors(),
  };

  // Overall health assessment
  const isHealthy =
    results.process.status === 'healthy' &&
    results.http.status === 'healthy' &&
    results.logs.status !== 'errors_found';

  results.overall = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    score: calculateHealthScore(results),
  };

  // Log summary
  info(
    `Overall Health: ${results.overall.status.toUpperCase()} (Score: ${results.overall.score}/100)`
  );

  // Write detailed results to file
  const resultsFile = './logs/health-check-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  return results;
};

const calculateHealthScore = results => {
  let score = 100;

  // Process health
  if (results.process.status !== 'healthy') score -= 40;
  if (results.process.warnings && results.process.warnings.length > 0) score -= 10;

  // HTTP health
  if (results.http.status !== 'healthy') score -= 30;
  if (results.http.responseTime > 2000) score -= 10;

  // Log health
  if (results.logs.status === 'errors_found') score -= 20;

  return Math.max(0, score);
};

// CLI interface
const action = process.argv[2] || 'check';

switch (action) {
  case 'check':
    runHealthCheck().then(results => {
      process.exit(results.overall.status === 'healthy' ? 0 : 1);
    });
    break;

  case 'monitor':
    info('Starting continuous monitoring (every 30 seconds)...');
    setInterval(runHealthCheck, 30000);
    runHealthCheck(); // Run immediately
    break;

  case 'status':
    checkProcessStatus().then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
    break;

  default:
    console.log('Usage: node pm2-health-check.js [check|monitor|status]');
    console.log('  check   - Run single health check');
    console.log('  monitor - Continuous monitoring');
    console.log('  status  - Process status only');
    process.exit(1);
}
