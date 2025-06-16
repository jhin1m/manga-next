# Foreign Key Constraint Fix - P2003 Error Resolution

## Problem Description

The manga crawler system was experiencing a Prisma P2003 foreign key constraint violation error when trying to create `Comic_Genres` relationship records. The error occurred at line 141 in `src/lib/crawler/processors/manga.ts` where `prisma.comic_Genres.create()` was called.

### Root Cause

The issue was caused by a **transaction scope problem**:

1. The `Comic` record was being created within a Prisma transaction using the transaction client (`tx`)
2. However, the `processGenres` function was using the global `prisma` instance instead of the transaction client
3. This meant that when `Comic_Genres.create()` was called, it couldn't see the uncommitted `Comic` record that existed only within the transaction scope
4. This resulted in a foreign key constraint violation because the `comic_id` being referenced didn't exist from the perspective of the global prisma client

## Solution Implemented

### 1. Updated Transaction Flow

**Before (Problematic):**

```typescript
const comic = await prisma.$transaction(async (tx) => {
  const comic = await tx.comics.upsert({...});

  // ❌ Using global prisma instance - can't see uncommitted comic
  await this.processGenres(comic.id, manga.genres);

  return comic;
});
```

**After (Fixed):**

```typescript
const comic = await prisma.$transaction(async (tx) => {
  const comic = await tx.comics.upsert({...});

  // ✅ Passing transaction client - can see uncommitted comic
  await this.processGenres(tx, comic.id, manga.genres);

  return comic;
});
```

### 2. Updated Function Signature

**Before:**

```typescript
private async processGenres(
  comicId: number,
  genres: { sourceId: number | string; name: string; slug: string }[]
): Promise<void>
```

**After:**

```typescript
private async processGenres(
  tx: Prisma.TransactionClient,
  comicId: number,
  genres: { sourceId: number | string; name: string; slug: string }[]
): Promise<void>
```

### 3. Updated Database Operations

All database operations within `processGenres` now use the transaction client:

**Before:**

```typescript
await prisma.comic_Genres.deleteMany({...});
await prisma.genres.upsert({...});
await prisma.comic_Genres.create({...});
```

**After:**

```typescript
await tx.comic_Genres.deleteMany({...});
await tx.genres.upsert({...});
await tx.comic_Genres.create({...});
```

## Additional Improvements

### 1. Enhanced Error Handling

- Added specific P2003 error detection and logging
- Added parameter validation for `processGenres`
- Added detailed error messages for debugging

### 2. Better Logging

- Added success logging for manga processing
- Added genre validation warnings
- Added detailed error context for troubleshooting

### 3. Type Safety

- Added proper TypeScript typing with `Prisma.TransactionClient`
- Imported `Prisma` type from `@prisma/client`

## Files Modified

1. **`src/lib/crawler/processors/manga.ts`**
   - Updated transaction flow to pass transaction client
   - Modified `processGenres` function signature
   - Added proper TypeScript typing
   - Enhanced error handling and logging

## Testing

Created a comprehensive test script (`src/scripts/test-manga-processor.ts`) that verifies:

1. ✅ Comic creation with genres
2. ✅ Genre creation and linking
3. ✅ Update scenarios (upsert operations)
4. ✅ Data integrity verification
5. ✅ Cleanup operations

### Test Results

```
🧪 Testing MangaProcessor Foreign Key Fix
==========================================
📝 Test 1: Processing manga with genres...
✅ Successfully created comic with ID: 51
📝 Test 2: Verifying comic was created...
✅ Comic found: Test Manga for Foreign Key Fix
✅ Genres associated: 3
📝 Test 3: Verifying genres were created and linked...
✅ All genres were correctly created and linked
📝 Test 4: Testing update scenario...
✅ Update scenario completed successfully
📝 Test 5: Verifying updated genres...
✅ Updated comic has 4 genres
✅ Genre update completed successfully

🎉 All tests passed! Foreign key constraint issue has been fixed.
```

## Impact

- ✅ **Fixed P2003 foreign key constraint violations**
- ✅ **Improved transaction consistency**
- ✅ **Enhanced error handling and debugging**
- ✅ **Better type safety**
- ✅ **Maintained backward compatibility**

## Prevention

To prevent similar issues in the future:

1. **Always use transaction clients** when performing related operations within a transaction
2. **Pass transaction context** to all functions that perform database operations within a transaction
3. **Add comprehensive testing** for transaction-based operations
4. **Use proper TypeScript typing** for transaction clients

## Usage

The crawler can now be used safely without foreign key constraint errors:

```bash
# Run crawler
npx ts-node scripts/crawl.ts mangaraw 1 5

# Test the fix
node -r ts-node/register src/scripts/test-manga-processor.ts
```
