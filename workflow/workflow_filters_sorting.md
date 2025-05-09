# Workflow Kỹ thuật: Bộ lọc và Sắp xếp (Filters & Sorting) trên Trang Danh sách - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai chức năng Bộ lọc (Filters) và Sắp xếp (Sorting) trên các trang danh sách truyện (ví dụ: trang thể loại, trang kết quả tìm kiếm, trang truyện mới nhất) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

Chức năng này cho phép người dùng tinh chỉnh và sắp xếp lại danh sách truyện hiển thị.

### Bước 2.1: Xác định các Tiêu chí Lọc và Sắp xếp

1.  **Tiêu chí Lọc (Filters)**: Dựa trên dokiraw.com và các trang truyện phổ biến:
    *   Trạng thái truyện (ví dụ: Đang tiến hành, Hoàn thành, Tạm ngưng).
    *   Thể loại (nếu đang ở trang "Tất cả truyện" hoặc trang tìm kiếm rộng).
    *   Số lượng chương (ví dụ: >50 chương, <10 chương).
    *   Ngày cập nhật (ví dụ: Trong tuần này, Trong tháng này).
    *   Độ tuổi (ví dụ: 18+).
2.  **Tiêu chí Sắp xếp (Sorting)**:
    *   Ngày cập nhật mới nhất (mặc định thường là lựa chọn tốt).
    *   Ngày đăng truyện mới nhất.
    *   Lượt xem nhiều nhất.
    *   Đánh giá cao nhất.
    *   Tên truyện (A-Z, Z-A).

### Bước 2.2: Thiết kế Giao diện Người dùng (UI) cho Bộ lọc và Sắp xếp

1.  **Vị trí**: Thường đặt ở phía trên danh sách truyện hoặc ở một sidebar.
2.  **Thành phần UI**: Sử dụng các dropdown (`<select>`), checkbox group, radio button group, hoặc các nút bấm.
    *   **Sắp xếp**: Thường là một dropdown (ví dụ: "Sắp xếp theo: Mới nhất").
    *   **Bộ lọc**: Có thể là nhiều dropdowns (ví dụ: "Trạng thái: Tất cả", "Thể loại: Hành động") hoặc một panel bộ lọc chi tiết hơn.
    *   Dokiraw sử dụng các dropdown cho "ジャンル" (Thể loại), "フィルター" (Bộ lọc - có thể bao gồm các tùy chọn nâng cao), "状態" (Trạng thái).

### Bước 2.3: Quản lý Trạng thái Bộ lọc và Sắp xếp

Trạng thái của các bộ lọc và tùy chọn sắp xếp cần được quản lý và phản ánh trên URL để người dùng có thể chia sẻ hoặc bookmark kết quả.

1.  **Sử dụng Query Parameters trên URL**: Đây là cách phổ biến và tốt cho SEO.
    *   Ví dụ: `/comics/genre/action?status=ongoing&sort=views_desc&page=1`
    *   `status=ongoing`: Lọc theo trạng thái "Đang tiến hành".
    *   `sort=views_desc`: Sắp xếp theo lượt xem giảm dần.
