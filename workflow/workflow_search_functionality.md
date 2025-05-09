# Workflow Kỹ thuật: Chức năng Tìm kiếm (Search Functionality) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Chức năng Tìm kiếm cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Chức năng này cho phép người dùng tìm kiếm truyện dựa trên từ khóa.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

Chức năng tìm kiếm thường bao gồm hai phần chính: Thanh tìm kiếm (SearchBar UI) và Trang hiển thị kết quả tìm kiếm.

### Phần A: Thanh Tìm Kiếm (SearchBar Component)

Thanh tìm kiếm thường được đặt trong Header.

#### Bước 2.A.1: Tạo Component `SearchBar`

1.  **Tạo File Component**: `src/components/features/SearchBar.tsx`.
2.  **Client Component**: Đánh dấu là `"use client";` vì nó sẽ xử lý input của người dùng và điều hướng.
3.  **State cho Input**: Sử dụng `useState` để quản lý giá trị của ô tìm kiếm.
    ```tsx
    // src/components/features/SearchBar.tsx
    "use client";

    import { useState, FormEvent } from "react";
    import { useRouter } from "next/navigation"; // Sử dụng App Router
    // Hoặc import { useRouter } from "next/router"; // Nếu dùng Pages Router

    export default function SearchBar() {
      const [searchTerm, setSearchTerm] = useState("");
      const router = useRouter();

      const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchTerm.trim()) {
          router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
      };

      return (
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="search" // type="search" cho phép nút 'x' để xóa input trên một số trình duyệt
            placeholder="作品名で探す..." // "Tìm theo tên tác phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md text-sm"
          >
            Tìm
          </button>
        </form>
      );
    }
    ```
4.  **Xử lý Submit Form**: Khi form được submit:
    *   Ngăn chặn hành vi mặc định của form.
    *   Lấy giá trị từ ô tìm kiếm.
    *   Sử dụng `router.push()` để điều hướng người dùng đến trang kết quả tìm kiếm (ví dụ: `/search`) với từ khóa tìm kiếm dưới dạng query parameter (ví dụ: `/search?q=your_keyword`).
    *   Sử dụng `encodeURIComponent` cho từ khóa để đảm bảo URL hợp lệ.
5.  **Styling**: Tạo kiểu cho ô input và nút tìm kiếm (ví dụ: sử dụng Tailwind CSS).

#### Bước 2.A.2: Tích hợp `SearchBar` vào Header

1.  Import và render component `SearchBar` trong component `Header` (đã mô tả trong workflow của Header).

### Phần B: Trang Kết Quả Tìm Kiếm

Đây là trang hiển thị danh sách các truyện phù hợp với từ khóa tìm kiếm.

#### Bước 2.B.1: Tạo Route cho Trang Kết Quả Tìm Kiếm

1.  **App Router**: Tạo thư mục và file `src/app/search/page.tsx`.
2.  **Pages Router**: Tạo file `src/pages/search.tsx`.

#### Bước 2.B.2: Lấy Từ Khóa Tìm Kiếm từ URL

Trang này cần đọc query parameter `q` từ URL để biết người dùng đang tìm kiếm gì.

