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
  - [ ] Filter and sorting components
  - [ ] Search bar component
  - [x] Dark mode toggle

### Main Pages
- [ ] Develop Home Page
  - [ ] Featured manga section
  - [ ] Latest updates section
  - [ ] Popular manga section
  - [ ] Genre-based sections
- [ ] Implement Manga List Page
  - [ ] Grid/list view of manga
  - [ ] Filtering and sorting functionality
  - [ ] Pagination
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
- [ ] Implement Search Page
  - [ ] Search results display
  - [ ] Advanced filtering options

### Responsive Design
- [ ] Implement mobile-first approach
- [ ] Create responsive layouts for all pages
- [ ] Test on various device sizes and orientations

## Phase 3: Backend Development (API Routes)
- [ ] Design database schema
  - [ ] Manga model (title, cover, author, description, genres, status)
  - [ ] Chapter model (number, title, images, manga reference)
  - [ ] User model (if implementing user features)
- [ ] Choose and set up database
  - [ ] Options: PostgreSQL, MySQL, MongoDB, or Firebase/Supabase
- [ ] Create API routes in Next.js:
  - [ ] `/api/manga` - Get manga list with filtering and pagination
  - [ ] `/api/manga/[slug]` - Get manga details
  - [ ] `/api/manga/[slug]/chapters` - Get chapter list for a manga
  - [ ] `/api/chapters/[id]` - Get chapter content (image paths)
  - [ ] `/api/search` - Handle search queries
  - [ ] (Optional) User management, comments, bookmarks

## Phase 4: Performance and SEO Optimization
### Performance
- [ ] Optimize image loading with `next/image`
- [ ] Implement lazy loading for components and images
- [ ] Utilize code splitting with dynamic imports
- [ ] Analyze and optimize bundle size with `@next/bundle-analyzer`
- [ ] Set up effective caching strategies
- [ ] Implement prefetching for faster navigation

### SEO
- [ ] Configure metadata for all pages using `next/head` or Metadata API
- [ ] Create dynamic sitemap.xml
- [ ] Implement structured data (JSON-LD) for manga and chapters
- [ ] Ensure SEO-friendly URLs
- [ ] Optimize for Core Web Vitals

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
- [ ] User authentication and profiles
- [ ] Bookmark/favorite functionality
- [ ] Reading history
- [ ] Comments and ratings
- [ ] Admin panel for content management
- [ ] Notifications for new chapters
- [ ] Progressive Web App (PWA) features

## Resources
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Vercel Deployment: https://vercel.com/docs
