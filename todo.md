# Todo List: Manga Reader Website

## Overview
This document outlines the tasks required to build a high-performance manga reader website similar to dokiraw.com using Next.js. The project will focus on fast page loading, maintainability, scalability, and SEO optimization.

## Phase 1: Project Setup and Environment Configuration
- [x] Research core Next.js concepts (Pages, Routing, SSR, SSG, ISR, API Routes)
- [x] Set up development environment (Node.js, npm/yarn/pnpm)
- [x] Initialize Next.js project using `create-next-app`
  - [x] Choose TypeScript for better type safety and maintainability
  - [x] Set up App Router (recommended) for newer features
- [x] Integrate Tailwind CSS for styling
- [x] Configure ESLint and Prettier for code quality
- [x] Using Shadcn UI.
- [x] Set up project structure:
  - [x] `/src/app/` - For routes using App Router
  - [x] `/src/components/` - For reusable components
  - [x] `/src/lib/` - For utility functions and configurations
  - [x] `/src/hooks/` - For custom React hooks
  - [x] `/public/` - For static assets

## Phase 2: Frontend Development
### Layout and Core Components
- [x] Design and implement main layouts
  - [x] Header with navigation and search bar
  - [x] Footer with site information and links
  - [x] Responsive sidebar (if needed)
- [x] Create reusable UI components:
  - [x] Comic Card component for displaying manga thumbnails
  - [x] Pagination component
  - [x] Filter and sorting components
  - [x] Search bar component
  - [x] Dark mode toggle

### Main Pages
- [x] Develop Home Page
  - [x] Featured manga section
  - [x] Latest updates section
  - [x] Popular manga section
  - [x] Genre in navbar
- [x] Implement Manga List Page
  - [x] Grid/list view of manga
  - [x] Filtering and sorting functionality
  - [x] Pagination
- [x] Create Manga Detail Page
  - [x] Manga information (title, cover, author, description, genres, status)
  - [x] Chapter list with search functionality
  - [x] Related/recommended manga
- [x] Build Manga Reader Page
  - [x] Image display with optimization
  - [x] Navigation between chapters
  - [x] Reading progress indicator
  - [x] Reading mode toggle (vertical scroll/page-by-page)
  - [x] Auxiliary buttons (display settings, brightness control)
- [x] Implement Search Page
  - [x] Search results display
  - [x] Advanced filtering options
- [x] Implement Genre Page
  - [x] Display manga of a specific genre
  - [x] Pagination
  - [x] Sorting options

### Responsive Design
- [x] Implement mobile-first approach
- [x] Create responsive layouts for all pages
- [x] Test on various device sizes and orientations

## Phase 3: Backend Development (API Routes)
- [x] Design database schema
  - [x] Please check [db.md](db.md)
- [x] Choose and set up database
  - [x] Options: PostgreSQL, MySQL, MongoDB, or Firebase/Supabase -> Use PostgreSQL. the database is 'manga-next', no pass.
- [x] Create API routes in Next.js:
  - [x] `/api/manga` - Get manga list with filtering and pagination
  - [x] `/api/manga/[slug]` - Get manga details
  - [x] `/api/manga/[slug]/chapters` - Get chapter list for a manga
  - [x] `/api/chapters/[id]` - Get chapter content (image paths)
  - [x] `/api/search` - Handle search queries
  - [ ] (Optional) User management, comments, bookmarks

For detailed backend implementation tasks and guides, refer to:
- [todo_backend.md](todo_backend.md) - Comprehensive backend task list

## Phase 4: Performance and SEO Optimization
### Performance
- [ ] Optimize image loading with `next/image`
- [ ] Implement lazy loading for components and images
- [ ] Utilize code splitting with dynamic imports
- [ ] Analyze and optimize bundle size with `@next/bundle-analyzer`
- [ ] Set up effective caching strategies
- [ ] Implement prefetching for faster navigation

### SEO
- [x] Configure metadata for all pages using `next/head` or Metadata API
- [x] Create dynamic sitemap.xml
- [x] Implement structured data (JSON-LD) for manga and chapters
- [x] Ensure SEO-friendly URLs
- [x] Optimize for Core Web Vitals

## Phase 5: Maintenance and Scalability
- [ ] Write clean, commented, and maintainable code
- [ ] Break down components for better reusability
- [ ] Implement TypeScript for better type safety
- [ ] Write unit and integration tests
- [ ] Plan for dependency updates
- [ ] Design for scalability (serverless functions, scalable database)

## Phase 6: Testing and Deployment
- [ ] Test thoroughly across browsers and devices
- [ ] Perform performance testing (Lighthouse, WebPageTest)
- [ ] Choose hosting/deployment provider (Vercel recommended for Next.js)
- [ ] Set up CI/CD pipeline
- [ ] Configure CDN if needed
- [ ] Implement monitoring and analytics (Sentry, Google Analytics)

## Phase 7: Documentation
- [ ] Document codebase with comments and README files
- [ ] Create user documentation if needed
- [ ] Write deployment and maintenance instructions

## Additional Features (Optional)
- [x] User authentication and profiles
- [x] Bookmark/favorite functionality
- [x] Reading history
- [x] Report error chapter
- [x] **Comments and ratings** ✨
  - [x] Comprehensive comment system with threaded replies
  - [x] Like/dislike functionality
  - [x] Comment reporting and moderation
  - [x] Admin moderation interface
  - [x] Real-time comment counts and pagination
  - [x] Spam detection and rate limiting
  - [x] Mobile-responsive comment interface
- [ ] Admin panel for content management
- [ ] Notifications for new chapters
- [ ] Progressive Web App (PWA) features

## Resources
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Vercel Deployment: https://vercel.com/docs
