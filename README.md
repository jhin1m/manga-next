# Manga Reader

A modern, responsive, and feature-rich manga reading web application built with Next.js 15, React 19, and TypeScript.

## ✨ Features

- 🚀 **Modern Stack**: Built with Next.js 15 (App Router), React 19, and TypeScript
- 🎨 **Beautiful UI**: Clean and responsive design with Shadcn UI and Tailwind CSS
- 📱 **Mobile-First**: Fully responsive layout that works on all devices
- 🔍 **Advanced Search**: Powerful search functionality with filters and sorting
- 📚 **Manga Library**: Browse and read thousands of manga titles
- 🔖 **Reading History**: Track your reading progress
- ⚡ **Performance Optimized**: Fast page loads and smooth scrolling
- 🌓 **Dark Mode**: Built-in dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **UI Components**: Radix UI Primitives
- **Linting/Formatting**: ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/manga-reader.git
   cd manga-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   DATABASE_URL="your_database_url_here"
   NEXTAUTH_SECRET="your_nextauth_secret_here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                    # App Router pages and layouts
├── components/             # Reusable UI components
│   ├── feature/           # Feature-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Shadcn UI components
├── lib/                    # Utility functions and configurations
├── public/                 # Static files
└── styles/                 # Global styles
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## 🚀 Triển khai lên môi trường Production

Ứng dụng Next.js có thể được triển khai theo nhiều cách khác nhau. Dưới đây là các phương pháp triển khai chi tiết:

### 1. Triển khai trên Vercel (Khuyến nghị)

[Vercel](https://vercel.com) là nền tảng triển khai từ đội ngũ phát triển Next.js, cung cấp trải nghiệm triển khai tốt nhất cho ứng dụng Next.js với zero-config.

1. Tạo tài khoản [Vercel](https://vercel.com/signup)
2. Kết nối repository GitHub của bạn
3. Nhấp vào "Import" và chọn repository manga-reader
4. Thêm các biến môi trường cần thiết:
   - `DATABASE_URL`: URL kết nối đến database production
   - `NEXTAUTH_SECRET`: Secret key cho NextAuth
   - `NEXTAUTH_URL`: URL của trang web production (ví dụ: https://your-domain.com)
5. Nhấp vào "Deploy"

Vercel sẽ tự động cài đặt dependencies, build ứng dụng và triển khai nó. Mỗi khi bạn push code mới lên repository, Vercel sẽ tự động triển khai lại.

### 2. Triển khai với Node.js Server

Nếu bạn muốn triển khai ứng dụng lên server riêng:

1. Build ứng dụng:
   ```bash
   npm run build
   ```

2. Khởi chạy server production:
   ```bash
   npm run start
   ```

   Server sẽ chạy mặc định trên cổng 3000. Bạn có thể thay đổi cổng bằng cách thiết lập biến môi trường PORT:
   ```bash
   PORT=8080 npm run start
   ```

3. Sử dụng Process Manager như [PM2](https://pm2.keymetrics.io/) để đảm bảo ứng dụng luôn hoạt động:
   ```bash
   # Cài đặt PM2
   npm install -g pm2
   
   # Khởi chạy ứng dụng với PM2
   pm2 start npm --name "manga-reader" -- start
   
   # Đảm bảo ứng dụng khởi động lại khi server reboot
   pm2 startup
   pm2 save
   ```

4. Cấu hình Nginx như reverse proxy (ví dụ):
   ```nginx
   server {
     listen 80;
     server_name your-domain.com www.your-domain.com;
   
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

### 3. Triển khai với Docker

1. Tạo file `Dockerfile` trong thư mục gốc của dự án:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Next.js collects anonymous telemetry data. Opt-out if you don't want to share
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   
   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next
   
   # Automatically leverage output traces to reduce image size
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. Tạo `.dockerignore` để loại trừ các file không cần thiết:
   ```
   node_modules
   .next
   .git
   ```

3. Thêm cấu hình standalone vào `next.config.js`:
   ```js
   module.exports = {
     output: 'standalone',
     // ...các cấu hình khác
   };
   ```

4. Build và chạy Docker image:
   ```bash
   # Build image
   docker build -t manga-reader .
   
   # Chạy container
   docker run -p 3000:3000 -e DATABASE_URL=your_db_url -e NEXTAUTH_SECRET=your_secret manga-reader
   ```

### 4. Thiết lập Biến Môi Trường cho Production

Đối với môi trường production, tạo file `.env.production` với các biến cụ thể cho production:

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

Lưu ý: Không commit các file .env chứa thông tin nhạy cảm. Thay vào đó, thiết lập các biến môi trường trực tiếp trong môi trường hosting của bạn.

### 5. Tối ưu hóa cho Production

1. **Caching và CDN**:
   - Cấu hình [ISR (Incremental Static Regeneration)](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating) trong các Route Handler
   - Sử dụng CDN như Cloudflare để cache các tài nguyên tĩnh

2. **Monitoring**:
   - Cấu hình [Sentry](https://sentry.io) để theo dõi lỗi
   - Sử dụng [Vercel Analytics](https://vercel.com/analytics) cho Web Vitals

3. **Bảo mật**:
   - Cài đặt headers bảo mật trong `next.config.js`:
     ```js
     module.exports = {
       headers: async () => {
         return [
           {
             source: '/(.*)',
             headers: [
               {
                 key: 'X-Content-Type-Options',
                 value: 'nosniff',
               },
               {
                 key: 'X-XSS-Protection',
                 value: '1; mode=block',
               },
               {
                 key: 'X-Frame-Options',
                 value: 'DENY',
               },
             ],
           },
         ];
       },
     };
     ```

### 6. Quản lý Database trong Production

Khi sử dụng Prisma:

1. Đảm bảo chạy migrations trước khi triển khai:
   ```bash
   npx prisma migrate deploy
   ```

2. Cấu hình Connection Pooling nếu cần thiết (với [Prisma Data Proxy](https://www.prisma.io/data-platform/proxy) hoặc PgBouncer)

3. Thiết lập backup tự động cho database

Xem thêm thông tin chi tiết trong [tài liệu triển khai Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
