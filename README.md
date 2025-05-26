# 🇻🇳 MangaNext - Trang Web Manga Hiện Đại

Một trang web manga được xây dựng với NextJS 15, cung cấp trải nghiệm đọc manga mượt mà với thiết kế hiện đại và tính năng đầy đủ.

## 📋 Tổng Quan Dự Án

MangaNext là một trang web manga toàn diện được phát triển bằng NextJS 15 với App Router, cung cấp:

- **Duyệt manga**: Khám phá thư viện manga phong phú với nhiều thể loại
- **Tìm kiếm nâng cao**: Tìm kiếm toàn văn với PostgreSQL và bộ lọc thông minh
- **Xác thực người dùng**: Đăng ký, đăng nhập với JWT và NextAuth.js
- **Đánh dấu trang**: Lưu manga yêu thích với đồng bộ hóa real-time
- **Hệ thống bình luận**: Bình luận theo chương với phân trang cursor-based
- **Thiết kế responsive**: Tối ưu cho cả desktop và mobile
- **ISR (Incremental Static Regeneration)**: Hiệu suất cao với caching thông minh

## 🛠️ Tech Stack

### Frontend
- **NextJS 15** - React framework với App Router
- **TypeScript** - Type safety và developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadcnUI** - Component library hiện đại
- **Framer Motion** - Animations và transitions
- **React Hook Form** - Form handling với validation

### Backend & Database
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database với full-text search
- **NextAuth.js** - Authentication solution
- **JWT** - Token-based authentication
- **Zod** - Schema validation

### DevOps & Deployment
- **Docker** - Containerization với multi-stage builds
- **Railway/Vercel** - Cloud deployment platforms
- **pnpm** - Fast, disk space efficient package manager
- **ESLint & Prettier** - Code quality và formatting

## ✨ Tính Năng Chính

### 🏠 Trang Chủ
- Hot manga slider với carousel tương tác
- Danh sách manga mới cập nhật
- Sidebar với manga đề xuất và thống kê
- SEO optimization với JSON-LD structured data

### 📚 Quản Lý Manga
- Danh sách manga với pagination và filtering
- Trang chi tiết manga với thông tin đầy đủ
- Đọc chapter với navigation mượt mà
- Theo dõi tiến độ đọc

### 🔍 Tìm Kiếm
- Tìm kiếm toàn văn với PostgreSQL
- Debounced search với loading states
- Bộ lọc theo thể loại, trạng thái, tác giả
- Highlight từ khóa trong kết quả

### 👤 Xác Thực & Hồ Sơ
- Đăng ký/đăng nhập với validation
- Quản lý hồ sơ người dùng
- Protected routes với middleware
- Session management với JWT

### ❤️ Đánh Dấu Trang
- Toggle favorite với optimistic UI
- Danh sách manga yêu thích
- Đồng bộ hóa real-time
- Responsive design cho mobile

### 💬 Hệ Thống Bình Luận
- Bình luận theo manga và chapter
- Cursor-based pagination
- Rate limiting và spam protection
- Moderation system với status approval

## 🚀 Hướng Dẫn Thiết Lập

### Điều Kiện Tiên Quyết
- **Node.js** 18.0.0 hoặc cao hơn
- **PostgreSQL** 13 hoặc cao hơn
- **pnpm** 8.0.0 hoặc cao hơn

### 1. Clone Repository
```bash
git clone <repository-url>
cd manga-fake
```

### 2. Cài Đặt Dependencies
```bash
# Cài đặt packages
pnpm install

# Generate Prisma client
npx prisma generate
```

### 3. Thiết Lập Database
```bash
# Tạo database PostgreSQL
createdb manga-next

# Chạy migrations
npx prisma migrate deploy

# (Tùy chọn) Seed data mẫu
pnpm seed
```

### 4. Cấu Hình Environment Variables
Tạo file `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/manga-next"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth-jwt-encryption"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"

# Optional
SEED_DATABASE="false"
```

### 5. Chạy Development Server
```bash
pnpm dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📡 API Documentation

### Manga Endpoints
- `GET /api/manga` - Danh sách manga với filtering và pagination
- `GET /api/manga/[slug]` - Chi tiết manga theo slug
- `GET /api/manga/[slug]/chapters` - Danh sách chapter của manga

### Authentication Endpoints
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `GET /api/users/me` - Thông tin user hiện tại

### Favorites Endpoints
- `GET /api/favorites` - Danh sách manga yêu thích
- `POST /api/favorites` - Toggle trạng thái favorite
- `GET /api/favorites/check` - Kiểm tra trạng thái favorite

### Comments Endpoints
- `GET /api/comments` - Danh sách bình luận với pagination
- `POST /api/comments` - Tạo bình luận mới
- `PUT /api/comments/[id]` - Cập nhật bình luận

### Search & Utility
- `GET /api/search` - Tìm kiếm manga
- `GET /api/genres` - Danh sách thể loại
- `GET /api/health` - Health check endpoint

## 🐳 Deployment

### Docker Deployment (Khuyến Nghị)
```bash
# Build Docker image
docker build -t manga-website .

# Run với environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/manga-next" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  manga-website
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set NEXTAUTH_SECRET="your-secret-key"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables trong Vercel dashboard:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

## 📁 Cấu Trúc Dự Án

```
manga-fake/
├── src/
│   ├── app/                    # NextJS 15 App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── manga/             # Manga pages
│   │   ├── profile/           # User profile pages
│   │   └── search/            # Search functionality
│   ├── components/            # React components
│   │   ├── ui/               # ShadcnUI components
│   │   ├── feature/          # Feature-specific components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API client và endpoints
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma client
│   │   └── utils/            # Helper functions
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema và migrations
├── public/                    # Static assets
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
└── package.json              # Dependencies và scripts
```

## 🔧 Scripts Hữu Ích

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format code với Prettier

# Database
npx prisma studio     # Open Prisma Studio
npx prisma generate   # Generate Prisma client
npx prisma migrate    # Run database migrations
npx prisma db push    # Push schema changes
pnpm seed            # Seed database với sample data

# Testing
pnpm test:revalidation # Test ISR revalidation
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 🆘 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra [Issues](../../issues) để xem vấn đề đã được báo cáo chưa
2. Tạo issue mới với mô tả chi tiết
3. Tham khảo documentation trong thư mục `docs/`

## 🙏 Acknowledgments

- [NextJS](https://nextjs.org/) - React framework
- [ShadcnUI](https://ui.shadcn.com/) - Component library
- [Prisma](https://prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication

---

**Được phát triển với ❤️ (love is Augment Code, Windsurf, ChatGPT, Gemini, Grok) bằng NextJS 15 và TypeScript**