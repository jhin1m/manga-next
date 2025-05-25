#!/usr/bin/env ts-node
/**
 * Test script để kiểm tra MangaProcessor sau khi fix foreign key constraint issue
 *
 * Cách sử dụng:
 * npx ts-node src/scripts/test-manga-processor.ts
 */

const { PrismaClient } = require('@prisma/client');
const { MangaProcessor } = require('../lib/crawler/processors/manga');
const dotenvTest = require('dotenv');

// Load biến môi trường
dotenvTest.config();

const prisma = new PrismaClient();

// Test data
const testManga = {
  sourceId: 'test-manga-001',
  title: 'Test Manga for Foreign Key Fix',
  slug: 'test-manga-foreign-key-fix',
  alternativeTitles: ['Test Manga Alt'],
  description: 'This is a test manga to verify the foreign key constraint fix.',
  coverUrl: 'https://example.com/test-cover.jpg',
  status: 'ongoing',
  views: 1000,
  createdAt: new Date(),
  genres: [
    {
      sourceId: 'test-genre-1',
      name: 'Test Action',
      slug: 'test-action'
    },
    {
      sourceId: 'test-genre-2',
      name: 'Test Adventure',
      slug: 'test-adventure'
    },
    {
      sourceId: 'test-genre-3',
      name: 'Test Comedy',
      slug: 'test-comedy'
    }
  ]
};

async function testMangaProcessor() {
  console.log('🧪 Testing MangaProcessor Foreign Key Fix');
  console.log('==========================================');

  const processor = new MangaProcessor();

  try {
    // Test 1: Process manga with genres
    console.log('📝 Test 1: Processing manga with genres...');
    const comicId = await processor.process(testManga, {
      useOriginalImages: true,
      skipExisting: false
    });

    console.log(`✅ Successfully created comic with ID: ${comicId}`);

    // Test 2: Verify comic was created
    console.log('📝 Test 2: Verifying comic was created...');
    const comic = await prisma.comics.findUnique({
      where: { id: comicId },
      include: {
        Comic_Genres: {
          include: {
            Genres: true
          }
        }
      }
    });

    if (!comic) {
      throw new Error('Comic not found in database');
    }

    console.log(`✅ Comic found: ${comic.title}`);
    console.log(`✅ Genres associated: ${comic.Comic_Genres.length}`);

    // Test 3: Verify genres were created and linked
    console.log('📝 Test 3: Verifying genres were created and linked...');
    for (const comicGenre of comic.Comic_Genres) {
      console.log(`   - Genre: ${comicGenre.Genres.name} (${comicGenre.Genres.slug})`);
    }

    if (comic.Comic_Genres.length !== testManga.genres!.length) {
      throw new Error(`Expected ${testManga.genres!.length} genres, but found ${comic.Comic_Genres.length}`);
    }

    console.log('✅ All genres were correctly created and linked');

    // Test 4: Test update scenario (upsert)
    console.log('📝 Test 4: Testing update scenario...');
    const updatedManga = {
      ...testManga,
      description: 'Updated description for foreign key test',
      genres: [
        ...testManga.genres!,
        {
          sourceId: 'test-genre-4',
          name: 'Test Drama',
          slug: 'test-drama'
        }
      ]
    };

    const updatedComicId = await processor.process(updatedManga, {
      useOriginalImages: true,
      skipExisting: false
    });

    if (updatedComicId !== comicId) {
      throw new Error('Comic ID should remain the same for upsert operation');
    }

    console.log('✅ Update scenario completed successfully');

    // Test 5: Verify updated genres
    console.log('📝 Test 5: Verifying updated genres...');
    const updatedComic = await prisma.comics.findUnique({
      where: { id: comicId },
      include: {
        Comic_Genres: {
          include: {
            Genres: true
          }
        }
      }
    });

    if (!updatedComic) {
      throw new Error('Updated comic not found');
    }

    console.log(`✅ Updated comic has ${updatedComic.Comic_Genres.length} genres`);

    if (updatedComic.Comic_Genres.length !== updatedManga.genres!.length) {
      throw new Error(`Expected ${updatedManga.genres!.length} genres after update, but found ${updatedComic.Comic_Genres.length}`);
    }

    console.log('✅ Genre update completed successfully');

    // Cleanup
    console.log('📝 Cleaning up test data...');
    await prisma.comic_Genres.deleteMany({
      where: { comic_id: comicId }
    });

    await prisma.comics.delete({
      where: { id: comicId }
    });

    // Clean up test genres (only if they're not used by other comics)
    for (const genre of updatedManga.genres!) {
      const genreUsage = await prisma.comic_Genres.count({
        where: {
          Genres: {
            slug: genre.slug
          }
        }
      });

      if (genreUsage === 0) {
        await prisma.genres.deleteMany({
          where: { slug: genre.slug }
        });
      }
    }

    console.log('✅ Cleanup completed');

    console.log('\n🎉 All tests passed! Foreign key constraint issue has been fixed.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);

    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      if (error.message.includes('P2003')) {
        console.error('\n🚨 P2003 Foreign key constraint violation still exists!');
        console.error('The fix may not be working correctly.');
      }
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMangaProcessor()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
