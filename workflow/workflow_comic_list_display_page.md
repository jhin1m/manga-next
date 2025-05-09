# Workflow Kỹ thuật: Trang Hiển thị Danh sách Truyện (Comic List Display Page) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Trang Hiển thị Danh sách Truyện (ví dụ: trang thể loại, trang truyện mới nhất, trang truyện thịnh hành) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Trang này sẽ hiển thị một danh sách các truyện tranh dựa trên một tiêu chí cụ thể (ví dụ: thể loại, mới cập nhật) và thường bao gồm các chức năng như bộ lọc, sắp xếp, và phân trang.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Định nghĩa Dynamic Routes cho Trang Danh sách

Các trang danh sách thường là dynamic, ví dụ, dựa trên slug của thể loại hoặc một tiêu chí như "newest".

1.  **App Router (Khuyến nghị)**:
    *   **Trang Thể loại**: Tạo cấu trúc thư mục như `src/app/genre/[genreSlug]/page.tsx`. `[genreSlug]` sẽ là tham số động.
    *   **Trang "Mới Nhất" / "Thịnh Hành"**: Có thể là các route cố định như `src/app/newest/page.tsx` hoặc `src/app/trending/page.tsx`.
2.  **Pages Router**:
    *   **Trang Thể loại**: `src/pages/genre/[genreSlug].tsx`.
    *   **Trang "Mới Nhất" / "Thịnh Hành"**: `src/pages/newest.tsx`, `src/pages/trending.tsx`.

### Bước 2.2: Fetch Dữ liệu cho Danh sách Truyện

Trang này cần fetch danh sách truyện dựa trên route (ví dụ: `genreSlug`) và các query parameters (cho bộ lọc, sắp xếp, phân trang).

1.  **Xác định Nguồn Dữ liệu**: API backend.
2.  **Hàm Fetch Dữ liệu (Server Component trong App Router hoặc `getServerSideProps` trong Pages Router)**:
    *   Hàm này sẽ nhận `genreSlug` (hoặc tiêu chí khác) và các `searchParams` (ví dụ: `sort`, `status`, `page`).
    *   Gọi API backend với các tham số này để lấy danh sách truyện và thông tin phân trang (tổng số trang).
    ```typescript
    // Ví dụ trong src/app/genre/[genreSlug]/page.tsx (Server Component)
    async function fetchComicsByCriteria(criteria: { type: string; value: string }, options: { sort: string; status: string; page: number; limit: number }) {
      let apiUrl = new URL("https://your-api.com/comics");
      if (criteria.type === "genre") {
        apiUrl = new URL(`https://your-api.com/comics/genre/${criteria.value}`);
      } else if (criteria.type === "newest") {
        apiUrl = new URL(`https://your-api.com/comics/newest`); // Hoặc dùng sort
      } // Thêm các trường hợp khác

      apiUrl.searchParams.append("sort", options.sort);
      if (options.status !== "all") {
        apiUrl.searchParams.append("status", options.status);
      }
      apiUrl.searchParams.append("page", options.page.toString());
      apiUrl.searchParams.append("limit", options.limit.toString());

      const res = await fetch(apiUrl.toString(), {
        next: { revalidate: 300 }, // ISR 5 phút, điều chỉnh nếu cần
      });
      if (!res.ok) throw new Error(`Failed to fetch comics for ${criteria.type}: ${criteria.value}`);
      return res.json(); // Giả sử API trả về { data: ComicType[], totalPages: number, currentPage: number, totalComics: number }
    }
    ```

### Bước 2.3: Xây dựng Giao diện Trang Danh sách

Trong file page tương ứng (ví dụ: `src/app/genre/[genreSlug]/page.tsx`).

1.  **Truy cập Tham số Route và Query**: Lấy `genreSlug` từ `params` và các tùy chọn lọc/sắp xếp/phân trang từ `searchParams`.
2.  **Hiển thị Tiêu đề Trang**: Ví dụ: "Truyện Thể loại: Hành Động" hoặc "Truyện Mới Cập Nhật".
3.  **Tích hợp `FilterSortControls` Component**: (Đã mô tả trong workflow riêng)
    *   Render component này để người dùng có thể thay đổi bộ lọc và sắp xếp.
    *   Truyền các tùy chọn có sẵn (ví dụ: danh sách thể loại con, trạng thái) nếu cần.
4.  **Hiển thị Lưới Truyện (Grid of `ComicCard`s)**:
    *   Lấy mảng dữ liệu truyện từ kết quả fetch.
    *   Sử dụng `map` để render một `ComicCard` component (đã mô tả trong workflow riêng) cho mỗi truyện.
    *   Sử dụng Tailwind CSS (hoặc tương đương) để tạo bố cục lưới (ví dụ: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`).
