# Workflow Kỹ thuật: Thanh Điều hướng Chính (Header Navigation) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai thành phần Thanh Điều hướng Chính (Header Navigation) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Header thường chứa logo, các liên kết điều hướng chính, ô tìm kiếm, và các nút hành động như đăng nhập/đăng ký.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Tạo Component Header

1.  **Tạo File Component**: Tạo một component React mới cho Header, ví dụ: `src/components/layout/Header.tsx`.
    *   Đây sẽ là một Client Component (`"use client";`) nếu nó chứa các tương tác phía client như menu dropdown động, hoặc quản lý trạng thái của ô tìm kiếm (nếu tìm kiếm được xử lý ngay trên header).
2.  **Cấu trúc HTML cơ bản**: Sử dụng thẻ `<header>` ngữ nghĩa. Bên trong, bố trí các khu vực cho logo, menu điều hướng, ô tìm kiếm, và các nút người dùng.
    ```tsx
    // src/components/layout/Header.tsx
    "use client"; // Nếu có tương tác client

    import Link from "next/link";
    import Image from "next/image";
    // import SearchBar from "@/components/features/SearchBar"; // Component tìm kiếm riêng
    // import UserNav from "@/components/features/UserNav";   // Component cho nút người dùng

    export default function Header() {
      // State cho menu mobile (nếu có)
      // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

      return (
        <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              {/* <Image src="/logo.png" alt="Logo Trang Web" width={150} height={40} /> */}
              DokirawClone
            </Link>

            {/* Menu Điều hướng Chính (Desktop) */}
            <div className="hidden md:flex space-x-4 items-center">
              <Link href="/newest" className="hover:text-gray-300">Mới Thêm</Link>
              <Link href="/trending" className="hover:text-gray-300">Thịnh Hành</Link>
              <Link href="/genres" className="hover:text-gray-300">Thể Loại</Link>
              {/* Thêm các link khác như dokiraw: 最高評価, 連載中, 18禁, BL, GL, Completed */}
              {/* <SearchBar /> */}
            </div>
            
            {/* Khu vực người dùng và tìm kiếm (có thể tách thành component con) */}
            <div className="flex items-center space-x-3">
                {/* <UserNav /> */}
                <Link href="/login" className="hover:text-gray-300">Đăng Nhập</Link>
                 {/* Nút mở menu mobile */}
                <button className="md:hidden focus:outline-none">
                    {/* Icon Hamburger */}
                    <svg /* ... */ />
                </button>
            </div>
          </nav>

          {/* Menu Mobile (nếu isMobileMenuOpen) */}
          {/* ... */}
        </header>
      );
    }
    ```

### Bước 2.2: Tích hợp Logo

1.  **Sử dụng `next/image`**: Nếu logo là file ảnh, sử dụng component `next/image` để tối ưu hóa.
2.  **Link về Trang Chủ**: Bọc logo trong một `next/link` trỏ về `/`.

### Bước 2.3: Xây dựng Menu Điều hướng

1.  **Xác định các Mục Menu**: Dựa trên các trang chính của dokiraw.com (Mới thêm, Thịnh hành, Đánh giá cao, Đang tiến hành, Hoàn thành, 18+, BL, GL, Danh sách manga, v.v.).
2.  **Sử dụng `next/link`**: Tạo các liên kết điều hướng bằng component `next/link` để tận dụng client-side routing và prefetching của Next.js.
3.  **Dropdown Menu (nếu cần)**: Đối với các mục như "Thể Loại" có nhiều lựa chọn con, bạn có thể triển khai menu dropdown.
    *   Sử dụng state (ví dụ: `useState` trong Client Component) để quản lý trạng thái mở/đóng của dropdown.
    *   Tạo kiểu dáng cho dropdown bằng CSS (Tailwind CSS).
4.  **Active Link Styling**: Làm nổi bật mục menu tương ứng với trang hiện tại.
    *   Sử dụng hook `usePathname` từ `next/navigation` (trong App Router) để lấy đường dẫn hiện tại và so sánh với `href` của link để áp dụng class CSS tương ứng.
    ```tsx
    // Ví dụ active link styling
    import { usePathname } from "next/navigation";
    // ...
    const pathname = usePathname();
    // ...
    <Link 
      href="/newest"
      className={`${pathname === 
      "/newest" ? "text-yellow-400 font-semibold" : "hover:text-gray-300"}`
    }>
      Mới Thêm
    </Link>
    ```