2.  **Tạo Component `FilterSortControls`**: Tạo một Client Component (`"use client";`) để quản lý các input này.
    ```tsx
    // src/components/filters/FilterSortControls.tsx
    "use client";

    import { useRouter, usePathname, useSearchParams } from "next/navigation";
    import { useState, useEffect } from "react";

    interface FilterSortControlsProps {
      // Có thể truyền vào các tùy chọn mặc định hoặc danh sách các tùy chọn có sẵn từ server
      availableGenres?: { id: string; name: string }[];
      availableStatuses?: { id: string; name: string }[];
    }

    export default function FilterSortControls({ availableGenres, availableStatuses }: FilterSortControlsProps) {
      const router = useRouter();
      const pathname = usePathname();
      const searchParams = useSearchParams();

      // Khởi tạo state từ URL params hoặc giá trị mặc định
      const [currentSort, setCurrentSort] = useState(searchParams.get("sort") || "updated_at_desc");
      const [currentStatus, setCurrentStatus] = useState(searchParams.get("status") || "all");
      // Thêm các state cho các bộ lọc khác nếu cần

      const handleFilterOrSortChange = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", currentSort);
        params.set("status", currentStatus);
        // Luôn reset về trang 1 khi thay đổi bộ lọc/sắp xếp để tránh lỗi không có kết quả
        params.set("page", "1"); 
        router.push(`${pathname}?${params.toString()}`);
      };

      // Gọi handleFilterOrSortChange khi state thay đổi
      // Có thể dùng một nút "Áp dụng" hoặc tự động áp dụng sau một khoảng debounce
      // Ví dụ: áp dụng khi người dùng chọn xong

      return (
        <div className="mb-4 p-4 bg-gray-800 rounded-md flex flex-wrap gap-4 items-center">
          {/* Dropdown Sắp xếp */}
          <div>
            <label htmlFor="sort-select" className="mr-2 text-sm text-gray-300">Sắp xếp:</label>
            <select 
              id="sort-select"
              value={currentSort}
              onChange={(e) => setCurrentSort(e.target.value)} 
              // onBlur={handleFilterOrSortChange} // Hoặc có nút Áp dụng
              className="p-2 rounded-md bg-gray-700 text-white text-sm"
            >
              <option value="updated_at_desc">Mới cập nhật</option>
              <option value="created_at_desc">Mới đăng</option>
              <option value="views_desc">Xem nhiều</option>
              <option value="rating_desc">Đánh giá cao</option>
              <option value="name_asc">Tên A-Z</option>
            </select>
          </div>

          {/* Dropdown Lọc theo Trạng thái */}
          {availableStatuses && (
            <div>
              <label htmlFor="status-select" className="mr-2 text-sm text-gray-300">Trạng thái:</label>
              <select 
                id="status-select"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="p-2 rounded-md bg-gray-700 text-white text-sm"
              >
                <option value="all">Tất cả</option>
                {availableStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          )}
          {/* Thêm các bộ lọc khác */}
          <button 
            onClick={handleFilterOrSortChange} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Áp dụng
          </button>
        </div>
      );
    }
    ```

### Bước 2.4: Cập nhật Trang Danh sách để Sử dụng Bộ lọc/Sắp xếp

Trang danh sách (ví dụ: `src/app/comics/genre/[genreSlug]/page.tsx` hoặc `src/app/search/page.tsx`) cần đọc các query parameters này và truyền chúng vào API call.

1.  **Đọc Query Parameters**: Trong Server Component của trang danh sách, truy cập `searchParams`.
    ```typescript
    // Ví dụ trong src/app/comics/genre/[genreSlug]/page.tsx
    export default async function GenrePage(
      { params, searchParams }: 
      { params: { genreSlug: string }, 
        searchParams?: { sort?: string; status?: string; page?: string } 
      }
    ) {
      const genre = params.genreSlug;
      const sortOption = searchParams?.sort || "updated_at_desc";
      const statusFilter = searchParams?.status || "all";
      const currentPage = parseInt(searchParams?.page || "1", 10);

      // Gọi API với các tham số này
      const comicsData = await fetchComicsByGenre(genre, { 
        sort: sortOption, 
        status: statusFilter, 
        page: currentPage 
      });
      // ... render FilterSortControls và danh sách truyện
      return (
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Truyện Thể Loại: {genre}</h1>
          {/* Truyền các tùy chọn có sẵn nếu cần */}
          <FilterSortControls /> 
          {/* Hiển thị danh sách truyện và phân trang */}
        </main>
      );
    }
    ```
