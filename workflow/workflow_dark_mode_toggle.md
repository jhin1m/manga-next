# Workflow Kỹ thuật: Chuyển đổi Chế độ Sáng/Tối (Dark Mode Toggle) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai chức năng Chuyển đổi Chế độ Sáng/Tối (Dark Mode Toggle) cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js và Tailwind CSS. Chức năng này cho phép người dùng chuyển đổi giữa giao diện sáng và tối.

## 2. Các Bước Kỹ thuật Triển khai với Next.js và Tailwind CSS

### Bước 2.1: Cấu hình Tailwind CSS cho Dark Mode

1.  **Mở `tailwind.config.js`**.
2.  **Thiết lập `darkMode` strategy thành `'class'`**: Điều này cho phép bạn kiểm soát chế độ tối bằng cách thêm hoặc xóa một class (thường là `dark`) khỏi phần tử `<html>` hoặc `<body>`.
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: 'class', // Hoặc 'media' nếu bạn muốn dựa trên cài đặt hệ thống
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      theme: {
        extend: {
          // ... các tùy chỉnh theme khác
        },
      },
      plugins: [],
    };
    ```

### Bước 2.2: Tạo Theme Provider (Sử dụng React Context)

Để quản lý và chia sẻ trạng thái theme (sáng/tối) trên toàn bộ ứng dụng, React Context là một lựa chọn tốt.

1.  **Tạo File Context**: `src/contexts/ThemeProvider.tsx`.
2.  **Định nghĩa Context**: Tạo context để lưu trữ theme hiện tại (`'light'`, `'dark'`) và hàm để chuyển đổi theme.
3.  **Tạo Provider Component**:
    *   Sử dụng `useState` để lưu trữ theme hiện tại.
    *   Sử dụng `useEffect` để:
        *   Đọc theme đã lưu từ `localStorage` khi component được mount (để duy trì theme giữa các phiên).
        *   Áp dụng class `dark` vào phần tử `<html>` khi theme thay đổi.
        *   Lưu theme hiện tại vào `localStorage` khi nó thay đổi.
    ```tsx
    // src/contexts/ThemeProvider.tsx
    "use client";

    import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

    type Theme = 'light' | 'dark';

    interface ThemeContextType {
      theme: Theme;
      toggleTheme: () => void;
    }

    const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

    export const ThemeProvider = ({ children }: { children: ReactNode }) => {
      const [theme, setTheme] = useState<Theme>('dark'); // Mặc định là dark, hoặc đọc từ localStorage

      useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
        } else {
          // Nếu muốn dựa trên prefers-color-scheme của hệ thống làm mặc định ban đầu
          // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          // setTheme(prefersDark ? 'dark' : 'light');
          setTheme('dark'); // Hoặc mặc định là 'dark'
        }
      }, []);

      useEffect(() => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
      }, [theme]);

      const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      };

      return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      );
    };

    export const useTheme = () => {
      const context = useContext(ThemeContext);
      if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
      }
      return context;
    };
    ```

### Bước 2.3: Bọc Ứng dụng với `ThemeProvider`

Trong file layout chính của bạn (`src/app/layout.tsx` cho App Router hoặc `src/pages/_app.tsx` cho Pages Router), bọc `children` hoặc `Component` bằng `ThemeProvider`.

```tsx
// src/app/layout.tsx (App Router)
import { ThemeProvider } from "@/contexts/ThemeProvider";
// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning> {/* suppressHydrationWarning nếu có lỗi mismatch class do theme ban đầu */}
      <body>
        <ThemeProvider>
          {/* Header, Main Content, Footer */}
          {/* <Header /> */}
          {/* <main>{children}</main> */}
          {/* <Footer /> */}
          {children} {/* Đơn giản hóa ví dụ, bạn sẽ có cấu trúc layout đầy đủ */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```
*Lưu ý `suppressHydrationWarning` trên thẻ `<html>`: Điều này có thể cần thiết nếu có sự không khớp class (`dark`) giữa server render ban đầu và client render sau khi theme từ `localStorage` được áp dụng. Một giải pháp tốt hơn là xử lý theme ban đầu trên server nếu có thể, hoặc chấp nhận một FOUC (Flash of Unstyled Content) nhỏ.* 

### Bước 2.4: Tạo Component Nút Chuyển đổi Theme (`ThemeToggleButton`)

1.  **Tạo File Component**: `src/components/ui/ThemeToggleButton.tsx`.
2.  **Sử dụng `useTheme` Hook**: Lấy `theme` và `toggleTheme` từ context.
3.  **Hiển thị Icon phù hợp**: Hiển thị icon mặt trời cho light mode và icon mặt trăng cho dark mode.
4.  **Gọi `toggleTheme` khi Click**: Khi nút được click, gọi hàm `toggleTheme`.
    ```tsx
    // src/components/ui/ThemeToggleButton.tsx
    "use client";

    import { useTheme } from "@/contexts/ThemeProvider";
    import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"; // Ví dụ sử dụng Heroicons

    export default function ThemeToggleButton() {
      const { theme, toggleTheme } = useTheme();

      return (
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-500" />
          )}
        </button>
      );
    }
    ```

### Bước 2.5: Sử dụng Nút Chuyển đổi Theme

Đặt `ThemeToggleButton` ở vị trí mong muốn, thường là trong Header.

```tsx
// Ví dụ trong src/components/layout/Header.tsx
// import ThemeToggleButton from "@/components/ui/ThemeToggleButton";
// ...
// <header className="...">
//   {/* ... other header content ... */}
//   <ThemeToggleButton />
// </header>
// ...
```

### Bước 2.6: Định nghĩa Styles cho Dark Mode trong Tailwind CSS

Bây giờ bạn có thể sử dụng tiền tố `dark:` trong các class Tailwind CSS để định nghĩa style cho chế độ tối.

1.  **Màu nền và Chữ**: Thay đổi màu nền và màu chữ cho các phần tử.
    ```html
    <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <!-- ... -->
    </body>
    ```
2.  **Màu Border, Component**: Điều chỉnh màu sắc cho các component khác.
    ```html
    <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
      <!-- Card content -->
    </div>
    ```
3.  **Áp dụng trên Toàn bộ Trang**: Duyệt qua các component và trang của bạn, thêm các class `dark:` cần thiết để đảm bảo giao diện nhất quán ở cả hai chế độ.

### Bước 2.7: Xử lý Flash of Unstyled Content (FOUC) - Nâng cao

Khi theme được tải từ `localStorage` phía client, có thể có một khoảnh khắc ngắn trang hiển thị với theme mặc định (ví dụ: light) trước khi JavaScript chạy và áp dụng theme đã lưu (ví dụ: dark). Điều này gọi là FOUC.

1.  **Script Chặn Render Ban đầu (Inline Script)**: Một cách phổ biến là thêm một đoạn script nhỏ vào `<head>` (trước khi CSS và body được render) để đọc `localStorage` và áp dụng class `dark` ngay lập tức.
    ```html
    // Trong src/app/layout.tsx, bên trong thẻ <body> hoặc <head>
    // <script
    //   dangerouslySetInnerHTML={{
    //     __html: `
    //       (function() {
    //         function getInitialTheme() {
    //           const storedTheme = localStorage.getItem('theme');
    //           if (storedTheme) return storedTheme;
    //           // Optional: check system preference if no stored theme
    //           // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    //           // return prefersDark ? 'dark' : 'light';
    //           return 'dark'; // Default theme if nothing else
    //         }
    //         const theme = getInitialTheme();
    //         if (theme === 'dark') {
    //           document.documentElement.classList.add('dark');
    //         }
    //       })();
    //     `,
    //   }}
    // />
    ```
    *   Đặt script này càng sớm càng tốt trong `layout.tsx`.
    *   Khi sử dụng App Router, việc chèn script trực tiếp vào `<html>` hoặc `<body>` trong `layout.tsx` có thể cần cẩn thận. Next.js 13+ có thể có các cách tiếp cận khác hoặc bạn có thể cần một component riêng để render script này.
    *   Thư viện như `next-themes` xử lý vấn đề này một cách hiệu quả.

2.  **Sử dụng Thư viện `next-themes`**: Thư viện này được thiết kế đặc biệt cho Next.js để quản lý theme và xử lý FOUC.
    *   Cài đặt: `npm install next-themes` hoặc `yarn add next-themes`.
    *   Sử dụng `ThemeProvider` từ `next-themes` và hook `useTheme`.
    *   Tham khảo tài liệu của `next-themes` để biết cách tích hợp chi tiết.

## 3. Lưu ý Quan trọng

*   **Tính nhất quán**: Đảm bảo tất cả các component và trang đều hỗ trợ tốt cả chế độ sáng và tối.
*   **Độ tương phản**: Kiểm tra độ tương phản màu sắc ở cả hai chế độ để đảm bảo tính dễ đọc và accessibility.
*   **Hình ảnh**: Cân nhắc việc có các phiên bản hình ảnh khác nhau cho chế độ tối nếu cần (ví dụ: logo, icon có nền trong suốt có thể cần điều chỉnh).
*   **Trải nghiệm Người dùng**: Cho phép người dùng dễ dàng tìm thấy và sử dụng nút chuyển đổi theme.

Chức năng Dark Mode là một tính năng phổ biến và được nhiều người dùng yêu thích. Triển khai nó một cách cẩn thận sẽ cải thiện đáng kể trải nghiệm người dùng trên trang web của bạn.
