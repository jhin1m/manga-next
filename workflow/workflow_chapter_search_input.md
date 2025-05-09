# Workflow Kỹ thuật: Tìm kiếm Chương trong Trang Chi tiết (Chapter Search Input) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai chức năng Tìm kiếm Chương (Chapter Search Input) bên trong danh sách chương trên Trang Chi tiết Truyện, sử dụng Next.js. Chức năng này cho phép người dùng nhanh chóng lọc và tìm các chương cụ thể trong một danh sách dài.

## 2. Yêu cầu Tiên quyết

*   Component `ChapterList` đã tồn tại và hiển thị danh sách các chương (tham khảo workflow "Trang Chi tiết Truyện", phần con "Danh sách Chương").
*   Dữ liệu danh sách chương (`chapters`) được truyền vào `ChapterList` dưới dạng một mảng các object, mỗi object chứa thông tin chương (ví dụ: `id`, `name`, `chapter_number`).

## 3. Các Bước Kỹ thuật Triển khai với Next.js

Chức năng này thường được tích hợp trực tiếp vào component `ChapterList`.

### Bước 3.1: Thêm State cho Từ khóa Tìm kiếm

Trong component `ChapterList` (đã được đánh dấu là `"use client";`):

1.  **Sử dụng `useState`**: Khai báo một state để lưu trữ giá trị hiện tại của ô tìm kiếm.
    ```tsx
    // src/components/comics/ChapterList.tsx
    "use client";
    import Link from "next/link";
    import { useState, useMemo } from "react"; // Thêm useMemo

    // ... (Interface ChapterListProps và Chapter)

    export default function ChapterList({ chapters, comicSlug }: ChapterListProps) {
      const [searchTerm, setSearchTerm] = useState("");
      const [sortOrder, setSortOrder] = useState("desc"); // Giữ lại state sắp xếp nếu có
      // ...
    }
    ```

### Bước 3.2: Tạo Ô Input Tìm kiếm

1.  **Trong JSX của `ChapterList`**: Thêm một phần tử `<input type="text">`.
2.  **Binding Giá trị**: Gán `value` của input với state `searchTerm`.
3.  **Xử lý `onChange`**: Cập nhật state `searchTerm` mỗi khi người dùng gõ vào ô input.
    ```tsx
    // Bên trong return của ChapterList component
    // ...
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold text-white">Danh sách chương ({filteredAndSortedChapters.length})</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Tìm chương (ví dụ: 15, đặc biệt)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 rounded-md bg-gray-700 text-white placeholder-gray-400 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        {/* Select sắp xếp nếu có */}
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-2 py-1.5 rounded-md bg-gray-700 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none">
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>
      </div>
    </div>
    // ...
    ```

### Bước 3.3: Lọc Danh sách Chương Dựa trên Từ khóa Tìm kiếm

1.  **Logic Lọc**: Trước khi `map` qua mảng `chapters` để render, hãy lọc mảng này dựa trên `searchTerm`.
    *   Chuyển đổi cả `searchTerm` và tên/số chương sang chữ thường để tìm kiếm không phân biệt hoa thường.
    *   Kiểm tra xem tên chương (`chapter.name`) hoặc số chương (`chapter.chapter_number`) có chứa `searchTerm` hay không.
2.  **Sử dụng `useMemo` (Tùy chọn nhưng khuyến nghị)**: Để tối ưu hóa hiệu suất, bạn có thể bọc logic lọc và sắp xếp trong `useMemo`. Điều này đảm bảo rằng việc lọc và sắp xếp chỉ được thực hiện lại khi `chapters`, `searchTerm`, hoặc `sortOrder` thay đổi.

    ```tsx
    // Bên trong ChapterList component, trước return
    // ...
    const filteredAndSortedChapters = useMemo(() => {
      return chapters
        .filter(chapter => {
          const term = searchTerm.toLowerCase();
          const chapterName = chapter.name?.toLowerCase() || "";
          const chapterNumber = chapter.chapter_number?.toString().toLowerCase() || "";
          return chapterName.includes(term) || chapterNumber.includes(term);
        })
        .sort((a, b) => {
          const numA = parseFloat(a.chapter_number);
          const numB = parseFloat(b.chapter_number);
          // Đảm bảo xử lý NaN nếu chapter_number không phải là số hợp lệ
          const valA = isNaN(numA) ? 0 : numA;
          const valB = isNaN(numB) ? 0 : numB;
          return sortOrder === "desc" ? valB - valA : valA - valB;
        });
    }, [chapters, searchTerm, sortOrder]);
    // ...
    ```

### Bước 3.4: Hiển thị Danh sách Chương đã Lọc

Sử dụng mảng `filteredAndSortedChapters` (đã được lọc và sắp xếp) để render các link chương.