2.  **Truyền Tham số vào API**: Hàm fetch dữ liệu (ví dụ: `fetchComicsByGenre`) cần chấp nhận các tham số lọc và sắp xếp để xây dựng query API tương ứng.
    ```typescript
    async function fetchComicsByGenre(genreSlug: string, options: { sort: string, status: string, page: number }) {
      const apiUrl = new URL(`https://your-api.com/comics/genre/${genreSlug}`);
      apiUrl.searchParams.append("sort", options.sort);
      if (options.status !== "all") {
        apiUrl.searchParams.append("status", options.status);
      }
      apiUrl.searchParams.append("page", options.page.toString());
      apiUrl.searchParams.append("limit", "20"); // Số lượng item mỗi trang

      const res = await fetch(apiUrl.toString(), { next: { revalidate: 300 } }); // ISR 5 phút
      if (!res.ok) throw new Error("Failed to fetch comics for genre");
      return res.json(); // Giả sử API trả về { data: [...], totalPages: X }
    }
    ```

### Bước 2.5: Xử lý phía Backend (API)

API backend của bạn phải có khả năng xử lý các tham số lọc và sắp xếp này trong truy vấn cơ sở dữ liệu.

1.  **Phân tích Query Parameters**: API endpoint nhận các tham số như `sort`, `status`, `genre`, v.v.
2.  **Xây dựng Truy vấn Động**: Dựa trên các tham số, xây dựng truy vấn SQL (hoặc NoSQL query) tương ứng để lọc và sắp xếp dữ liệu từ database.
    *   Ví dụ: Nếu `sort=views_desc`, thêm `ORDER BY views DESC` vào câu SQL.
    *   Nếu `status=ongoing`, thêm `WHERE status = 'ongoing'`.

### Bước 2.6: Cập nhật Phân Trang (Pagination)

Component Phân trang cần nhận biết được các tham số lọc và sắp xếp hiện tại để khi người dùng chuyển trang, các tùy chọn này vẫn được giữ nguyên.

1.  Khi tạo link cho các trang trong component Pagination, đảm bảo bao gồm tất cả các query parameters hiện tại (ngoại trừ `page` sẽ được thay đổi).
    ```typescript
    // Trong Pagination component
    // baseUrl có thể là `/comics/genre/action?status=ongoing&sort=views_desc`
    // Sau đó chỉ cần append `&page=NUMBER`
    const createPageUrl = (pageNumber: number) => {
      const params = new URLSearchParams(searchParams.toString()); // Lấy từ useSearchParams()
      params.set("page", pageNumber.toString());
      return `${pathname}?${params.toString()}`;
    };
    ```

### Bước 2.7: Styling và Trải nghiệm Người dùng

1.  **Phản hồi Trực quan**: Khi người dùng thay đổi bộ lọc/sắp xếp, giao diện cần cập nhật để phản ánh sự thay đổi (ví dụ: hiển thị loading spinner trong khi tải lại dữ liệu).
2.  **Clear Filters**: Cung cấp một nút "Xóa bộ lọc" để người dùng dễ dàng quay lại trạng thái mặc định.
3.  **Lưu trữ Tùy chọn (Nâng cao)**: Cân nhắc lưu trữ tùy chọn lọc/sắp xếp cuối cùng của người dùng vào `localStorage` để họ có trải nghiệm nhất quán giữa các phiên (tuy nhiên, URL vẫn là nguồn chân lý chính).

## 3. Lưu ý Quan trọng

*   **Performance**: Các truy vấn cơ sở dữ liệu với nhiều bộ lọc và sắp xếp có thể trở nên chậm. Đảm bảo có các index phù hợp trên các cột được lọc và sắp xếp trong database.
*   **Độ phức tạp của UI**: Giữ cho UI của bộ lọc đơn giản và dễ hiểu. Quá nhiều tùy chọn có thể làm người dùng bối rối.
*   **Server vs. Client State**: Cố gắng giữ các giá trị lọc/sắp xếp chính trong URL (quản lý bởi Server Components hoặc `getServerSideProps`). Client Components chỉ nên đọc từ URL và cập nhật URL khi người dùng thay đổi lựa chọn.
*   **API Design**: API cần linh hoạt để chấp nhận nhiều kết hợp bộ lọc và sắp xếp.

Bằng cách triển khai các bước này, bạn có thể cung cấp cho người dùng khả năng kiểm soát mạnh mẽ đối với cách họ duyệt và khám phá nội dung truyện tranh trên trang web của bạn.
