# Workflow Kỹ thuật: Trang Chủ (Homepage) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai tính năng Trang Chủ (Homepage) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Trang chủ thường hiển thị các danh sách truyện nổi bật, mới cập nhật, và các khối nội dung khác để thu hút người dùng.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Định nghĩa Route và Layout cho Trang Chủ

1.  **Tạo Page Route**: Trong App Router của Next.js (khuyến nghị), trang chủ thường được định nghĩa bởi file `src/app/page.tsx` (hoặc `src/app/(main)/page.tsx` nếu sử dụng route group cho layout chung).
    *   Nếu sử dụng Pages Router, đây sẽ là `src/pages/index.tsx`.
2.  **Thiết lập Layout Chung**: Trang chủ sẽ kế thừa layout chung của website (ví dụ: `src/app/layout.tsx` hoặc `src/app/(main)/layout.tsx` trong App Router) bao gồm Header, Footer, và các thành phần điều hướng chung.

### Bước 2.2: Fetch Dữ liệu cho các Khối Nội dung

Trang chủ thường yêu cầu nhiều loại dữ liệu (truyện mới, thịnh hành, theo thể loại). Sử dụng Server Components trong App Router để fetch dữ liệu hiệu quả.

1.  **Xác định Nguồn Dữ liệu**: API backend hoặc cơ sở dữ liệu trực tiếp (nếu API routes được xây dựng trong cùng dự án Next.js).
2.  **Fetch Dữ liệu cho "Truyện Mới Cập Nhật"**:
    *   Tạo một hàm `async` (ví dụ: `getLatestUpdatedComics()`) để gọi API lấy danh sách truyện được sắp xếp theo ngày cập nhật mới nhất, có giới hạn số lượng (ví dụ: 10-20 truyện).
    *   Sử dụng `fetch` với tùy chọn `next: { revalidate: <thời_gian_giây> }` để kích hoạt Incremental Static Regeneration (ISR), giúp dữ liệu được cập nhật định kỳ mà không cần build lại toàn bộ trang.
    ```typescript
    // Ví dụ trong src/app/page.tsx (Server Component)
    async function getLatestUpdatedComics() {
      const res = await fetch("https://your-api.com/comics?sort=updated_at&limit=10", {
        next: { revalidate: 3600 }, // Revalidate mỗi giờ
      });
      if (!res.ok) throw new Error("Failed to fetch latest comics");
      return res.json();
    }
    ```
3.  **Fetch Dữ liệu cho "Truyện Thịnh Hành"**:
    *   Tương tự, tạo hàm `async` (ví dụ: `getTrendingComics()`) để lấy danh sách truyện dựa trên lượt xem, lượt yêu thích hoặc một tiêu chí thịnh hành khác.
    *   Áp dụng ISR nếu cần.
4.  **Fetch Dữ liệu cho "Truyện Đánh Giá Cao"**:
    *   Tạo hàm `async` (ví dụ: `getTopRatedComics()`) để lấy danh sách truyện dựa trên điểm đánh giá trung bình.
    *   Áp dụng ISR.
5.  **Fetch Dữ liệu cho các Khối Theo Thể Loại (nếu có)**:
    *   Nếu trang chủ có các khối truyện theo thể loại cụ thể (ví dụ: "Truyện Hành Động Mới"), fetch dữ liệu tương ứng.

### Bước 2.3: Xây dựng Components cho các Khối Nội dung

Chia nhỏ giao diện trang chủ thành các component có thể tái sử dụng.

1.  **Component `ComicCard`**: (Đã được đề cập trong workflow riêng, nhưng sẽ được sử dụng ở đây)
    *   Props: `comic` (object chứa thông tin truyện: `title`, `coverImageUrl`, `latestChapter`, `slug`, v.v.).
    *   Sử dụng `next/image` cho ảnh bìa, `next/link` để điều hướng đến trang chi tiết truyện.
