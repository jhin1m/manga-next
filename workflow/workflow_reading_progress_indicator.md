# Workflow Kỹ thuật: Chỉ báo Tiến độ Đọc (Reading Progress Indicator) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Component Chỉ báo Tiến độ Đọc (Reading Progress Indicator) trên Trang Đọc Truyện của một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Chỉ báo này cho người dùng biết họ đã đọc được bao nhiêu phần trăm của chương truyện hiện tại hoặc đang ở trang thứ mấy trên tổng số trang.

## 2. Yêu cầu Tiên quyết

*   Component Trang Đọc Truyện (`ComicReaderClient` hoặc tương tự) đã tồn tại và hiển thị nội dung chương (tham khảo workflow "Trang Đọc Truyện").
*   Danh sách các hình ảnh của chương truyện đã được tải và hiển thị.

## 3. Các Loại Chỉ báo Tiến độ và Cách Triển khai

Có một vài cách phổ biến để hiển thị tiến độ đọc:

### Loại 1: Thanh Tiến trình Ngang (Scroll-based Progress Bar)

Hiển thị một thanh ngang (thường ở đầu hoặc cuối màn hình) thể hiện phần trăm cuộn của toàn bộ nội dung chương.

#### Bước 3.1.1: Tạo Component `ScrollProgressBar`

1.  **Vị trí File**: `src/components/reader/ScrollProgressBar.tsx`.
2.  **Client Component**: Đánh dấu `"use client";`.
3.  **State**: `scrollPercentage` (lưu trữ phần trăm đã cuộn).
4.  **Logic `useEffect` để theo dõi sự kiện cuộn**:
    *   Thêm một event listener cho sự kiện `scroll` trên `window` (hoặc trên container cuộn chính của trang đọc nếu nó không phải là `window`).
    *   Trong hàm xử lý scroll, tính toán phần trăm đã cuộn:
        *   `scrollTop = window.scrollY || document.documentElement.scrollTop` (hoặc `scrollableContainer.scrollTop`).
        *   `scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight` (hoặc `scrollableContainer.scrollHeight - scrollableContainer.clientHeight`). Đây là tổng chiều cao có thể cuộn.
        *   `percentage = (scrollTop / scrollHeight) * 100`.
    *   Cập nhật state `scrollPercentage`.
    *   Dọn dẹp event listener khi component unmount.
5.  **UI**: Một `div` làm thanh tiến trình, với chiều rộng (`width`) được style động dựa trên `scrollPercentage`.

```tsx
// src/components/reader/ScrollProgressBar.tsx
"use client";
import { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
      const currentPercentage = (scrollTop / scrollHeight) * 100;
      setScrollPercentage(currentPercentage);
    } else {
      setScrollPercentage(0); // Hoặc 100 nếu không có gì để cuộn nhưng nội dung đã tải hết
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Gọi handleScroll một lần khi mount để có giá trị ban đầu nếu trang không ở đầu
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-700 dark:bg-gray-600">
      <div 
        className="h-1 bg-blue-500 dark:bg-blue-400 transition-all duration-100 ease-linear"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
}
```

#### Bước 3.1.2: Tích hợp `ScrollProgressBar`

Đặt component này trong `ComicReaderClient.tsx` hoặc layout riêng của trang đọc.

### Loại 2: Chỉ báo "Trang X / Tổng số Trang" (Page X of Y)

Hiển thị số thứ tự của hình ảnh người dùng đang xem trên tổng số hình ảnh của chương. Dokiraw sử dụng kiểu này (ví dụ: "1/21").

#### Bước 3.2.1: Xác định Trang Hiện tại

Điều này phức tạp hơn vì nó phụ thuộc vào việc hình ảnh nào đang hiển thị trong viewport.

1.  **Sử dụng `IntersectionObserver` API**: Đây là cách hiện đại và hiệu quả để theo dõi khi nào một phần tử (trong trường hợp này là mỗi ảnh truyện) đi vào hoặc ra khỏi viewport.
2.  **Trong `ComicReaderClient.tsx` hoặc component hiển thị danh sách ảnh (`ImageDisplay`)**:
    *   **State**: `currentPageNumber` (số trang hiện tại), `totalPages` (tổng số ảnh).
    *   **`useEffect` và `IntersectionObserver`**:
        *   Tạo một `IntersectionObserver` mới.
        *   Quan sát (observe) tất cả các phần tử ảnh truyện.
        *   Khi một ảnh đi vào viewport (hoặc là ảnh "nổi bật" nhất trong viewport), cập nhật `currentPageNumber` thành số thứ tự của ảnh đó.
        *   `totalPages` sẽ là `chapterData.chapter.images.length`.