1.  **App Router (Server Component)**: `page.tsx` nhận `searchParams` làm prop.
    ```typescript
    // src/app/search/page.tsx
    // Component này có thể là Server Component để fetch dữ liệu
    import ComicCard from "@/components/comics/ComicCard";
    // import Pagination from "@/components/ui/Pagination";

    async function fetchSearchResults(query: string, page: number = 1) {
      if (!query) return { data: [], totalPages: 0 };
      const res = await fetch(`https://your-api.com/comics/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`, {
        next: { revalidate: 60 } // Cache kết quả trong 1 phút
      });
      if (!res.ok) {
        // Xử lý lỗi, ví dụ: throw new Error hoặc trả về một object lỗi
        console.error("Failed to fetch search results");
        return { data: [], totalPages: 0 }; 
      }
      return res.json(); // Giả sử API trả về { data: [...], totalPages: X }
    }

    export default async function SearchResultsPage({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
      const query = searchParams?.q || "";
      const currentPage = parseInt(searchParams?.page || "1", 10);
      
      const results = await fetchSearchResults(query, currentPage);
      const comics = results.data;

      return (
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">
            Kết quả tìm kiếm cho: <span className="text-blue-400">{query}</span>
          </h1>
          
          {comics && comics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {comics.map((comic: any) => (
                <ComicCard key={comic.id} comic={comic} />
              ))}
            </div>
          ) : (
            <p>Không tìm thấy kết quả nào phù hợp với từ khóa "{query}".</p>
          )}

          {/* {results.totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={results.totalPages} baseUrl={`/search?q=${encodeURIComponent(query)}`} />
          )} */}
        </main>
      );
    }
    ```
2.  **Pages Router**: Sử dụng `useRouter` hook từ `next/router` trong `useEffect` hoặc `getServerSideProps`.

#### Bước 2.B.3: Fetch Dữ liệu Kết Quả Tìm Kiếm

1.  **Gọi API**: Dựa trên từ khóa lấy được, gọi API backend để lấy danh sách truyện phù hợp.
    *   API endpoint có thể là `/api/search?q=keyword` hoặc một endpoint backend riêng.
2.  **Server-Side Fetching (Khuyến nghị)**:
    *   **App Router**: `page.tsx` mặc định là Server Component, bạn có thể `await` trực tiếp hàm fetch dữ liệu.
    *   **Pages Router**: Sử dụng `getServerSideProps` để fetch dữ liệu trên server trước khi render trang.
3.  **Client-Side Fetching (Ít khuyến nghị hơn cho SEO và UX ban đầu)**: Sử dụng `useEffect` và `useState` để fetch dữ liệu phía client. Cần xử lý trạng thái loading.

#### Bước 2.B.4: Hiển thị Kết Quả Tìm Kiếm

1.  **Sử dụng `ComicCard`**: Tái sử dụng component `ComicCard` để hiển thị mỗi truyện trong kết quả.
2.  **Bố cục Lưới**: Sắp xếp các `ComicCard` theo bố cục lưới (grid layout).
3.  **Thông báo "Không có kết quả"**: Nếu không tìm thấy truyện nào, hiển thị thông báo phù hợp.
4.  **Hiển thị Từ Khóa Tìm Kiếm**: Hiển thị lại từ khóa người dùng đã tìm kiếm trên trang.

#### Bước 2.B.5: Phân Trang (Pagination)

(Chi tiết sẽ có trong workflow riêng cho "Phân trang")

1.  Nếu API hỗ trợ phân trang, triển khai component Phân trang để người dùng có thể duyệt qua nhiều trang kết quả.
2.  Truyền query `q` và `page` trong URL khi chuyển trang.

#### Bước 2.B.6: Tối ưu hóa SEO cho Trang Kết Quả Tìm Kiếm

1.  **Metadata Động**: Tạo `title` và `description` động dựa trên từ khóa tìm kiếm.
    *   **App Router**: Sử dụng hàm `generateMetadata`.
    ```typescript
    // src/app/search/page.tsx
    import type { Metadata, ResolvingMetadata } from 'next';

    type Props = {
      searchParams: { [key: string]: string | string[] | undefined }
    }

    export async function generateMetadata(
      { searchParams }: Props,
      parent: ResolvingMetadata
    ): Promise<Metadata> {
      const query = searchParams?.q || '';
      return {
        title: `Kết quả tìm kiếm cho "${query}" - Tên Trang Web`,
        description: `Tìm kiếm truyện tranh với từ khóa "${query}" trên Tên Trang Web.`,
        // Ngăn chặn index các trang tìm kiếm không có kết quả hoặc query rỗng nếu muốn
        // robots: { index: !!query && results.length > 0, follow: true }
      }
    }
    ```
    *   **Pages Router**: Sử dụng `<Head>` và truyền props từ `getServerSideProps`.
2.  **Canonical URL**: Cân nhắc sử dụng thẻ canonical nếu có nhiều URL biến thể cho cùng một kết quả tìm kiếm (ví dụ: do sắp xếp, bộ lọc).
3.  **Noindex cho trang tìm kiếm rỗng/ít giá trị**: Nếu một trang tìm kiếm không có kết quả hoặc từ khóa quá chung chung, bạn có thể muốn thêm `noindex` tag để tránh Google index các trang chất lượng thấp.

## 3. Lưu ý Quan trọng

*   **Debouncing/Throttling (Nâng cao)**: Nếu bạn muốn triển khai tìm kiếm gợi ý (autocomplete) hoặc tìm kiếm khi người dùng gõ, hãy sử dụng kỹ thuật debouncing hoặc throttling để hạn chế số lần gọi API.
*   **Bảo mật**: Luôn sanitize (làm sạch) input của người dùng ở phía backend trước khi thực hiện truy vấn vào cơ sở dữ liệu để tránh các lỗ hổng như SQL injection.
*   **Trải nghiệm Người dùng**: Cung cấp phản hồi nhanh chóng. Nếu tìm kiếm mất thời gian, hiển thị chỉ báo loading.
*   **API Design**: API tìm kiếm phía backend cần được tối ưu để trả về kết quả nhanh chóng, có thể sử dụng các công cụ tìm kiếm chuyên dụng như Elasticsearch hoặc Algolia nếu lượng dữ liệu lớn.

Bằng cách làm theo các bước này, bạn có thể xây dựng một chức năng tìm kiếm mạnh mẽ và thân thiện với người dùng cho trang web truyện tranh của mình bằng Next.js.
