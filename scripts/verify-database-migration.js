#!/usr/bin/env node
/**
 * Database Migration Verification Script
 * 
 * This script verifies that the view statistics migration was applied correctly
 * 
 * Usage:
 * node scripts/verify-database-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function verifyComicsTable() {
  console.log('🔍 Verifying Comics table...');
  
  try {
    // Try to select the new columns
    const result = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'Comics' 
        AND column_name IN ('daily_views', 'weekly_views', 'monthly_views')
      ORDER BY column_name;
    `;
    
    console.log('✅ Comics table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });
    
    // Test inserting/updating a record
    const testComic = await prisma.comics.findFirst();
    if (testComic) {
      await prisma.comics.update({
        where: { id: testComic.id },
        data: {
          daily_views: 100,
          weekly_views: 500,
          monthly_views: 2000
        }
      });
      console.log(`✅ Successfully updated comic ${testComic.id} with test view statistics`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Comics table verification failed:', error.message);
    return false;
  }
}

async function verifyChaptersTable() {
  console.log('\n🔍 Verifying Chapters table...');
  
  try {
    // Try to select the new columns
    const result = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'Chapters' 
        AND column_name IN ('daily_views', 'weekly_views', 'monthly_views')
      ORDER BY column_name;
    `;
    
    console.log('✅ Chapters table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });
    
    // Test inserting/updating a record
    const testChapter = await prisma.chapters.findFirst();
    if (testChapter) {
      await prisma.chapters.update({
        where: { id: testChapter.id },
        data: {
          daily_views: 50,
          weekly_views: 300,
          monthly_views: 1200
        }
      });
      console.log(`✅ Successfully updated chapter ${testChapter.id} with test view statistics`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Chapters table verification failed:', error.message);
    return false;
  }
}

async function verifyViewStatisticsTable() {
  console.log('\n🔍 Verifying View_Statistics table...');
  
  try {
    // Check if table exists and has correct structure
    const result = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'View_Statistics'
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ View_Statistics table structure:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test inserting a record
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    await prisma.view_Statistics.create({
      data: {
        entity_type: 'comic',
        entity_id: 1,
        date: today,
        daily_views: 150,
        weekly_views: 1000,
        monthly_views: 4500
      }
    });
    
    console.log('✅ Successfully created test View_Statistics record');
    
    // Verify unique constraint works
    try {
      await prisma.view_Statistics.create({
        data: {
          entity_type: 'comic',
          entity_id: 1,
          date: today,
          daily_views: 200,
          weekly_views: 1200,
          monthly_views: 5000
        }
      });
      console.log('❌ Unique constraint not working - duplicate record created');
      return false;
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✅ Unique constraint working correctly');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ View_Statistics table verification failed:', error.message);
    return false;
  }
}

async function verifyIndexes() {
  console.log('\n🔍 Verifying database indexes...');
  
  try {
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('Comics', 'Chapters', 'View_Statistics', 'Comic_Views', 'Chapter_Views')
        AND indexname LIKE '%view%'
      ORDER BY tablename, indexname;
    `;
    
    console.log('✅ View-related indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Index verification failed:', error.message);
    return false;
  }
}

async function testViewStatisticsQueries() {
  console.log('\n🔍 Testing view statistics queries...');
  
  try {
    // Test querying comics with view statistics
    const comics = await prisma.comics.findMany({
      select: {
        id: true,
        title: true,
        daily_views: true,
        weekly_views: true,
        monthly_views: true,
        total_views: true
      },
      take: 3
    });
    
    console.log('✅ Comics with view statistics:');
    comics.forEach(comic => {
      console.log(`  - ${comic.title}: ${comic.daily_views}d/${comic.weekly_views}w/${comic.monthly_views}m (total: ${comic.total_views})`);
    });
    
    // Test querying chapters with view statistics
    const chapters = await prisma.chapters.findMany({
      select: {
        id: true,
        title: true,
        daily_views: true,
        weekly_views: true,
        monthly_views: true,
        view_count: true
      },
      take: 3
    });
    
    console.log('✅ Chapters with view statistics:');
    chapters.forEach(chapter => {
      console.log(`  - ${chapter.title || 'Chapter ' + chapter.id}: ${chapter.daily_views}d/${chapter.weekly_views}w/${chapter.monthly_views}m (total: ${chapter.view_count})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Query testing failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Migration Verification');
  console.log('===================================');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    const results = await Promise.all([
      verifyComicsTable(),
      verifyChaptersTable(),
      verifyViewStatisticsTable(),
      verifyIndexes(),
      testViewStatisticsQueries()
    ]);
    
    const allPassed = results.every(result => result === true);
    
    console.log('\n📋 Verification Summary:');
    console.log('========================');
    console.log(`Comics table: ${results[0] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Chapters table: ${results[1] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`View_Statistics table: ${results[2] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Database indexes: ${results[3] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Query testing: ${results[4] ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
    
    if (allPassed) {
      console.log('🎉 All verification tests passed!');
      console.log('✅ Database migration was successful');
      console.log('✅ View statistics columns are ready');
      console.log('✅ Manga rankings system can now access the data');
    } else {
      console.log('❌ Some verification tests failed');
      console.log('Please check the errors above and fix any issues');
    }
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
  process.exit(1);
});

// Run the verification
main().catch(async (error) => {
  console.error('💥 Main function failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
