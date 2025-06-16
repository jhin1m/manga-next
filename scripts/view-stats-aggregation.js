#!/usr/bin/env node
/**
 * View Statistics Aggregation Script
 *
 * This script can be run manually or scheduled via cron to update view statistics
 *
 * Usage:
 * node scripts/view-stats-aggregation.js [action] [options]
 *
 * Actions:
 * - full: Run complete aggregation (default)
 * - comics: Update only comics view statistics
 * - chapters: Update only chapters view statistics
 * - snapshots: Store daily snapshots only
 * - cleanup: Clean up old view statistics data
 *
 * Options:
 * --days-to-keep=<number>: Days to keep for cleanup (default: 90)
 * --help: Show this help message
 *
 * Examples:
 * node scripts/view-stats-aggregation.js
 * node scripts/view-stats-aggregation.js comics
 * node scripts/view-stats-aggregation.js cleanup --days-to-keep=60
 */

const {
  runViewStatsAggregation,
  updateAllComicsViewStats,
  updateAllChaptersViewStats,
  storeDailySnapshots,
  cleanupOldViewStats,
} = require('../.next/server/chunks/ssr/src_lib_jobs_viewStatsAggregator_ts.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const action = args[0] || 'full';
const options = {};

// Parse options
args.forEach(arg => {
  if (arg.startsWith('--days-to-keep=')) {
    options.daysToKeep = parseInt(arg.split('=')[1]);
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
});

function showHelp() {
  console.log(`
View Statistics Aggregation Script

Usage:
  node scripts/view-stats-aggregation.js [action] [options]

Actions:
  full        Run complete aggregation (comics + chapters + snapshots) [default]
  comics      Update view statistics for all comics
  chapters    Update view statistics for all chapters
  snapshots   Store daily view snapshots
  cleanup     Clean up old view statistics data

Options:
  --days-to-keep=<number>    Days to keep for cleanup (default: 90)
  --help, -h                 Show this help message

Examples:
  node scripts/view-stats-aggregation.js
  node scripts/view-stats-aggregation.js comics
  node scripts/view-stats-aggregation.js cleanup --days-to-keep=60

Recommended Cron Schedule:
  # Full aggregation every 6 hours
  0 */6 * * * cd /path/to/project && node scripts/view-stats-aggregation.js full

  # Daily snapshots at midnight
  0 0 * * * cd /path/to/project && node scripts/view-stats-aggregation.js snapshots

  # Weekly cleanup on Sundays at 2 AM
  0 2 * * 0 cd /path/to/project && node scripts/view-stats-aggregation.js cleanup
  `);
}

async function main() {
  console.log('🚀 View Statistics Aggregation Script');
  console.log('=====================================');
  console.log(`Action: ${action}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  try {
    let result;

    switch (action) {
      case 'comics':
        console.log('📊 Updating comics view statistics...');
        result = await updateAllComicsViewStats();
        break;

      case 'chapters':
        console.log('📖 Updating chapters view statistics...');
        result = await updateAllChaptersViewStats();
        break;

      case 'snapshots':
        console.log('📸 Storing daily view snapshots...');
        result = await storeDailySnapshots();
        break;

      case 'cleanup':
        const daysToKeep = options.daysToKeep || 90;
        console.log(`🧹 Cleaning up view statistics older than ${daysToKeep} days...`);
        result = await cleanupOldViewStats(daysToKeep);
        break;

      case 'full':
      default:
        console.log('🔄 Running complete view statistics aggregation...');
        result = await runViewStatsAggregation();
        break;
    }

    // Display results
    console.log('');
    console.log('📋 Results:');
    console.log('===========');
    console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Message: ${result.message}`);
    console.log(
      `Processed: ${result.processed.comics} comics, ${result.processed.chapters} chapters`
    );

    if (result.errors && result.errors.length > 0) {
      console.log('');
      console.log('⚠️  Errors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log('');
    console.log('✨ Script completed');

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('');
    console.error('💥 Script failed with error:');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error('💥 Main function failed:', error);
  process.exit(1);
});
