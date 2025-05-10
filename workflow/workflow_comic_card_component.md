# Workflow Kỹ thuật: Component Card Truyện (Comic Card) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Component `ComicCard` có thể tái sử dụng cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Component này hiển thị thông tin tóm tắt của một bộ truyện và thường được sử dụng trên trang chủ, trang danh sách thể loại, kết quả tìm kiếm, v.v.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Tạo File Component `ComicCard`

1.  **Vị trí File**: Tạo component trong thư mục components, ví dụ: `src/components/comics/ComicCard.tsx`.
2.  **Props Interface**: Định nghĩa một interface cho props mà component sẽ nhận. Thông tin này thường bao gồm:
    *   `id`: ID của truyện.
    *   `title`: Tên truyện.
    *   `slug`: Slug của truyện (để tạo URL).
    *   `coverImageUrl`: URL ảnh bìa.
    *   `latestChapter` (tùy chọn): Thông tin về chương mới nhất (ví dụ: số chương, tên chương).
    *   `updatedAt` (tùy chọn): Thời gian cập nhật mới nhất.
    *   `views` (tùy chọn): Lượt xem.
    *   `status` (tùy chọn): Trạng thái truyện (ví dụ: "連載中" - Đang tiến hành, "Completed" - Hoàn thành).
    ```typescript
    // src/components/comics/ComicCard.tsx
    import Image from "next/image";
    import Link from "next/link";

    interface Comic {
      id: string | number;
      title: string;
      slug: string;
      coverImageUrl: string;
      latestChapter?: string; // Ví dụ: "Chương 120"
      latestChapterUrl?: string; // Link đến chương mới nhất
      updatedAt?: string; // Ví dụ: "19 giờ trước"
      status?: string; // Ví dụ: "連載中"
      // Thêm các trường khác nếu cần
    }

    interface ComicCardProps {
      comic: Comic;
    }

    export default function ComicCard({ comic }: ComicCardProps) {
      // ... implementation
    }
    ```

### Bước 2.2: Thiết kế Cấu trúc HTML và Styling

1.  **Thẻ Bao bọc Chính**: Sử dụng một thẻ `div` hoặc `article` làm thẻ bao bọc chính cho card.
2.  **Ảnh Bìa (`next/image`)**:
    *   Hiển thị ảnh bìa của truyện bằng component `next/image` để tối ưu hóa.
    *   Đảm bảo ảnh có `alt` text phù hợp cho accessibility.
    *   Ảnh bìa thường là phần lớn nhất và thu hút nhất của card.
