# Workflow Kỹ thuật: Component Phân Trang (Pagination) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Component Phân Trang (Pagination) có thể tái sử dụng cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Component này cho phép người dùng điều hướng qua nhiều trang kết quả trên các trang danh sách.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Tạo File Component `Pagination`

1.  **Vị trí File**: `src/components/ui/Pagination.tsx` (hoặc một thư mục UI chung khác).
2.  **Client Component**: Đánh dấu là `"use client";` vì nó sẽ đọc `searchParams` và `pathname` để xây dựng URL và có thể có logic hiển thị phức tạp.
3.  **Props Interface**: Định nghĩa props mà component sẽ nhận:
    *   `currentPage`: Số trang hiện tại.
    *   `totalPages`: Tổng số trang.
    *   (Tùy chọn) `baseUrl`: Phần URL cơ sở không bao gồm query `page`. Tuy nhiên, cách tốt hơn là component tự xây dựng URL dựa trên `pathname` và `searchParams` hiện tại.
    *   (Tùy chọn) `maxVisiblePages`: Số lượng nút trang tối đa hiển thị (ví dụ: 5 hoặc 7) để tránh hiển thị quá nhiều nút nếu có hàng trăm trang.
    ```typescript
    // src/components/ui/Pagination.tsx
    "use client";

    import Link from "next/link";
    import { usePathname, useSearchParams } from "next/navigation";

    interface PaginationProps {
      currentPage: number;
      totalPages: number;
      maxVisiblePages?: number; // Ví dụ: 5 hoặc 7
    }

    export default function Pagination({ currentPage, totalPages, maxVisiblePages = 5 }: PaginationProps) {
      const pathname = usePathname();
      const searchParams = useSearchParams();

      const createPageUrl = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
      };
      // ... (Logic tính toán các trang hiển thị sẽ ở đây)
    }
    ```

### Bước 2.2: Logic Tính toán các Nút Trang Hiển thị

Nếu có nhiều trang, bạn không muốn hiển thị tất cả các số trang. Cần có logic để hiển thị một tập hợp con các nút trang (ví dụ: trang đầu, trang cuối, các trang xung quanh trang hiện tại, và dấu "...").

1.  **Trường hợp Đơn giản (ít trang)**: Nếu `totalPages <= maxVisiblePages`, hiển thị tất cả các nút trang.
2.  **Trường hợp Phức tạp (nhiều trang)**:
    *   Luôn hiển thị nút "Trang đầu" (1) và "Trang cuối" (`totalPages`).
    *   Hiển thị các nút xung quanh `currentPage`.
    *   Sử dụng dấu chấm lửng "..." để biểu thị các trang bị bỏ qua.
    *   Ví dụ logic:
        *   Nếu `currentPage` gần đầu: Hiển thị `1, 2, 3, ..., totalPages`.
        *   Nếu `currentPage` gần cuối: Hiển thị `1, ..., totalPages-2, totalPages-1, totalPages`.
        *   Nếu `currentPage` ở giữa: Hiển thị `1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages`.

    ```tsx
    // Bên trong Pagination function
    // ... (sau createPageUrl)
    const getPageNumbers = (): (number | string)[] => {
        const pageNumbers: (number | string)[] = [];
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        }

        let startPage = Math.max(1, currentPage - Math.floor((maxVisiblePages - 2) / 2));
        let endPage = Math.min(totalPages, currentPage + Math.ceil((maxVisiblePages - 2) / 2));

        if (currentPage - startPage < Math.floor((maxVisiblePages - 2) / 2)) {
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 3);
        }
        if (endPage - currentPage < Math.ceil((maxVisiblePages - 2) / 2)) {
            startPage = Math.max(1, endPage - maxVisiblePages + 3);
        }

        pageNumbers.push(1);
        if (startPage > 2) {
            pageNumbers.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i !== 1 && i !== totalPages) {
                pageNumbers.push(i);
            }
        }

        if (endPage < totalPages - 1) {
            pageNumbers.push("...");
        }
        if (totalPages > 1) pageNumbers.push(totalPages);
        
        // Loại bỏ các "..." không cần thiết nếu startPage/endPage gần 1/totalPages
        // Ví dụ, nếu startPage là 2, không cần "..." sau 1.
        const finalPages: (number | string)[] = [1];
        if (startPage === 2) finalPages.push(2);
        else if (startPage > 2) finalPages.push("...");

        for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
            finalPages.push(i);
        }

        if (endPage === totalPages - 1 && totalPages > 1) finalPages.push(totalPages -1 );
        else if (endPage < totalPages - 1 && totalPages > 1) finalPages.push("...");
        
        if (totalPages > 1) finalPages.push(totalPages);
        
        // Đơn giản hóa logic trên, có nhiều cách triển khai, thư viện như `react-paginate` xử lý tốt việc này.
        // Logic đơn giản hơn cho ví dụ:
        const pagesToShow: (number | string)[] = [];
        const half = Math.floor(maxVisiblePages / 2);
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
        } else {
            pagesToShow.push(1);
            if (currentPage > half + 2) pagesToShow.push("...");
            for (let i = Math.max(2, currentPage - half); i <= Math.min(totalPages - 1, currentPage + half); i++) {
                pagesToShow.push(i);
            }
            if (currentPage < totalPages - half - 1) pagesToShow.push("...");
            pagesToShow.push(totalPages);
        }
        return pagesToShow.filter((item, index, self) => item !== "..." || (item === "..." && self[index-1] !== "...")); // Loại bỏ ... liền kề
    };

    const pageNumbersToDisplay = getPageNumbers();
    ```
    *Lưu ý: Logic tạo danh sách trang có thể phức tạp. Cân nhắc sử dụng thư viện đã được kiểm thử nếu cần độ phức tạp cao hơn hoặc đơn giản hóa logic cho nhu cầu cơ bản.* 