### Bước 2.4: Tích hợp Chức năng Tìm kiếm (Tổng quan)

(Chi tiết sẽ có trong workflow riêng cho "Chức năng Tìm kiếm")

1.  **Component `SearchBar`**: Tạo một component riêng cho thanh tìm kiếm.
2.  **Vị trí**: Đặt `SearchBar` trong Header.
3.  **Chức năng cơ bản**: Ô nhập liệu và nút submit. Khi submit, điều hướng đến trang kết quả tìm kiếm với query tương ứng (ví dụ: `/search?q=keyword`).

### Bước 2.5: Thêm các Nút Hành động Người dùng

1.  **Đăng nhập/Đăng ký**: Các nút/link điều hướng đến trang đăng nhập hoặc đăng ký.
2.  **Thông tin Người dùng/Menu Người dùng (sau khi đăng nhập)**: Hiển thị avatar người dùng và một menu dropdown với các tùy chọn như "Trang cá nhân", "Truyện yêu thích", "Đăng xuất".
    *   Điều này sẽ yêu cầu quản lý trạng thái xác thực người dùng (ví dụ: sử dụng React Context, Zustand, hoặc các thư viện xác thực như NextAuth.js).

### Bước 2.6: Triển khai Menu Mobile (Responsive Design)

1.  **Ẩn Menu Desktop trên Mobile**: Sử dụng các class utility của Tailwind CSS (ví dụ: `hidden md:flex`) để ẩn menu desktop trên màn hình nhỏ.
2.  **Hiển thị Nút Hamburger**: Hiển thị một nút hamburger (ví dụ: `md:hidden`) trên màn hình nhỏ.
3.  **Quản lý Trạng thái Menu Mobile**: Sử dụng `useState` để quản lý trạng thái mở/đóng của menu mobile khi người dùng nhấn nút hamburger.
4.  **Thiết kế Menu Mobile**: Khi mở, menu mobile thường hiển thị dưới dạng một panel trượt từ bên cạnh hoặc một danh sách thả xuống, chứa các link điều hướng chính.

### Bước 2.7: Tích hợp Header vào Layout Chung

1.  Trong file layout chính của ứng dụng (ví dụ: `src/app/layout.tsx` hoặc `src/app/(main)/layout.tsx`), import và render component `Header` ở vị trí phù hợp (thường là ở đầu tiên trong `<body>` hoặc trong một div bao bọc chính).
    ```tsx
    // src/app/(main)/layout.tsx
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer"; // Giả sử có Footer

    export default function MainLayout({ children }: { children: React.ReactNode }) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      );
    }
    ```

### Bước 2.8: Styling và Accessibility

1.  **Styling**: Sử dụng Tailwind CSS (hoặc framework/phương pháp CSS bạn chọn) để tạo kiểu dáng cho Header, đảm bảo tính thẩm mỹ và nhất quán với thiết kế tổng thể.
2.  **Accessibility (A11y)**: Đảm bảo Header có thể truy cập được:
    *   Sử dụng các thẻ HTML ngữ nghĩa (`<nav>`, `<button>`).
    *   Cung cấp `aria-label` cho các nút chỉ có icon (ví dụ: nút hamburger).
    *   Đảm bảo có thể điều hướng bằng bàn phím.
    *   Độ tương phản màu sắc tốt.

## 3. Lưu ý Quan trọng

*   **Performance**: Header là một phần của mọi trang. Nếu là Client Component, cố gắng giữ cho nó nhẹ nhàng, tránh logic phức tạp không cần thiết để không ảnh hưởng đến hiệu suất tải trang.
*   **Sticky Header**: Header của dokiraw.com thường "dính" ở đầu trang khi cuộn. Điều này có thể đạt được bằng cách thêm class `sticky top-0 z-50` (với Tailwind CSS) cho thẻ `<header>`.
*   **Tách biệt Concerns**: Cân nhắc tách các phần phức tạp của Header (như SearchBar, UserNav, MobileMenu) thành các component con riêng biệt để dễ quản lý và bảo trì.

Bằng cách thực hiện các bước trên, bạn có thể xây dựng một Thanh Điều hướng Chính (Header) đầy đủ chức năng và đáp ứng tốt cho trang web truyện tranh của mình bằng Next.js.