5.  **Thông báo "Không có truyện"**: Nếu không có truyện nào phù hợp với tiêu chí, hiển thị thông báo thân thiện.
6.  **Tích hợp `Pagination` Component**: (Đã mô tả trong workflow riêng)
    *   Render component này nếu `totalPages > 1`.
    *   Truyền `currentPage`, `totalPages`, và `baseUrl` (bao gồm các query params hiện tại cho lọc/sắp xếp) vào component Pagination.

    ```tsx
    // src/app/genre/[genreSlug]/page.tsx (hoặc các trang danh sách khác)
    import ComicCard from "@/components/comics/ComicCard";
    import FilterSortControls from "@/components/filters/FilterSortControls";
    import Pagination from "@/components/ui/Pagination";
    import type { Metadata } from 'next';

    // (Hàm fetchComicsByCriteria đã định nghĩa ở trên)

    // Hàm generateMetadata để tạo metadata động (SEO)
    export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
      const genreName = params.genreSlug; // Cần hàm để lấy tên thể loại từ slug
      // Hoặc title cố định cho trang /newest, /trending
      return {
        title: `Truyện Thể loại ${genreName || 'Mới Nhất'} - Trang ${searchParams?.page || 1}`,
        description: `Danh sách truyện tranh thể loại ${genreName || 'Mới Nhất'} được cập nhật thường xuyên.`,
      };
    }

    interface PageProps {
      params: { genreSlug?: string; listType?: string }; // listType cho /newest, /trending
      searchParams?: { sort?: string; status?: string; page?: string };
    }

    export default async function ComicListPage({ params, searchParams }: PageProps) {
      const criteriaType = params.genreSlug ? "genre" : (params.listType || "newest");
      const criteriaValue = params.genreSlug || params.listType || "newest";
      
      const sortOption = searchParams?.sort || "updated_at_desc";
      const statusFilter = searchParams?.status || "all";
      const currentPage = parseInt(searchParams?.page || "1", 10);
      const limitPerPage = 20;

      const comicData = await fetchComicsByCriteria(
        { type: criteriaType, value: criteriaValue }, 
        { sort: sortOption, status: statusFilter, page: currentPage, limit: limitPerPage }
      );

      const comics = comicData.data;
      const totalPages = comicData.totalPages;

      // Lấy tên thể loại đầy đủ từ slug để hiển thị (nếu là trang thể loại)
      const pageTitle = criteriaType === "genre" ? `Thể loại: ${criteriaValue}` : (criteriaValue === "newest" ? "Mới Cập Nhật" : "Thịnh Hành");

      return (
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
          
          <FilterSortControls /> {/* Truyền props nếu cần */}

          {comics && comics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {comics.map((comic: any) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          ) : (
            <p className="mt-6">Không tìm thấy truyện nào phù hợp.</p>
          )}

          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              // baseUrl sẽ được xây dựng trong component Pagination dựa trên pathname và searchParams hiện tại
            />
          )}
        </main>
      );
    }
    ```

### Bước 2.4: Tối ưu hóa SEO cho Trang Danh sách

1.  **Metadata Động**: Sử dụng hàm `generateMetadata` (App Router) hoặc `getServerSideProps` cùng với `<Head>` (Pages Router) để tạo `title` và `description` động.
    *   Ví dụ: `title` có thể bao gồm tên thể loại và số trang hiện tại.
    *   `description` mô tả nội dung của trang danh sách.
2.  **Canonical URLs**: Đảm bảo mỗi trang danh sách (kể cả các trang phân trang) có một URL canonical chính xác để tránh trùng lặp nội dung.
    *   Next.js thường xử lý tốt việc này, nhưng cần kiểm tra.
3.  **Link `rel="prev"` và `rel="next"`**: Cho các trang phân trang, thêm các thẻ link này vào `<head>` để giúp công cụ tìm kiếm hiểu mối quan hệ giữa các trang.
    *   Điều này có thể được thực hiện trong `generateMetadata` hoặc trong component `Pagination` nếu nó có quyền truy cập để sửa đổi head.

### Bước 2.5: Xử lý Trạng thái Loading và Error

1.  **App Router (Server Components)**:
    *   Next.js hỗ trợ streaming UI với `Suspense`. Bạn có thể bọc phần hiển thị danh sách truyện trong `<Suspense fallback={<LoadingSkeleton />}>`.
    *   Tạo file `loading.tsx` trong cùng thư mục route (ví dụ: `src/app/genre/[genreSlug]/loading.tsx`) để Next.js tự động hiển thị UI này trong khi dữ liệu đang được fetch.
    *   Tạo file `error.tsx` để xử lý lỗi từ việc fetch dữ liệu hoặc render.
2.  **Pages Router (`getServerSideProps`)**: Nếu fetch lỗi, bạn có thể trả về `notFound: true` hoặc truyền một prop lỗi để hiển thị thông báo trên trang.

## 3. Các Thành phần Con Quan trọng (Sẽ có workflow riêng hoặc đã có)

*   **`ComicCard.tsx`**: Hiển thị thông tin tóm tắt của một truyện.
*   **`FilterSortControls.tsx`**: Cung cấp UI cho việc lọc và sắp xếp.
*   **`Pagination.tsx`**: Xử lý điều hướng giữa các trang kết quả.

## 4. Lưu ý Quan trọng

*   **Performance**: Tối ưu hóa API backend để trả về dữ liệu nhanh chóng. Sử dụng ISR hoặc caching phù hợp cho dữ liệu ít thay đổi.
*   **UX**: Đảm bảo các bộ lọc và phân trang dễ sử dụng. Cung cấp phản hồi rõ ràng khi người dùng tương tác.
*   **Khả năng mở rộng**: Thiết kế các component và logic fetch dữ liệu một cách linh hoạt để dễ dàng thêm các loại trang danh sách mới hoặc các tiêu chí lọc/sắp xếp mới.

Bằng cách tuân theo các bước này, bạn có thể xây dựng các trang danh sách truyện mạnh mẽ, linh hoạt và thân thiện với người dùng cho ứng dụng Next.js của mình.
