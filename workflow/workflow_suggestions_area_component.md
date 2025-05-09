# Workflow Kỹ thuật: Component Khu vực Đề xuất Truyện (Suggestions Area) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Component Khu vực Đề xuất Truyện (Suggestions Area) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Component này thường hiển thị một danh sách các truyện tranh liên quan hoặc được đề xuất cho người dùng, thường xuất hiện trên Trang Chi tiết Truyện.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Tạo File Component `SuggestionsArea`

1.  **Vị trí File**: `src/components/comics/SuggestionsArea.tsx` (hoặc một thư mục UI chung khác).
2.  **Props Interface**: Định nghĩa props mà component sẽ nhận:
    *   `relatedComics`: Một mảng các object truyện, mỗi object chứa thông tin cần thiết để render một `ComicCard` (ví dụ: `id`, `title`, `slug`, `coverImageUrl`).
    *   `title` (tùy chọn): Tiêu đề cho khu vực đề xuất (ví dụ: "Có thể bạn cũng thích", "Truyện cùng thể loại").
    ```typescript
    // src/components/comics/SuggestionsArea.tsx
    import ComicCard from "@/components/comics/ComicCard"; // Giả sử bạn đã có component này

    interface ComicSuggestion {
      id: string | number;
      title: string;
      slug: string;
      coverImageUrl: string;
      // Thêm các trường khác nếu ComicCard của bạn cần
    }

    interface SuggestionsAreaProps {
      relatedComics: ComicSuggestion[];
      title?: string;
    }

    export default function SuggestionsArea({ relatedComics, title = "Đề xuất cho bạn" }: SuggestionsAreaProps) {
      if (!relatedComics || relatedComics.length === 0) {
        return null; // Không hiển thị gì nếu không có truyện đề xuất
      }
      // ... implementation
    }
    ```

### Bước 2.2: Thiết kế Cấu trúc HTML và Styling

1.  **Thẻ Bao bọc Chính**: Sử dụng một thẻ `section` hoặc `aside` (nếu nó là một sidebar) làm thẻ bao bọc chính.
2.  **Tiêu đề (nếu có)**: Hiển thị prop `title`.
3.  **Hiển thị Danh sách Truyện Đề xuất**: Sử dụng bố cục lưới (grid layout) để hiển thị các `ComicCard` của truyện đề xuất.
    *   Tái sử dụng component `ComicCard` đã được tạo trước đó.
    *   Số lượng cột trong lưới có thể ít hơn so với danh sách truyện chính, tùy thuộc vào vị trí và thiết kế (ví dụ: nếu là sidebar, có thể chỉ 1-2 cột).
4.  **Styling với Tailwind CSS (hoặc tương đương)**:
    *   Định dạng layout, tiêu đề, và lưới hiển thị các card.

    ```tsx
    // Bên trong SuggestionsArea function
    // ... (sau khi kiểm tra relatedComics)
    export default function SuggestionsArea({ relatedComics, title = "Đề xuất cho bạn" }: SuggestionsAreaProps) {
      if (!relatedComics || relatedComics.length === 0) {
        return null;
      }

      return (
        <section aria-labelledby="suggestions-title" className="mt-8 mb-4 p-4 bg-gray-800 rounded-lg">
          <h2 id="suggestions-title" className="text-xl font-semibold text-white mb-4">
            {title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 
              Điều chỉnh số cột (grid-cols-*) cho phù hợp với nơi component này được sử dụng.
              Nếu là sidebar, có thể là grid-cols-1 hoặc grid-cols-2.
            */}
            {relatedComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic as any} /> // Ép kiểu nếu ComicSuggestion khác ComicType của ComicCard
            ))}
          </div>
        </section>
      );
    }
    ```

### Bước 2.3: Lấy Dữ liệu Truyện Đề xuất

Việc lấy dữ liệu truyện đề xuất thường xảy ra ở component cha (ví dụ: Trang Chi tiết Truyện).