3.  **Thông tin Truyện**: Hiển thị tên truyện, chương mới nhất, thời gian cập nhật, v.v. bên dưới hoặc chồng lên ảnh bìa (tùy thiết kế).
4.  **Link Điều hướng**: Toàn bộ card hoặc ít nhất là ảnh bìa và tên truyện nên được bọc trong một `next/link` để điều hướng người dùng đến trang chi tiết truyện (`/m/[comicSlug]`).
5.  **Styling với Tailwind CSS (hoặc tương đương)**:
    *   Sử dụng các utility classes để định dạng layout, kích thước, bo góc, đổ bóng, text, v.v.
    *   Đảm bảo card có thiết kế responsive.
    ```tsx
    // Bên trong ComicCard function
    export default function ComicCard({ comic }: ComicCardProps) {
      return (
        <Link href={`/m/${comic.slug}`} className="block group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800">
          <div className="relative aspect-[2/3]"> {/* Tỷ lệ ảnh bìa phổ biến */}
            <Image
              src={comic.coverImageUrl}
              alt={`Ảnh bìa ${comic.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" // Tối ưu sizes prop
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false} // Đặt true nếu card này nằm trong LCP (Largest Contentful Paint)
            />
            {/* Overlay hoặc tag NEW/HOT nếu có */}
            {comic.status && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    {comic.status === "連載中" ? "Đang ra" : comic.status}
                </span>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-md font-semibold text-white truncate group-hover:text-blue-400 transition-colors duration-300" title={comic.title}>
              {comic.title}
            </h3>
            {comic.latestChapter && (
              <p className="text-xs text-gray-400 mt-1">
                {comic.latestChapterUrl ? 
                    <Link href={comic.latestChapterUrl} className="hover:text-blue-300 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {comic.latestChapter}
                    </Link> 
                    : comic.latestChapter
                }
              </p>
            )}
            {comic.updatedAt && (
              <p className="text-xs text-gray-500 mt-1">{comic.updatedAt}</p>
            )}
          </div>
        </Link>
      );
    }
    ```

### Bước 2.3: Các Tính năng Tùy chọn và Hiệu ứng Hover

1.  **Hiệu ứng Hover**: Thêm các hiệu ứng tinh tế khi người dùng di chuột qua card (ví dụ: phóng to nhẹ ảnh bìa, thay đổi màu chữ tên truyện, đổ bóng rõ hơn).
2.  **Tag/Badge**: Hiển thị các tag như "NEW", "HOT", "END" trên ảnh bìa nếu có thông tin này từ API.
3.  **Thông tin Phụ**: Cân nhắc hiển thị thêm thông tin như lượt xem hoặc đánh giá nếu không làm card quá rối.

### Bước 2.4: Sử dụng Component `ComicCard`

Import và sử dụng `ComicCard` trong các trang/component khác cần hiển thị danh sách truyện.

```tsx
// Ví dụ sử dụng trong một trang danh sách
// import ComicCard from "@/components/comics/ComicCard";
// ...
// <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//   {comicsData.map(comic => (
//     <ComicCard key={comic.id} comic={comic} />
//   ))}
// </div>
// ...
```

### Bước 2.5: Tối ưu hóa Performance và Accessibility

1.  **`next/image`**: Đã đề cập, rất quan trọng cho tối ưu hóa ảnh.
    *   Cung cấp `sizes` prop chính xác cho `next/image` nếu sử dụng `layout="fill"` hoặc `responsive` để trình duyệt tải đúng kích thước ảnh cho từng viewport.
    *   Cân nhắc đặt `priority={true}` cho các `ComicCard` nằm trong vùng Largest Contentful Paint (LCP) ban đầu của trang (ví dụ: vài card đầu tiên trên trang chủ).
2.  **Accessibility (A11y)**:
    *   Đảm bảo `alt` text cho ảnh bìa là mô tả và hữu ích.
    *   Nếu toàn bộ card là một link, đảm bảo nội dung text bên trong (tên truyện) đủ rõ ràng về đích đến của link.
    *   Kiểm tra khả năng điều hướng bằng bàn phím.
3.  **Lazy Loading**: `next/image` tự động xử lý lazy loading cho các ảnh không nằm trong viewport ban đầu.

## 3. Lưu ý Quan trọng

*   **Tính nhất quán**: Giữ thiết kế `ComicCard` nhất quán trên toàn bộ trang web để người dùng có trải nghiệm quen thuộc.
*   **Lượng thông tin**: Cân bằng giữa việc cung cấp đủ thông tin hữu ích và giữ cho card không bị quá tải, rối mắt.
*   **Thiết kế Responsive**: Đảm bảo card hiển thị tốt trên mọi kích thước màn hình, từ mobile đến desktop. Số cột trong lưới hiển thị card thường thay đổi theo breakpoint.
*   **Tương tác**: Nếu có các nút hành động trực tiếp trên card (ví dụ: "Thêm vào yêu thích"), đảm bảo chúng không xung đột với link chính của card và dễ dàng tương tác.

Bằng cách tạo ra một component `ComicCard` được thiết kế tốt và có thể tái sử dụng, bạn sẽ đơn giản hóa việc xây dựng các trang hiển thị danh sách truyện và đảm bảo tính nhất quán trong giao diện người dùng của trang web truyện tranh.
