# Next.js Core Concepts Research

## 1. Pages and Routing

### Pages Router (Traditional)

In the traditional Pages Router, Next.js uses a file-system based routing mechanism:

- Files in the `pages` directory automatically become routes
- `pages/index.js` → `/` (home page)
- `pages/about.js` → `/about`
- `pages/blog/[slug].js` → `/blog/:slug` (dynamic routes)

### App Router (Modern)

The newer App Router introduced in Next.js 13+ offers more advanced features:

- Uses the `app` directory instead of `pages`
- Supports nested layouts, loading states, and error boundaries
- Server Components by default
- Colocated routing files:
  - `page.js` - The UI for a route
  - `layout.js` - Shared UI for a segment and its children
  - `loading.js` - Loading UI
  - `error.js` - Error UI
  - `not-found.js` - Not found UI

### Dynamic Routes

Both routers support dynamic routes:

- Pages Router: `pages/posts/[id].js`
- App Router: `app/posts/[id]/page.js`

Dynamic segments are passed as parameters to the page component:

```jsx
// App Router
export default async function Page({ params }) {
  const { id } = await params
  return <div>Post: {id}</div>
}
```

### Linking and Navigation

Next.js provides the `Link` component for client-side navigation:

```jsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  )
}
```

For programmatic navigation, use the `useRouter` hook:

```jsx
'use client'
import { useRouter } from 'next/navigation' // or 'next/router' for Pages Router

export default function Page() {
  const router = useRouter()
  
  return (
    <button onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
}
```

## 2. Rendering Strategies

Next.js offers multiple rendering strategies to optimize performance and user experience:

### Server-Side Rendering (SSR)

- Pages are rendered on the server for each request
- Provides fresh data and SEO benefits
- Slower initial load compared to static pages

**App Router:**
```jsx
// Dynamic by default
export default async function Page() {
  // This data is fetched on each request
  const data = await fetch('https://api.example.com/data', { cache: 'no-store' })
  const posts = await data.json()
  
  return <PostList posts={posts} />
}
```

**Pages Router:**
```jsx
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data')
  const posts = await res.json()
  
  return {
    props: { posts }
  }
}
```

### Static Site Generation (SSG)

- Pages are pre-rendered at build time
- Very fast page loads
- Good for content that doesn't change frequently

**App Router:**
```jsx
export default async function Page() {
  // This data is cached and reused on each request (static by default)
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  
  return <PostList posts={posts} />
}
```

**Pages Router:**
```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const posts = await res.json()
  
  return {
    props: { posts }
  }
}
```

### Incremental Static Regeneration (ISR)

- Combines benefits of SSG and SSR
- Pages are generated statically but can be regenerated after a specified interval
- Allows static pages to update without rebuilding the entire site

**App Router:**
```jsx
export default async function Page() {
  // This data is cached for 60 seconds
  const data = await fetch('https://api.example.com/data', { 
    next: { revalidate: 60 } 
  })
  const posts = await data.json()
  
  return <PostList posts={posts} />
}
```

**Pages Router:**
```jsx
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const posts = await res.json()
  
  return {
    props: { posts },
    revalidate: 60 // Regenerate page every 60 seconds
  }
}
```

### On-demand Revalidation

Next.js allows triggering revalidation for specific pages or cache tags:

```jsx
// App Router
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function revalidateData() {
  // Revalidate a specific path
  revalidatePath('/blog')
  
  // Or revalidate by cache tag
  revalidateTag('blog-posts')
}
```

## 3. Data Fetching

### App Router Data Fetching

In the App Router, data fetching is built into components using async/await:

```jsx
// Server Component (default)
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  
  return <PostList posts={posts} />
}
```

Key features:
- Automatic request deduplication
- Data caching
- Parallel data fetching with `Promise.all`

### Pages Router Data Fetching

The Pages Router uses special functions:

- `getServerSideProps` - SSR
- `getStaticProps` - SSG
- `getStaticPaths` - Required for dynamic routes with SSG

### Server Actions (App Router)

Server Actions allow form submissions and data mutations directly from components:

```jsx
// Server Action defined in a separate file
'use server'
export async function createPost(formData) {
  // Process form data
  // Update database
  revalidatePath('/posts')
}

// Using in a component
export default function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## 4. API Routes

Next.js allows creating API endpoints within your application:

### Pages Router API Routes

```jsx
// pages/api/posts.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ posts: [] })
  } else if (req.method === 'POST') {
    // Create a new post
    res.status(201).json({ success: true })
  }
}
```

### App Router Route Handlers

```jsx
// app/api/posts/route.js
export async function GET() {
  return Response.json({ posts: [] })
}

export async function POST(request) {
  const data = await request.json()
  // Create a new post
  return new Response(null, { status: 201 })
}
```

## 5. Middleware

Middleware runs before a request is completed, allowing you to modify responses, redirect users, or add headers:

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check auth token
  const token = request.cookies.get('token')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

## 6. Advanced Features

### Image Optimization

Next.js includes an Image component that automatically optimizes images:

```jsx
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={500}
      height={300}
      priority // For LCP images
    />
  )
}
```

### Internationalization (i18n)

Next.js supports internationalized routing and content:

```jsx
// middleware.js
import { NextResponse } from 'next/server'

const locales = ['en', 'fr', 'de']

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return
  
  // Redirect to default locale
  const locale = 'en'
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}
```

### Authentication

Next.js can be integrated with various authentication solutions:

- Session-based auth with cookies
- JWT authentication
- OAuth providers
- Auth libraries like NextAuth.js/Auth.js

## Summary

Next.js provides a comprehensive framework for building modern web applications with features like:

- File-system based routing with two router implementations
- Multiple rendering strategies (SSR, SSG, ISR)
- Built-in API routes
- Middleware for request/response manipulation
- Image optimization
- Internationalization support
- Authentication capabilities

These core concepts form the foundation of Next.js development and enable building performant, SEO-friendly, and user-friendly web applications.