```tsx
// Trong ComicReaderClient.tsx (hoặc component con quản lý hiển thị ảnh)
"use client";
import Image from "next/image";
import ReaderNavigationBar from "./ReaderNavigationBar"; // Giả sử có thanh điều hướng
import { useState, useEffect, useRef, useCallback } from "react";

// ... (Props interface cho ComicReaderClient)

export default function ComicReaderClient({ chapterData, allChapters }) {
  const [images, setImages] = useState(chapterData.chapter.images || []);
  const totalPages = images.length;
  const [currentPage, setCurrentPage] = useState(1);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]); // Ref cho từng ảnh

  // Khởi tạo refs array
  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length);
  }, [images]);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Tìm index của ảnh đang hiển thị
        const visibleImageIndex = imageRefs.current.findIndex(ref => ref === entry.target);
        if (visibleImageIndex !== -1) {
          setCurrentPage(visibleImageIndex + 1);
        }
      }
    });
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null, // Quan sát viewport
      rootMargin: "0px",
      threshold: 0.5, // Khi 50% ảnh hiển thị thì coi là "trang hiện tại"
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    imageRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    return () => {
      imageRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [images, observerCallback]); // Re-run nếu danh sách ảnh thay đổi

  // ... (Phần còn lại của ComicReaderClient)
  return (
    <div className="bg-black min-h-screen pt-16"> {/* Giả sử navbar cao 16 */}
      <ReaderNavigationBar 
        comicInfo={chapterData.comic} 
        chapterInfo={chapterData.chapter} 
        navigationInfo={chapterData.navigation} 
        // allChapters={allChapters} 
        // Truyền currentPage và totalPages vào ReaderNavigationBar để hiển thị
        currentPageForDisplay={`${currentPage}/${totalPages}`} 
      />
      <div className="image-list-container">
        {images.map((imageUrl, index) => (
          <div 
            key={index} 
            ref={el => imageRefs.current[index] = el} // Gán ref cho từng ảnh
            className="mx-auto max-w-3xl mb-1" // Container cho mỗi ảnh
          >
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
      {/* Có thể hiển thị currentPage/totalPages ở một vị trí khác nữa */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-sm z-40">
        {currentPage} / {totalPages}
      </div>
    </div>
  );
}
```

#### Bước 3.2.2: Hiển thị Chỉ báo "X / Y"

*   Truyền `currentPage` và `totalPages` vào `ReaderNavigationBar` hoặc hiển thị nó ở một vị trí cố định khác trên màn hình (ví dụ: góc dưới bên phải như trong ví dụ trên).
*   Trong `ReaderNavigationBar`, thêm một phần tử text để hiển thị thông tin này.

### Bước 3.3: Tích hợp vào Trang Đọc Truyện

*   Nếu sử dụng **Thanh Tiến trình Ngang**, import và render `ScrollProgressBar` trong `ComicReaderClient.tsx` hoặc layout của trang đọc.
*   Nếu sử dụng **Chỉ báo "Trang X / Y"**, logic tính toán và hiển thị sẽ nằm trong `ComicReaderClient.tsx` và có thể được truyền vào `ReaderNavigationBar`.

## 4. Lưu ý Quan trọng

*   **Hiệu suất của `IntersectionObserver`**: `IntersectionObserver` rất hiệu quả, nhưng nếu có hàng trăm ảnh, hãy đảm bảo bạn quản lý observer và các ref một cách cẩn thận.
*   **Độ chính xác của "Trang hiện tại"**: Với `IntersectionObserver`, việc xác định "trang hiện tại" có thể phụ thuộc vào `threshold` và cách người dùng cuộn. Có thể cần tinh chỉnh để có trải nghiệm tốt nhất.
*   **Trải nghiệm Người dùng**: Chỉ báo tiến độ nên rõ ràng, dễ thấy nhưng không gây xao lãng.
*   **Kết hợp**: Có thể kết hợp cả hai loại chỉ báo nếu muốn (ví dụ: thanh tiến trình ở trên cùng và "X/Y" ở thanh điều hướng).
*   **Reset khi chuyển chương**: Đảm bảo rằng chỉ báo tiến độ được reset hoặc tính toán lại chính xác khi người dùng chuyển sang chương mới.

Chỉ báo tiến độ đọc là một chi tiết nhỏ nhưng hữu ích, giúp người dùng định vị được vị trí của mình trong một chương truyện dài.