2.  **Component `ComicListSection` (hoặc `ComicCarouselSection`)**:
    *   Props: `title` (tiêu đề khối, ví dụ: "Mới Cập Nhật"), `comics` (mảng dữ liệu truyện), `viewMoreLink` (link đến trang xem tất cả, nếu có).
    *   Render tiêu đề khối và một danh sách/lưới các `ComicCard`.
    *   Có thể thiết kế dưới dạng carousel (thanh trượt ngang) để hiển thị nhiều truyện hơn trong không gian giới hạn.
    ```tsx
    // Ví dụ cấu trúc ComicListSection.tsx
    import Link from "next/link";
    import ComicCard from "@/components/comics/ComicCard"; // Giả sử đường dẫn

    interface ComicListSectionProps {
      title: string;
      comics: ComicType[]; // Định nghĩa ComicType cho phù hợp
      viewMoreLink?: string;
    }

    export default function ComicListSection({ title, comics, viewMoreLink }: ComicListSectionProps) {
      return (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            {viewMoreLink && (
              <Link href={viewMoreLink} className="text-blue-500 hover:underline">
                Xem thêm
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {comics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </section>
      );
    }
    ```
3.  **Component `GenreListSection` (Danh sách Thể loại)**:
    *   Props: `genres` (mảng dữ liệu thể loại).
    *   Render danh sách các link thể loại, mỗi link sử dụng `next/link` để điều hướng đến trang danh sách truyện theo thể loại đó.

### Bước 2.4: Kết hợp Components và Dữ liệu trong Trang Chủ

Trong file `src/app/page.tsx` (hoặc tương đương).

1.  **Gọi các Hàm Fetch Dữ liệu**: Sử dụng `await` để lấy dữ liệu cho các khối.
    ```typescript
    // src/app/page.tsx
    export default async function HomePage() {
      const latestComics = await getLatestUpdatedComics();
      const trendingComics = await getTrendingComics();
      // ... fetch dữ liệu khác

      return (
        <main className="container mx-auto p-4">
          {/* Có thể có một banner hoặc slider nổi bật ở đây */}
          
          <ComicListSection title="Mới Cập Nhật" comics={latestComics.data} viewMoreLink="/newest" />
          <ComicListSection title="Thịnh Hành" comics={trendingComics.data} viewMoreLink="/trending" />
          {/* ... các section khác ... */}

          {/* <GenreListSection genres={allGenres.data} /> */}
        </main>
      );
    }
    ```
2.  **Xử lý Trạng thái Loading và Error (Tùy chọn nâng cao)**:
    *   Với Server Components, Next.js xử lý streaming UI. Bạn có thể sử dụng `Suspense` để hiển thị fallback UI (ví dụ: skeleton loaders) trong khi dữ liệu đang được fetch.
    *   Sử dụng `try...catch` trong các hàm fetch dữ liệu hoặc component để xử lý lỗi và hiển thị thông báo phù hợp.

### Bước 2.5: Tối ưu hóa SEO cho Trang Chủ

1.  **Metadata**: Định nghĩa metadata cho trang chủ trong `src/app/page.tsx` (App Router) hoặc sử dụng `<Head>` component (Pages Router).
    ```typescript
    // src/app/page.tsx (App Router)
    import type { Metadata } from 'next';

    export const metadata: Metadata = {
      title: 'Tên Trang Web Truyện Tranh - Đọc Truyện Online Miễn Phí',
      description: 'Khám phá hàng ngàn bộ truyện tranh hấp dẫn, cập nhật nhanh nhất tại Tên Trang Web. Đọc truyện tranh online miễn phí với nhiều thể loại đa dạng.',
      // openGraph, keywords, etc.
    };
    ```
2.  **Structured Data**: Thêm JSON-LD schema markup cho `WebSite` để cung cấp thông tin cho công cụ tìm kiếm.

### Bước 2.6: Đảm bảo Responsive Design

1.  Sử dụng Tailwind CSS (hoặc framework CSS bạn chọn) để đảm bảo các khối nội dung, lưới truyện, và các thành phần khác hiển thị tốt trên mọi kích thước màn hình (desktop, tablet, mobile).
2.  Kiểm tra kỹ lưỡng trên các thiết bị khác nhau.

## 3. Lưu ý Quan trọng

*   **Tốc độ tải trang**: Trang chủ là điểm vào quan trọng, cần tối ưu tốc độ tải. Sử dụng `next/image` cho tất cả hình ảnh, tận dụng ISR, và giảm thiểu JavaScript phía client.
*   **Trải nghiệm người dùng (UX)**: Bố cục rõ ràng, dễ điều hướng, giúp người dùng nhanh chóng tìm thấy nội dung họ quan tâm.
*   **Khả năng mở rộng**: Thiết kế component linh hoạt để dễ dàng thêm hoặc thay đổi các khối nội dung trong tương lai.

Bằng cách tuân theo các bước trên, bạn có thể xây dựng một trang chủ hiệu quả và hấp dẫn cho trang web truyện tranh của mình bằng Next.js.
