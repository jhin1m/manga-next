# Workflow Kỹ thuật: Trang Chi tiết Truyện (Comic Detail Page) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Trang Chi tiết Truyện cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Trang này hiển thị thông tin chi tiết về một bộ truyện cụ thể, danh sách các chương, và các hành động liên quan.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Định nghĩa Dynamic Route cho Trang Chi tiết Truyện

Trang chi tiết truyện thường dựa trên một slug hoặc ID duy nhất của truyện.

1.  **App Router (Khuyến nghị)**: Tạo cấu trúc thư mục như `src/app/m/[comicSlug]/page.tsx` (Dokiraw dùng `/m/slug`). `[comicSlug]` sẽ là tham số động.
2.  **Pages Router**: Tạo file `src/pages/m/[comicSlug].tsx`.

### Bước 2.2: Fetch Dữ liệu Chi tiết Truyện

Trang này cần fetch nhiều loại dữ liệu: thông tin chung của truyện, danh sách chương, và có thể cả truyện liên quan.

1.  **Xác định Nguồn Dữ liệu**: API backend.
2.  **Hàm Fetch Dữ liệu (Server Component trong App Router hoặc `getServerSideProps` trong Pages Router)**:
    *   Hàm này sẽ nhận `comicSlug` từ `params`.
    *   Gọi API backend để lấy:
        *   Thông tin chi tiết truyện (tên, ảnh bìa, tác giả, mô tả, thể loại, trạng thái, lượt xem, đánh giá, v.v.).
        *   Danh sách đầy đủ các chương (số chương, tên chương, slug/ID chương, ngày cập nhật).
        *   (Tùy chọn) Danh sách truyện đề xuất/liên quan.
    ```typescript
    // Ví dụ trong src/app/m/[comicSlug]/page.tsx (Server Component)
    async function getComicDetails(slug: string) {
      const res = await fetch(`https://your-api.com/comics/details/${slug}`, {
        next: { revalidate: 3600 }, // ISR 1 giờ, hoặc lâu hơn nếu ít thay đổi
      });
      if (!res.ok) {
        // throw new Error("Failed to fetch comic details"); // Sẽ được bắt bởi error.tsx
        return null; // Hoặc xử lý notFound
      }
      return res.json(); // Giả sử API trả về { comicInfo: {...}, chapters: [...], relatedComics: [...] }
    }
    ```
3.  **Xử lý Trường hợp Truyện không tồn tại**: Nếu API trả về lỗi 404 hoặc không có dữ liệu, cần hiển thị trang lỗi 404 (sử dụng `notFound()` từ `next/navigation` trong App Router).

### Bước 2.3: Xây dựng Giao diện Trang Chi tiết Truyện

Trong file page tương ứng (ví dụ: `src/app/m/[comicSlug]/page.tsx`).

#### 2.3.1. Component Hiển thị Thông tin Truyện (`ComicInformationDisplay`)

1.  **Tạo Component**: `src/components/comics/ComicInformationDisplay.tsx`.
2.  **Props**: `comicInfo` (object chứa thông tin chi tiết truyện).
3.  **Nội dung**: Hiển thị:
    *   Ảnh bìa lớn (`next/image`).
    *   Tên truyện (thẻ `<h1>`).
    *   Tên khác (nếu có).
    *   Tác giả, họa sĩ.
    *   Trạng thái (Đang tiến hành, Hoàn thành).
    *   Thể loại (danh sách các link `next/link` đến trang thể loại tương ứng).
    *   Lượt xem, lượt theo dõi, đánh giá (nếu có).
    *   Mô tả/Tóm tắt truyện (có thể có nút "Xem thêm" nếu mô tả dài).
    ```tsx
    // src/components/comics/ComicInformationDisplay.tsx
    import Image from "next/image";
    import Link from "next/link";

    interface ComicInfoProps { comicInfo: any; } // Định nghĩa kiểu cho comicInfo

    export default function ComicInformationDisplay({ comicInfo }: ComicInfoProps) {
      return (
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 bg-gray-800 rounded-lg">
          <div className="md:w-1/3 flex-shrink-0">
            <Image src={comicInfo.coverImageUrl} alt={comicInfo.title} width={300} height={450} className="rounded-md w-full object-cover" />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-white mb-2">{comicInfo.title}</h1>
            {comicInfo.alternativeTitle && <p className="text-sm text-gray-400 mb-2">Tên khác: {comicInfo.alternativeTitle}</p>}
            <p className="text-gray-300 mb-1">Tác giả: {comicInfo.author || "Đang cập nhật"}</p>
            <p className="text-gray-300 mb-1">Trạng thái: <span className={`font-semibold ${comicInfo.status === 'Ongoing' ? 'text-green-400' : 'text-blue-400'}`}>{comicInfo.status_display || "Đang cập nhật"}</span></p>
            <div className="mb-2">
              <span className="text-gray-300">Thể loại: </span>
              {comicInfo.genres?.map((genre: any) => (
                <Link key={genre.slug} href={`/genre/${genre.slug}`} className="text-blue-400 hover:underline mr-2 bg-gray-700 px-2 py-1 rounded text-xs">{genre.name}</Link>
              ))}
            </div>
            <p className="text-gray-300 mb-1">Lượt xem: {comicInfo.views || 0}</p>
            <p className="text-gray-300 mb-4">Mô tả: {comicInfo.description || "Chưa có mô tả."}</p>
            {/* Các nút hành động có thể đặt ở đây hoặc trong một component riêng */}
          </div>
        </div>
      );
    }
    ```

#### 2.3.2. Component Danh sách Chương (`ChapterList`)

1.  **Tạo Component**: `src/components/comics/ChapterList.tsx`.
2.  **Props**: `chapters` (mảng danh sách chương), `comicSlug`.
3.  **Nội dung**: Hiển thị danh sách các chương, mỗi chương là một link `next/link` đến trang đọc truyện (`/c/[chapterId]` hoặc `/m/[comicSlug]/[chapterSlugOrId]`).
    *   Thông tin mỗi chương: Số thứ tự, tên chương (nếu có), ngày cập nhật.
    *   Sắp xếp chương: Mới nhất ở trên hoặc cũ nhất ở trên (có thể cho người dùng tùy chọn).
    *   Phân trang cho danh sách chương nếu quá dài (ví dụ: >100 chương).
4.  **Tìm kiếm/Lọc chương (Chapter Search Input - như dokiraw)**:
    *   Thêm một ô input (`<input type="text">`) phía trên danh sách chương.
    *   Đây là Client Component (`"use client";`). Sử dụng `useState` để lưu trữ từ khóa tìm kiếm chương.
    *   Lọc danh sách chương hiển thị dựa trên từ khóa (lọc phía client).
    ```tsx
    // src/components/comics/ChapterList.tsx
    "use client";
    import Link from "next/link";
    import { useState } from "react";

    interface ChapterListProps { chapters: any[]; comicSlug: string; }

    export default function ChapterList({ chapters, comicSlug }: ChapterListProps) {
      const [searchTerm, setSearchTerm] = useState("");
      const [sortOrder, setSortOrder] = useState("desc"); // "desc" for newest first

      const filteredAndSortedChapters = chapters
        .filter(chapter => chapter.name?.toLowerCase().includes(searchTerm.toLowerCase()) || chapter.chapter_number?.toString().includes(searchTerm))
        .sort((a, b) => {
          const numA = parseFloat(a.chapter_number);
          const numB = parseFloat(b.chapter_number);
          return sortOrder === "desc" ? numB - numA : numA - numB;
        });

      return (
        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Danh sách chương</h2>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    placeholder="Tìm chương..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="px-2 py-1 rounded bg-gray-700 text-white text-sm"/>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white text-sm">
                    <option value="desc">Mới nhất</option>
                    <option value="asc">Cũ nhất</option>
                </select>
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto space-y-2">
            {filteredAndSortedChapters.map((chapter: any) => (
              <li key={chapter.id} className="border-b border-gray-700 last:border-b-0">
                <Link href={`/c/${chapter.id}`} className="block p-3 hover:bg-gray-700 rounded-md text-blue-400 hover:text-blue-300">
                  {chapter.name || `Chương ${chapter.chapter_number}`}
                  <span className="text-xs text-gray-500 ml-2"> - Cập nhật: {new Date(chapter.updated_at).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    ```

#### 2.3.3. Component Các Nút Hành động (`ActionButtons`)

1.  **Tạo Component**: `src/components/comics/ActionButtons.tsx`.
2.  **Props**: `comicSlug`, `firstChapterId`, `latestChapterId`, `isFavorited` (nếu có tính năng yêu thích).
3.  **Nội dung**: Các nút như:
    *   "Đọc từ đầu" (`next/link` đến chương đầu tiên).
    *   "Đọc mới nhất" (`next/link` đến chương mới nhất).
    *   "Theo dõi/Bỏ theo dõi" (yêu cầu tương tác với API và trạng thái người dùng).
    *   "Chia sẻ".
    ```tsx
    // src/components/comics/ActionButtons.tsx
    import Link from "next/link";
    // import FavoriteButton from "./FavoriteButton"; // Component riêng cho nút yêu thích

    interface ActionButtonsProps { comicSlug: string; firstChapterId?: string; latestChapterId?: string; comicId: string; }

    export default function ActionButtons({ comicSlug, firstChapterId, latestChapterId, comicId }: ActionButtonsProps) {
      return (
        <div className="flex flex-wrap gap-3 my-4">
          {firstChapterId && (
            <Link href={`/c/${firstChapterId}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
              Đọc từ đầu
            </Link>
          )}
          {latestChapterId && (
            <Link href={`/c/${latestChapterId}`} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium">
              Đọc mới nhất
            </Link>
          )}
          {/* <FavoriteButton comicId={comicId} /> */}
          {/* Nút chia sẻ */}
        </div>
      );
    }
    ```

#### 2.3.4. Component Khu vực Đề xuất Truyện (`SuggestionsArea`)

1.  **Tạo Component**: `src/components/comics/SuggestionsArea.tsx`.
2.  **Props**: `relatedComics` (mảng truyện liên quan).
3.  **Nội dung**: Hiển thị một lưới các `ComicCard` cho truyện liên quan.

#### 2.3.5. Kết hợp các Components trong Trang Chi tiết

Trong `src/app/m/[comicSlug]/page.tsx`:

```typescript
// src/app/m/[comicSlug]/page.tsx
import { notFound } from 'next/navigation';
import ComicInformationDisplay from "@/components/comics/ComicInformationDisplay";
import ChapterList from "@/components/comics/ChapterList";
import ActionButtons from "@/components/comics/ActionButtons";
// import SuggestionsArea from "@/components/comics/SuggestionsArea";
import type { Metadata } from 'next';

// (Hàm getComicDetails đã định nghĩa ở trên)

export async function generateMetadata({ params }: { params: { comicSlug: string } }): Promise<Metadata> {
  const comicData = await getComicDetails(params.comicSlug);
  if (!comicData) return { title: "Không tìm thấy truyện" };
  return {
    title: `${comicData.comicInfo.title} - Đọc truyện tranh online`,
    description: comicData.comicInfo.description?.substring(0, 160) || `Đọc truyện ${comicData.comicInfo.title} full các chương mới nhất.`,
    openGraph: {
      title: comicData.comicInfo.title,
      description: comicData.comicInfo.description?.substring(0, 160),
      images: [{ url: comicData.comicInfo.coverImageUrl }],
    },
  };
}

export default async function ComicDetailPage({ params }: { params: { comicSlug: string } }) {
  const comicSlug = params.comicSlug;
  const comicData = await getComicDetails(comicSlug);

  if (!comicData) {
    notFound(); // Hiển thị trang 404
  }

  const { comicInfo, chapters /*, relatedComics */ } = comicData;
  const firstChapter = chapters?.length > 0 ? chapters.sort((a:any,b:any) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number))[0] : null;
  const latestChapter = chapters?.length > 0 ? chapters.sort((a:any,b:any) => parseFloat(b.chapter_number) - parseFloat(a.chapter_number))[0] : null;

  return (
    <main className="container mx-auto p-4">
      <ComicInformationDisplay comicInfo={comicInfo} />
      <ActionButtons 
        comicSlug={comicSlug} 
        firstChapterId={firstChapter?.id} 
        latestChapterId={latestChapter?.id} 
        comicId={comicInfo.id}
      />
      <ChapterList chapters={chapters || []} comicSlug={comicSlug} />
      {/* {relatedComics && relatedComics.length > 0 && <SuggestionsArea relatedComics={relatedComics} />} */}
    </main>
  );
}
```

### Bước 2.4: Tối ưu hóa SEO

1.  **Metadata Động**: Sử dụng hàm `generateMetadata` (App Router) để tạo `title`, `description`, và các thẻ Open Graph động dựa trên thông tin truyện.
2.  **Structured Data (Schema Markup)**: Thêm JSON-LD schema markup cho `ComicSeries` và `ComicIssue` (cho từng chương) để cung cấp thông tin chi tiết cho công cụ tìm kiếm.

### Bước 2.5: Xử lý Trạng thái Loading và Error

1.  **App Router (Server Components)**:
    *   Tạo file `loading.tsx` trong `src/app/m/[comicSlug]/` để hiển thị skeleton UI trong khi dữ liệu đang tải.
    *   Tạo file `error.tsx` để xử lý lỗi (ví dụ: API không phản hồi).
    *   Sử dụng `notFound()` nếu truyện không tồn tại.

## 3. Lưu ý Quan trọng

*   **Performance**: Tối ưu hóa API backend. Sử dụng ISR cho trang chi tiết truyện vì nội dung (thông tin truyện, danh sách chương) có thể không thay đổi quá thường xuyên.
*   **UX**: Đảm bảo trang dễ đọc, danh sách chương dễ điều hướng. Cân nhắc lazy loading cho hình ảnh trong mô tả hoặc các phần ít quan trọng hơn.
*   **Tách biệt Component**: Chia nhỏ các phần của trang chi tiết thành các component có thể quản lý và tái sử dụng.
*   **Quản lý State cho Tương tác**: Các tính năng như "Theo dõi" hoặc "Đánh giá" sẽ yêu cầu quản lý state phía client và tương tác với API (thường trong Client Components).

Bằng cách thực hiện các bước này, bạn có thể xây dựng một trang chi tiết truyện đầy đủ thông tin, hấp dẫn và tối ưu cho SEO bằng Next.js.