1.  **API Endpoint**: Backend cần cung cấp một API endpoint để lấy danh sách truyện liên quan/đề xuất dựa trên truyện hiện tại (ví dụ: dựa trên thể loại, tác giả, hoặc thuật toán đề xuất).
    *   Ví dụ API: `GET /api/comics/[comicSlug]/related?limit=5`
2.  **Fetch Dữ liệu trong Component Cha**: Trong Server Component của Trang Chi tiết Truyện (`src/app/m/[comicSlug]/page.tsx`), gọi API này cùng với việc fetch dữ liệu chính của truyện.
    ```typescript
    // Ví dụ trong src/app/m/[comicSlug]/page.tsx
    // async function getComicDetailsAndSuggestions(slug: string) {
    //   const [detailsRes, suggestionsRes] = await Promise.all([
    //     fetch(`https://your-api.com/comics/details/${slug}`),
    //     fetch(`https://your-api.com/comics/related/${slug}?limit=4`) // Lấy 4 truyện đề xuất
    //   ]);
    //   if (!detailsRes.ok) return { comicInfo: null, chapters: [], relatedComics: [] };
    //   const comicData = await detailsRes.json();
    //   const relatedData = suggestionsRes.ok ? await suggestionsRes.json() : { data: [] };
    //   return { ...comicData, relatedComics: relatedData.data };
    // }
    // ...
    // const { comicInfo, chapters, relatedComics } = await getComicDetailsAndSuggestions(comicSlug);
    // ...
    // {relatedComics && relatedComics.length > 0 && <SuggestionsArea relatedComics={relatedComics} title="Có thể bạn cũng thích" />}
    ```

### Bước 2.4: Sử dụng Component `SuggestionsArea`

Import và sử dụng `SuggestionsArea` trong Trang Chi tiết Truyện hoặc bất kỳ nơi nào khác bạn muốn hiển thị truyện đề xuất.

```tsx
// Trong src/app/m/[comicSlug]/page.tsx
// import SuggestionsArea from "@/components/comics/SuggestionsArea";
// ...
// <main className="container mx-auto p-4">
//   <ComicInformationDisplay comicInfo={comicInfo} />
//   <ActionButtons comicSlug={comicSlug} /* ... */ />
//   <ChapterList chapters={chapters || []} comicSlug={comicSlug} />
//   {relatedComics && relatedComics.length > 0 && (
//     <SuggestionsArea relatedComics={relatedComics} title="Truyện liên quan" />
//   )}
// </main>
// ...
```

### Bước 2.5: Responsive Design và Performance

1.  **Responsive Grid**: Đảm bảo lưới các truyện đề xuất hiển thị tốt trên các kích thước màn hình khác nhau bằng cách sử dụng các class responsive của Tailwind CSS cho `grid-cols-*`.
2.  **Performance**: Vì `SuggestionsArea` thường hiển thị ít item hơn danh sách chính, hiệu suất thường không phải là vấn đề lớn. Tuy nhiên, vẫn đảm bảo `ComicCard` được tối ưu (đặc biệt là lazy loading ảnh).

## 3. Lưu ý Quan trọng

*   **Chất lượng Đề xuất**: Hiệu quả của component này phụ thuộc nhiều vào chất lượng của thuật toán đề xuất từ backend. Đề xuất có thể dựa trên:
    *   Cùng thể loại.
    *   Cùng tác giả.
    *   Những truyện người dùng khác cũng đọc sau khi đọc truyện hiện tại (collaborative filtering).
    *   Các truyện phổ biến/mới nhất.
*   **Vị trí Hiển thị**: Thường được đặt ở cuối trang chi tiết truyện hoặc trong một sidebar.
*   **Số lượng Đề xuất**: Hiển thị một số lượng vừa phải các truyện đề xuất (ví dụ: 4-8 truyện) để không làm người dùng quá tải thông tin.

Component `SuggestionsArea` giúp tăng cường khả năng khám phá nội dung trên trang web của bạn, giữ chân người dùng lâu hơn bằng cách giới thiệu cho họ những truyện khác mà họ có thể quan tâm.
