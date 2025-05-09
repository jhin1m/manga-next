# Workflow Kỹ thuật: Trang Đọc Truyện (Comic Reading Page) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Trang Đọc Truyện cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Trang này hiển thị các hình ảnh của một chương truyện và cung cấp các điều khiển để điều hướng giữa các chương và trang.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Định nghĩa Dynamic Route cho Trang Đọc Truyện

Trang đọc truyện thường dựa trên ID hoặc slug của chương truyện.

1.  **App Router (Khuyến nghị)**: Tạo cấu trúc thư mục như `src/app/c/[chapterId]/page.tsx` (Dokiraw dùng `/c/chapterId`). `[chapterId]` sẽ là tham số động.
2.  **Pages Router**: Tạo file `src/pages/c/[chapterId].tsx`.

### Bước 2.2: Fetch Dữ liệu Chương Truyện

Trang này cần fetch danh sách các URL hình ảnh của chương truyện, thông tin về chương (tên truyện, số chương), và thông tin điều hướng (ID chương trước/sau).

1.  **Xác định Nguồn Dữ liệu**: API backend.
2.  **Hàm Fetch Dữ liệu (Server Component trong App Router hoặc `getServerSideProps` trong Pages Router)**:
    *   Hàm này sẽ nhận `chapterId` từ `params`.
    *   Gọi API backend để lấy:
        *   Danh sách URL các trang ảnh của chương hiện tại.
        *   Thông tin truyện (tên, slug).
        *   Thông tin chương hiện tại (số chương, tên chương).
        *   ID/slug của chương trước và chương sau (nếu có) để điều hướng.
    ```typescript
    // Ví dụ trong src/app/c/[chapterId]/page.tsx (Server Component)
    async function getChapterData(chapterId: string) {
      const res = await fetch(`https://your-api.com/chapters/${chapterId}`, {
        // Cân nhắc caching, có thể revalidate thường xuyên hơn nếu có bình luận hoặc view count
        next: { revalidate: 3600 }, 
      });
      if (!res.ok) {
        // throw new Error("Failed to fetch chapter data");
        return null; // Hoặc xử lý notFound
      }
      return res.json(); 
      // Giả sử API trả về: 
      // {
      //   comic: { slug: string, title: string },
      //   chapter: { number: string, title?: string, images: string[] },
      //   navigation: { prevChapterId?: string, nextChapterId?: string }
      // }
    }
    ```
3.  **Xử lý Trường hợp Chương không tồn tại**: Nếu API trả về lỗi 404, sử dụng `notFound()` từ `next/navigation`.

### Bước 2.3: Xây dựng Giao diện Trang Đọc Truyện

Trong file page tương ứng (ví dụ: `src/app/c/[chapterId]/page.tsx`). Trang này thường là một Client Component (`"use client";`) để quản lý các tương tác người dùng như cài đặt chế độ đọc, điều hướng bằng phím, v.v.

#### 2.3.1. Component Chính của Trang Đọc (`ComicReader`)

1.  **Tạo Component**: `src/components/reader/ComicReader.tsx`. Đánh dấu là `"use client";`.
2.  **Props**: `chapterData` (dữ liệu từ API: `images`, `comicInfo`, `chapterInfo`, `navigationInfo`).
3.  **State (nếu cần)**:
    *   Chế độ đọc (ví dụ: cuộn dọc liên tục, từng trang một ngang).
    *   Trang hiện tại (nếu là chế độ từng trang).
    *   Hiển thị/ẩn thanh điều khiển.

#### 2.3.2. Hiển thị Hình ảnh Truyện (`ImageDisplay`)

1.  **Cách hiển thị**: Dokiraw và nhiều trang khác hiển thị tất cả hình ảnh của chương theo chiều dọc, người dùng cuộn xuống để đọc.
2.  **Sử dụng `next/image`**: Render mỗi URL ảnh trong mảng `chapterData.chapter.images` bằng component `next/image`.
    *   Cần đặt `width` và `height` cho `next/image`. Nếu không có kích thước từ API, bạn có thể cần load ảnh để lấy kích thước hoặc đặt `layout="responsive"` (trong Pages Router) hoặc style CSS để ảnh tự điều chỉnh theo chiều rộng container và chiều cao tự động.
    *   Với App Router, `next/image` yêu cầu `width` và `height` hoặc `fill`. Nếu không có, bạn có thể cần một wrapper div và set `position: relative` cho wrapper, `position: absolute, layout: "fill", objectFit: "contain"` (hoặc `cover`) cho Image.
    *   **Lazy Loading**: `next/image` tự động lazy load các ảnh nằm ngoài viewport ban đầu.
    *   **Priority**: Đặt `priority` prop cho một vài ảnh đầu tiên để chúng được tải ưu tiên.
    ```tsx
    // Trong ComicReader.tsx hoặc một component con ImageDisplay.tsx
    // ...
    {chapterData.chapter.images.map((imageUrl, index) => (
      <div key={index} className="mx-auto max-w-3xl"> {/* Giới hạn chiều rộng ảnh */}
        <Image 
          src={imageUrl} 
          alt={`Trang ${index + 1} - ${chapterData.comic.title} - Chương ${chapterData.chapter.number}`}
          width={800} // Cần giá trị width, height thực tế hoặc dùng fill
          height={1200} // Hoặc tính toán tỷ lệ
          priority={index < 3} // Ưu tiên tải 3 ảnh đầu
          className="w-full h-auto block" // Đảm bảo ảnh responsive
        />
      </div>
    ))}
    // ...
    ```

#### 2.3.3. Thanh Điều hướng Trong Trang Đọc (`ReaderNavigationBar`)

1.  **Tạo Component**: `src/components/reader/ReaderNavigationBar.tsx`. Có thể là Client Component.
2.  **Props**: `comicInfo`, `chapterInfo`, `navigationInfo` (chứa `prevChapterId`, `nextChapterId`), `chapterList` (danh sách tất cả chương để tạo dropdown chọn chương).
3.  **Vị trí**: Thường cố định ở đầu hoặc cuối màn hình, hoặc xuất hiện khi người dùng cuộn lên/tương tác.
4.  **Nội dung**:
    *   Link về trang chi tiết truyện (`next/link` đến `/m/[comicSlug]`).
    *   Tên truyện và số chương hiện tại.
    *   Nút/Dropdown để chọn chương khác (điều hướng đến `/c/[selectedChapterId]`).
    *   Nút "Chương trước" và "Chương sau" (`next/link` đến `/c/[prevChapterId]` hoặc `/c/[nextChapterId]`). Vô hiệu hóa nếu không có chương trước/sau.
    *   (Tùy chọn) Nút cài đặt (chế độ đọc, v.v.).
    ```tsx
    // src/components/reader/ReaderNavigationBar.tsx
    "use client";
    import Link from "next/link";
    import { useRouter } from "next/navigation";
    // ... (Props interface)
    export default function ReaderNavigationBar({ comicInfo, chapterInfo, navigationInfo, allChapters }) {
        const router = useRouter();
        const handleChapterChange = (event) => {
            const selectedChapterId = event.target.value;
            if(selectedChapterId) router.push(`/c/${selectedChapterId}`);
        }
        return (
            <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 shadow-lg z-50 flex justify-between items-center">
                <Link href={`/m/${comicInfo.slug}`} className="text-sm hover:underline">{comicInfo.title} - Chương {chapterInfo.number}</Link>
                <div className="flex items-center gap-2">
                    {navigationInfo.prevChapterId && <Link href={`/c/${navigationInfo.prevChapterId}`} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-xs">Trước</Link>}
                    <select onChange={handleChapterChange} defaultValue={chapterInfo.id} className="bg-gray-700 text-white p-1 rounded text-xs">
                        {allChapters.map(ch => <option key={ch.id} value={ch.id}>Chương {ch.number}</option>)}
                    </select>
                    {navigationInfo.nextChapterId && <Link href={`/c/${navigationInfo.nextChapterId}`} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-xs">Sau</Link>}
                </div>
                {/* Nút cài đặt, nút về trang chủ... */}
            </div>
        );
    }
    ```

#### 2.3.4. Các Nút Tương tác Phụ (Bình luận, Yêu thích, Chia sẻ)

*   Tương tự như trên trang chi tiết, có thể đặt các nút này ở một vị trí thuận tiện trên trang đọc (ví dụ: thanh điều hướng phụ hoặc một sidebar nổi).

#### 2.3.5. Chỉ báo Tiến độ Đọc (Reading Progress Indicator)

*   Hiển thị số trang hiện tại / tổng số trang của chương (ví dụ: "1/21" như dokiraw).
*   Hoặc một thanh tiến trình ở đầu/cuối trang, cập nhật khi người dùng cuộn.
*   Yêu cầu JavaScript để theo dõi vị trí cuộn và tính toán tiến độ.

#### 2.3.6. Điều hướng bằng Bàn phím

*   Thêm event listener (trong `useEffect`) để cho phép người dùng chuyển trang/chương bằng phím mũi tên trái/phải.

### Bước 2.4: Kết hợp Components trong Trang Đọc

Trong `src/app/c/[chapterId]/page.tsx`:

```typescript
// src/app/c/[chapterId]/page.tsx
import { notFound } from 'next/navigation';
import ComicReaderClient from "@/components/reader/ComicReaderClient"; // Component Client chính
import type { Metadata } from 'next';

// (Hàm getChapterData đã định nghĩa ở trên)
// (Hàm getAllChaptersForComic để lấy danh sách chương cho dropdown)

export async function generateMetadata({ params }: { params: { chapterId: string } }): Promise<Metadata> {
  const chapterData = await getChapterData(params.chapterId);
  if (!chapterData) return { title: "Không tìm thấy chương" };
  return {
    title: `${chapterData.comic.title} - Chương ${chapterData.chapter.number} - Đọc truyện online`,
    description: `Đọc truyện ${chapterData.comic.title} chương ${chapterData.chapter.number} mới nhất.`,
    // robots: { noindex: true } // Cân nhắc noindex trang đọc để tập trung SEO vào trang chi tiết
  };
}

export default async function ReadChapterPage({ params }: { params: { chapterId: string } }) {
  const chapterId = params.chapterId;
  const chapterData = await getChapterData(chapterId);

  if (!chapterData) {
    notFound();
  }
  // Giả sử bạn có hàm fetch danh sách tất cả chương của truyện này
  // const allChapters = await getAllChaptersForComic(chapterData.comic.slug);

  return (
    // Không có layout header/footer chung, hoặc có layout reader đặc biệt
    <ComicReaderClient chapterData={chapterData} /* allChapters={allChapters} */ />
  );
}
```

`ComicReaderClient.tsx` sẽ là nơi chứa logic client-side và các component con như `ReaderNavigationBar`, `ImageDisplay`.

```tsx
// src/components/reader/ComicReaderClient.tsx
"use client";
import Image from "next/image";
import ReaderNavigationBar from "./ReaderNavigationBar";
// ... other imports, state, useEffect for keyboard nav, etc.

export default function ComicReaderClient({ chapterData, allChapters }) {
    // State cho chế độ đọc, trang hiện tại, hiển thị thanh điều khiển, etc.
    return (
        <div className="bg-black min-h-screen pt-16"> {/* pt-16 nếu navbar cao 4rem (16*0.25) */}
            <ReaderNavigationBar 
                comicInfo={chapterData.comic} 
                chapterInfo={chapterData.chapter} 
                navigationInfo={chapterData.navigation} 
                // allChapters={allChapters} 
            />
            <div className="image-list-container">
                {chapterData.chapter.images.map((imageUrl, index) => (
                    <div key={index} className="mx-auto max-w-3xl mb-1"> 
                        <Image 
                            src={imageUrl} 
                            alt={`Trang ${index + 1}`}
                            width={800} 
                            height={1200} 
                            priority={index < 2}
                            className="w-full h-auto block"
                        />
                    </div>
                ))}
            </div>
            {/* Các nút điều hướng ở cuối trang, hoặc thanh điều khiển nổi */}
        </div>
    );
}
```

### Bước 2.5: Tối ưu hóa SEO và UX

1.  **Metadata Động**: `title` và `description` cho mỗi trang đọc chương.
2.  **Cân nhắc `noindex`**: Trang đọc truyện thường có nội dung mỏng (chỉ hình ảnh). Cân nhắc đặt `robots: { noindex: true }` để tập trung giá trị SEO vào trang chi tiết truyện và trang thể loại.
3.  **Tốc độ tải ảnh**: Rất quan trọng. `next/image` giúp nhiều, nhưng đảm bảo ảnh được tối ưu hóa kích thước file từ server.
4.  **Trải nghiệm trên Mobile**: Đảm bảo các nút điều khiển dễ chạm, hình ảnh hiển thị tốt.
5.  **Prefetching**: Next.js tự động prefetch các link. Cân nhắc prefetch dữ liệu cho chương tiếp theo khi người dùng gần đọc xong chương hiện tại để chuyển chương mượt mà hơn (nâng cao).

## 3. Lưu ý Quan trọng

*   **Layout**: Trang đọc truyện thường có layout riêng, không bao gồm Header và Footer chung của website để tối đa hóa không gian hiển thị nội dung.
*   **Chi phí Băng thông**: Trang truyện tranh tốn nhiều băng thông. Tối ưu hóa hình ảnh là bắt buộc.
*   **Bảo vệ Nội dung (Nâng cao)**: Nếu cần, xem xét các biện pháp chống tải ảnh hàng loạt (watermarking, hotlink protection, v.v.), tuy nhiên điều này phức tạp.

Bằng cách thực hiện các bước này, bạn có thể xây dựng một trang đọc truyện hiệu quả, mượt mà và thân thiện với người dùng bằng Next.js.
