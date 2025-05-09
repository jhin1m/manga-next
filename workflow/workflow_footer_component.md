# Workflow Kỹ thuật: Component Footer - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Component Footer (Chân trang) có thể tái sử dụng cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Footer thường chứa các liên kết thông tin, bản quyền, và đôi khi là các liên kết mạng xã hội.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Tạo File Component `Footer`

1.  **Vị trí File**: `src/components/layout/Footer.tsx` (hoặc một thư mục layout chung khác).
2.  **Props Interface**: Footer thường không cần nhiều props, nhưng có thể có nếu bạn muốn tùy chỉnh nội dung động (ví dụ: năm bản quyền).
    ```typescript
    // src/components/layout/Footer.tsx
    import Link from "next/link";

    interface FooterLink {
      href: string;
      label: string;
    }

    // Footer có thể không cần props nếu nội dung là tĩnh
    // interface FooterProps {
    //   // Ví dụ: companyName?: string;
    // }

    export default function Footer(/* { companyName = "Tên Trang Web" }: FooterProps */) {
      const currentYear = new Date().getFullYear();
      const footerLinks: FooterLink[] = [
        { href: "/about", label: "Giới thiệu" },
        { href: "/terms", label: "Điều khoản dịch vụ" },
        { href: "/privacy", label: "Chính sách riêng tư" },
        { href: "/contact", label: "Liên hệ" },
        // Thêm các link khác nếu cần
      ];

      // ... implementation
    }
    ```

### Bước 2.2: Thiết kế Cấu trúc HTML và Styling

1.  **Thẻ Bao bọc Chính**: Sử dụng thẻ `<footer>` làm thẻ ngữ nghĩa chính.
2.  **Nội dung Footer**: Chia Footer thành các phần nếu cần (ví dụ: một hàng cho các link, một hàng cho thông tin bản quyền).
    *   **Liên kết Thông tin**: Hiển thị danh sách các liên kết (ví dụ: Giới thiệu, Điều khoản, Chính sách riêng tư) sử dụng `next/link`.
    *   **Thông tin Bản quyền**: Hiển thị thông báo bản quyền (ví dụ: `© [Năm] Tên Trang Web. All rights reserved.`).
    *   **Liên kết Mạng xã hội (Tùy chọn)**: Hiển thị các icon link đến trang mạng xã hội.
3.  **Styling với Tailwind CSS (hoặc tương đương)**:
    *   Định dạng layout (ví dụ: sử dụng Flexbox để căn chỉnh các item), màu sắc, kích thước chữ.
    *   Đảm bảo Footer có thiết kế responsive.

    ```tsx
    // Bên trong Footer function
    // ... (sau khi định nghĩa currentYear và footerLinks)
    export default function Footer() {
      const currentYear = new Date().getFullYear();
      const footerLinks: FooterLink[] = [
        { href: "/p/about-us", label: "Về chúng tôi" },
        { href: "/p/terms-of-service", label: "Điều khoản" },
        { href: "/p/privacy-policy", label: "Riêng tư" },
        { href: "/p/contact", label: "Liên hệ" },
      ];

      return (
        <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
          <div className="container mx-auto px-4">
            {/* Hàng chứa các link */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
              {footerLinks.map((linkItem) => (
                <Link key={linkItem.href} href={linkItem.href} className="text-sm hover:text-white hover:underline">
                  {linkItem.label}
                </Link>
              ))}
            </div>

            {/* Hàng chứa thông tin bản quyền và có thể là logo nhỏ */}
            <div className="text-center text-xs">
              <p>&copy; {currentYear} Tên Trang Web Của Bạn. Bảo lưu mọi quyền.</p>
              <p className="mt-1">Nội dung trên trang được tổng hợp từ nhiều nguồn trên internet và chỉ mang tính chất tham khảo.</p>
              {/* Có thể thêm logo nhỏ ở đây */}
            </div>

            {/* (Tùy chọn) Liên kết mạng xã hội */}
            {/* <div className="flex justify-center space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="hover:text-white"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter" className="hover:text-white"><i className="fab fa-twitter"></i></a>
            </div> */}
          </div>
        </footer>
      );
    }
    ```

### Bước 2.3: Tích hợp Component `Footer` vào Layout Chính

Footer thường là một phần của layout chung của trang web, xuất hiện trên mọi trang.

1.  **Trong `src/app/layout.tsx` (App Router)**:
    ```tsx
    // src/app/layout.tsx
    import Header from "@/components/layout/Header"; // Giả sử bạn có Header
    import Footer from "@/components/layout/Footer";
    import "@/app/globals.css"; // Global styles
    import type { Metadata } from "next";

    export const metadata: Metadata = {
      title: "Tên Trang Web Của Bạn",
      description: "Đọc truyện tranh online miễn phí",
    };

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="vi">
          <body className="bg-gray-900 text-gray-100 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </body>
        </html>
      );
    }
    ```
2.  **Trong `src/pages/_app.tsx` (Pages Router)**: Nếu bạn sử dụng Pages Router, bạn sẽ import và render `Footer` trong component `_app.tsx` bên ngoài `{Component {...pageProps}}`.

### Bước 2.4: Responsive Design

1.  **Flexbox/Grid cho Layout**: Sử dụng `flex-wrap` cho danh sách link để chúng tự động xuống hàng trên màn hình nhỏ.
2.  **Căn chỉnh Text**: Đảm bảo text được căn giữa hoặc căn đều một cách hợp lý trên các kích thước màn hình khác nhau.
3.  **Kích thước Font**: Có thể điều chỉnh kích thước font chữ cho phù hợp với màn hình nhỏ.

## 3. Lưu ý Quan trọng

*   **Nội dung Tĩnh và Động**: Hầu hết nội dung footer là tĩnh. Năm bản quyền là một ví dụ về nội dung động đơn giản.
*   **Accessibility (A11y)**: Đảm bảo các link có text rõ ràng. Nếu sử dụng icon cho link mạng xã hội, cung cấp `aria-label`.
*   **Đơn giản và Sạch sẽ**: Footer không nên quá phức tạp hoặc chứa quá nhiều thông tin gây rối. Mục tiêu chính là cung cấp các thông tin pháp lý và điều hướng cơ bản.
*   **Vị trí "Dính" (Sticky Footer)**: Nếu nội dung trang ngắn, footer có thể "bay" lên giữa trang. Để footer luôn ở cuối viewport (nếu nội dung không đủ dài để đẩy nó xuống), bạn có thể sử dụng kỹ thuật "sticky footer". Với Flexbox trên `body` như ví dụ `layout.tsx` (`flex flex-col min-h-screen` và `flex-grow` cho `main`), footer sẽ tự động được đẩy xuống cuối.

Component Footer là một phần tiêu chuẩn của hầu hết các trang web. Việc tạo ra một component `Footer` rõ ràng, dễ bảo trì và responsive sẽ góp phần hoàn thiện trải nghiệm người dùng tổng thể.