### Bước 2.3: Thiết kế Cấu trúc HTML và Styling

1.  **Thẻ Bao bọc Chính**: Sử dụng thẻ `<nav>` với `aria-label="Pagination"`.
2.  **Nút "Trước" và "Sau"**: Các nút để đi đến trang trước và trang sau.
    *   Vô hiệu hóa nút "Trước" nếu `currentPage === 1`.
    *   Vô hiệu hóa nút "Sau" nếu `currentPage === totalPages`.
3.  **Nút Số Trang**: Render các nút số trang đã tính toán ở Bước 2.2.
    *   Làm nổi bật nút của `currentPage`.
    *   Nếu item là "...", hiển thị dưới dạng text không thể click hoặc một span.
4.  **Sử dụng `next/link`**: Bọc mỗi nút trang (có thể click) trong component `next/link` với URL được tạo bởi `createPageUrl`.
5.  **Styling**: Sử dụng Tailwind CSS để tạo kiểu cho các nút, trạng thái active, disabled.

    ```tsx
    // Bên trong Pagination function, sau khi có pageNumbersToDisplay
    if (totalPages <= 1) return null; // Không hiển thị nếu chỉ có 1 trang hoặc ít hơn

    return (
        <nav aria-label="Pagination" className="flex justify-center items-center space-x-2 mt-8 mb-4">
            {/* Nút Trước */}
            <Link 
                href={createPageUrl(currentPage - 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 1 ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                onClick={(e) => { if (currentPage === 1) e.preventDefault(); }}
            >
                Trước
            </Link>

            {/* Nút Số Trang */}
            {pageNumbersToDisplay.map((page, index) => (
                typeof page === "number" ? (
                    <Link
                        key={`page-${page}`}
                        href={createPageUrl(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page ? "bg-blue-600 text-white ring-2 ring-blue-500" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </Link>
                ) : (
                    <span key={`dots-${index}`} className="px-3 py-2 text-sm text-gray-400">...</span>
                )
            ))}

            {/* Nút Sau */}
            <Link 
                href={createPageUrl(currentPage + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === totalPages ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                onClick={(e) => { if (currentPage === totalPages) e.preventDefault(); }}
            >
                Sau
            </Link>
        </nav>
    );
    ```

### Bước 2.4: Sử dụng Component `Pagination`

Import và sử dụng `Pagination` trong các trang danh sách (ví dụ: `GenrePage`, `SearchPage`, `NewestPage`).

```tsx
// Ví dụ trong src/app/newest/page.tsx
// import Pagination from "@/components/ui/Pagination";
// ... (fetch dữ liệu, lấy currentPage và totalPages từ API response)
// if (totalPages > 1) {
//   <Pagination currentPage={currentPage} totalPages={totalPages} />
// }
// ...
```

### Bước 2.5: Accessibility (A11y)

*   Sử dụng thẻ `<nav>` với `aria-label`.
*   Sử dụng `aria-current="page"` cho nút trang hiện tại.
*   Sử dụng `aria-disabled="true"` và `tabIndex="-1"` cho các nút "Trước"/"Sau" bị vô hiệu hóa.
*   Đảm bảo có thể điều hướng bằng bàn phím.

## 3. Lưu ý Quan trọng

*   **Nguồn Chân lý (Source of Truth) cho Trang Hiện tại**: Trang hiện tại nên được lấy từ URL query parameter (`?page=...`). Component Pagination đọc từ đó và tạo link để cập nhật nó.
*   **Reset về Trang 1**: Khi người dùng thay đổi bộ lọc hoặc sắp xếp, thường nên reset phân trang về trang 1 để tránh trường hợp trang hiện tại không còn tồn tại với bộ lọc mới.
*   **SEO**: Đảm bảo các link đến các trang phân trang có thể được crawl bởi công cụ tìm kiếm. Cân nhắc sử dụng `rel="prev"` và `rel="next"` (có thể được thêm vào `<head>` của trang danh sách mẹ, logic này phức tạp hơn để quản lý từ component Pagination).
*   **Trải nghiệm Người dùng**: Cung cấp đủ ngữ cảnh cho người dùng biết họ đang ở đâu trong tập kết quả. Hiển thị tổng số kết quả hoặc tổng số trang có thể hữu ích.

Component Phân Trang là một yếu tố UI phổ biến và quan trọng. Xây dựng nó một cách cẩn thận sẽ cải thiện đáng kể trải nghiệm người dùng khi duyệt qua lượng lớn nội dung.
