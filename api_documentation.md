# API Documentation

This document provides detailed information about the API endpoints available in the manga website.

## Manga Endpoints

### GET /api/manga

Get a paginated list of manga with optional filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (optional)
- `genre`: Filter by genre slug (optional)
- `sort`: Sort order ('latest', 'popular', 'alphabetical') (default: 'latest')

**Response:**
```json
{
  "comics": [
    {
      "id": 1,
      "title": "One Piece",
      "slug": "one-piece",
      "cover_image_url": "https://example.com/one-piece.jpg",
      "status": "ongoing",
      "Comic_Genres": [
        {
          "genre": {
            "id": 1,
            "name": "Action",
            "slug": "action"
          }
        }
      ]
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "totalComics": 200
}
```

### GET /api/manga/[slug]

Get detailed information about a specific manga.

**Path Parameters:**
- `slug`: The unique slug of the manga

**Response:**
```json
{
  "manga": {
    "id": 1,
    "title": "One Piece",
    "slug": "one-piece",
    "description": "The story follows the adventures of Monkey D. Luffy...",
    "cover_image_url": "https://example.com/one-piece.jpg",
    "status": "ongoing",
    "Comic_Genres": [
      {
        "genre": {
          "id": 1,
          "name": "Action",
          "slug": "action"
        }
      }
    ],
    "Comic_Authors": [
      {
        "author": {
          "id": 1,
          "name": "Eiichiro Oda",
          "slug": "eiichiro-oda"
        }
      }
    ],
    "Comic_Publishers": [
      {
        "publisher": {
          "id": 1,
          "name": "Shueisha",
          "slug": "shueisha"
        }
      }
    ]
  }
}
```

### GET /api/manga/[slug]/chapters

Get a paginated list of chapters for a specific manga.

**Path Parameters:**
- `slug`: The unique slug of the manga

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "chapters": [
    {
      "id": 1,
      "comic_id": 1,
      "chapter_number": "1",
      "title": "Romance Dawn",
      "slug": "chapter-1",
      "release_date": "2023-01-01T00:00:00.000Z",
      "view_count": 1000
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalChapters": 250
}
```

## Chapter Endpoints

### GET /api/chapters/[id]

Get chapter content including all pages and navigation information.

**Path Parameters:**
- `id`: The unique ID of the chapter

**Response:**
```json
{
  "chapter": {
    "id": 1,
    "comic_id": 1,
    "chapter_number": "1",
    "title": "Romance Dawn",
    "slug": "chapter-1",
    "release_date": "2023-01-01T00:00:00.000Z",
    "view_count": 1001,
    "Pages": [
      {
        "id": 1,
        "chapter_id": 1,
        "page_number": 1,
        "image_url": "https://example.com/chapter-1/page-1.jpg"
      }
    ],
    "comic": {
      "id": 1,
      "title": "One Piece",
      "slug": "one-piece"
    }
  },
  "prevChapter": null,
  "nextChapter": {
    "id": 2,
    "chapter_number": "2"
  }
}
```

## Search Endpoint

### GET /api/search

Search for manga by title or description with optional filtering.

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `genre`: Filter by genre slug (optional)
- `status`: Filter by status (optional)

**Response:**
```json
{
  "comics": [
    {
      "id": 1,
      "title": "One Piece",
      "slug": "one-piece",
      "cover_image_url": "https://example.com/one-piece.jpg",
      "status": "ongoing",
      "Comic_Genres": [
        {
          "genre": {
            "id": 1,
            "name": "Action",
            "slug": "action"
          }
        }
      ]
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "totalComics": 1
}
```

## Error Responses

All endpoints return the following error format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