```tsx
// Bên trong return của ChapterList, phần hiển thị danh sách
// ...
<ul className="max-h-96 overflow-y-auto space-y-1 pr-1"> {/* Thêm pr-1 nếu scrollbar chiếm không gian */}
  {filteredAndSortedChapters.length > 0 ? (
    filteredAndSortedChapters.map((chapter: any) => (
      <li key={chapter.id} className="border-b border-gray-700 last:border-b-0">
        <Link href={`/c/${chapter.id}`} className="block p-2.5 hover:bg-gray-700 rounded-md text-blue-400 hover:text-blue-300 transition-colors duration-150">
          <span className="font-medium">{chapter.name || `Chương ${chapter.chapter_number}`}</span>
          {chapter.updated_at && 
            <span className="text-xs text-gray-500 ml-2"> - {new Date(chapter.updated_at).toLocaleDateString()}</span>
          }
        </Link>
      </li>
    ))
  ) : (
    <li className="p-3 text-center text-gray-500">Không tìm thấy chương nào khớp.</li>
  )}
</ul>
// ...
```

### Bước 3.5: Styling và Trải nghiệm Người dùng

1.  **Placeholder**: Cung cấp placeholder rõ ràng trong ô input (ví dụ: "Tìm chương theo tên hoặc số").
2.  **Phản hồi Trực quan**: Danh sách chương sẽ tự động cập nhật khi người dùng gõ.
3.  **Xóa Nhanh (Tùy chọn)**: Một số ô tìm kiếm có nút "x" nhỏ để xóa nhanh nội dung tìm kiếm. Điều này có thể được thêm bằng CSS hoặc một chút JavaScript.
4.  **Thông báo "Không có kết quả"**: Nếu không có chương nào khớp với từ khóa tìm kiếm, hiển thị một thông báo thân thiện.

## 4. Tích hợp vào `ChapterList` (Toàn bộ ví dụ đã cập nhật)

```tsx
// src/components/comics/ChapterList.tsx
"use client";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Chapter {
  id: string | number;
  name?: string;
  chapter_number: string | number; // Có thể là số hoặc chuỗi như "Extra 1"
  updated_at?: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  comicSlug: string;
}

export default function ChapterList({ chapters = [], comicSlug }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" for newest first, "asc" for oldest first

  const filteredAndSortedChapters = useMemo(() => {
    return chapters
      .filter(chapter => {
        if (!searchTerm) return true; // Nếu không có từ khóa tìm kiếm, trả về tất cả
        const term = searchTerm.toLowerCase();
        const chapterName = chapter.name?.toLowerCase() || "";
        // Xử lý chapter_number có thể là chuỗi (ví dụ "Extra 1") hoặc số
        const chapterNumberString = chapter.chapter_number?.toString().toLowerCase() || "";
        return chapterName.includes(term) || chapterNumberString.includes(term);
      })
      .sort((a, b) => {
        // Chuyển đổi chapter_number sang số để sắp xếp, xử lý trường hợp không phải số
        const numA = parseFloat(a.chapter_number.toString());
        const numB = parseFloat(b.chapter_number.toString());
        const valA = isNaN(numA) ? (sortOrder === 'desc' ? -Infinity : Infinity) : numA;
        const valB = isNaN(numB) ? (sortOrder === 'desc' ? -Infinity : Infinity) : numB;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
  }, [chapters, searchTerm, sortOrder]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-8 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-white whitespace-nowrap">
          Danh sách chương ({filteredAndSortedChapters.length})
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm chương..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
          />
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)} 
            className="px-2 py-1.5 rounded-md bg-gray-700 border border-gray-600 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none h-full"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>
      </div>
      <ul className="max-h-96 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {filteredAndSortedChapters.length > 0 ? (
          filteredAndSortedChapters.map((chapter) => (
            <li key={chapter.id} className="border-b border-gray-700 last:border-b-0">
              <Link 
                href={`/c/${chapter.id}`} // Hoặc /m/${comicSlug}/${chapter.id_or_slug_for_chapter}
                className="block p-2.5 hover:bg-gray-700 rounded-md text-blue-400 hover:text-blue-300 transition-colors duration-150 text-sm"
              >
                <span className="font-medium">{chapter.name || `Chương ${chapter.chapter_number}`}</span>
                {chapter.updated_at && 
                  <span className="text-xs text-gray-500 ml-2 hidden sm:inline"> - {new Date(chapter.updated_at).toLocaleDateString()}</span>
                }
              </Link>
            </li>
          ))
        ) : (
          <li className="p-3 text-center text-gray-500 italic">Không tìm thấy chương nào phù hợp với "{searchTerm}".</li>
        )}
      </ul>
    </div>
  );
}
```

## 5. Lưu ý Quan trọng

*   **Hiệu suất**: Đối với danh sách chương rất lớn (hàng nghìn chương), việc lọc phía client có thể trở nên chậm. Trong trường hợp đó, cân nhắc debouncing input tìm kiếm và/hoặc thực hiện tìm kiếm phía server thông qua API call.
*   **Độ phức tạp của Từ khóa Tìm kiếm**: Logic tìm kiếm hiện tại là tìm kiếm con chuỗi đơn giản. Nếu cần tìm kiếm nâng cao hơn (ví dụ: tìm kiếm chính xác cụm từ, loại trừ từ khóa), logic sẽ phức tạp hơn.
*   **UX**: Đảm bảo ô tìm kiếm dễ thấy và dễ sử dụng.

Chức năng tìm kiếm chương giúp người dùng nhanh chóng điều hướng đến chương họ muốn đọc, đặc biệt hữu ích cho các bộ truyện dài tập.```json_object_for_tool_code = {
