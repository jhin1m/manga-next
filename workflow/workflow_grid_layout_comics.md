# Workflow Kỹ thuật: Bố cục Lưới Hiển thị Truyện (Grid Layout for Comics) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để triển khai Bố cục Lưới (Grid Layout) nhằm hiển thị danh sách các `ComicCard` một cách responsive trên các trang như Trang Chủ, Trang Thể Loại, Kết Quả Tìm Kiếm, v.v., sử dụng Next.js và Tailwind CSS (hoặc một framework CSS tương tự).

## 2. Các Bước Kỹ thuật Triển khai

Bố cục lưới là một phần quan trọng của việc trình bày nhiều item (như `ComicCard`) một cách có tổ chức và thẩm mỹ.

### Bước 2.1: Sử dụng CSS Grid hoặc Flexbox

Cả CSS Grid và Flexbox đều có thể được sử dụng để tạo bố cục lưới. CSS Grid thường phù hợp hơn cho các layout hai chiều phức tạp, trong khi Flexbox rất tốt cho các layout một chiều.

1.  **CSS Grid (Khuyến nghị cho lưới truyện đa cột, responsive)**:
    *   Sử dụng các utility class của Tailwind CSS như `grid`, `grid-cols-*`, `gap-*`.
    *   Ví dụ: Hiển thị 2 cột trên mobile, 3 cột trên tablet, 5 cột trên desktop.

2.  **Flexbox (Có thể dùng, nhưng Grid thường trực quan hơn cho việc này)**:
    *   Sử dụng `flex`, `flex-wrap`, và tính toán chiều rộng của các item con.

### Bước 2.2: Triển khai với Tailwind CSS Grid

Đây là cách tiếp cận phổ biến và dễ dàng với Next.js (nếu Tailwind CSS được cài đặt).

1.  **Trong Component Cha (Parent Component)**: Component cha chứa danh sách các `ComicCard` (ví dụ: `ComicListSection`, `SearchResultsPage`, `GenrePage`).
    ```tsx
    // Ví dụ trong một component hiển thị danh sách truyện
    // import ComicCard from "@/components/comics/ComicCard";

    // interface ComicListProps {
    //   comics: ComicType[];
    // }

    // export default function ComicList({ comics }: ComicListProps) {
    //   if (!comics || comics.length === 0) {
    //     return <p>Không có truyện nào để hiển thị.</p>;
    //   }

    //   return (
    //     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
    //       {/* 
    //         - grid: Kích hoạt CSS Grid.
    //         - grid-cols-2: Mặc định 2 cột trên màn hình nhỏ nhất.
    //         - sm:grid-cols-3: 3 cột từ breakpoint 'sm' (small) trở lên.
    //         - md:grid-cols-4: 4 cột từ breakpoint 'md' (medium) trở lên.
    //         - lg:grid-cols-5: 5 cột từ breakpoint 'lg' (large) trở lên.
    //         - xl:grid-cols-6: 6 cột từ breakpoint 'xl' (extra large) trở lên.
    //         - gap-3 md:gap-4: Khoảng cách giữa các item trong lưới, có thể responsive.
    //       */}
    //       {comics.map((comic) => (
    //         <ComicCard key={comic.id} comic={comic} />
    //       ))}
    //     </div>
    //   );
    // }
    ```

2.  **Điều chỉnh Số cột và Khoảng cách (Gap)**:
    *   `grid-cols-*`: Xác định số cột mặc định.
    *   `sm:grid-cols-*`, `md:grid-cols-*`, `lg:grid-cols-*`, `xl:grid-cols-*`: Xác định số cột cho các breakpoint khác nhau của Tailwind CSS. Bạn cần điều chỉnh các giá trị này (`*`) và các breakpoint cho phù hợp với thiết kế và mật độ hiển thị mong muốn.
    *   `gap-*` hoặc `gap-x-*`, `gap-y-*`: Xác định khoảng trống giữa các hàng và cột trong lưới. Ví dụ: `gap-4` (1rem), `gap-2` (0.5rem).

### Bước 2.3: Đảm bảo `ComicCard` có Kích thước Phù hợp

1.  **Chiều rộng của `ComicCard`**: `ComicCard` sẽ tự động chiếm không gian được phân bổ bởi cột lưới.
2.  **Tỷ lệ Khung hình (Aspect Ratio) cho Ảnh**: Để các card trông đồng đều, đặc biệt là phần ảnh bìa, bạn có thể muốn duy trì một tỷ lệ khung hình nhất quán cho ảnh. Component `ComicCard` đã có ví dụ sử dụng `aspect-[2/3]` cho ảnh bìa, điều này giúp các card có chiều cao đồng đều nếu chiều rộng của chúng như nhau (do lưới).

### Bước 2.4: Xử lý Số lượng Item không đều

CSS Grid tự động xử lý việc này. Nếu hàng cuối cùng không đủ item để lấp đầy tất cả các cột, các item sẽ được căn chỉnh ở đầu hàng theo mặc định.

### Bước 2.5: Responsive Design

Việc sử dụng các tiền tố breakpoint của Tailwind CSS (như `sm:`, `md:`, `lg:`) trong các class `grid-cols-*` và `gap-*` là chìa khóa để tạo ra bố cục lưới responsive.

1.  **Kiểm tra trên Nhiều Kích thước Màn hình**: Luôn kiểm tra bố cục lưới trên các thiết bị và kích thước viewport khác nhau để đảm bảo nó hiển thị đúng và đẹp mắt.
2.  **Điều chỉnh Breakpoints**: Nếu cần, bạn có thể tùy chỉnh các breakpoint mặc định của Tailwind CSS trong file `tailwind.config.js`.

## 3. Ví dụ Tích hợp

Giả sử bạn có một trang hiển thị truyện mới nhất:

```tsx
// src/app/newest/page.tsx (ví dụ)
import ComicCard from "@/components/comics/ComicCard";

async function getNewestComics() {
  // Logic fetch truyện mới nhất từ API
  // const res = await fetch("https://your-api.com/comics?sort=created_at_desc&limit=30");
  // if (!res.ok) throw new Error("Failed to fetch newest comics");
  // return res.json();
  return { data: [/* mảng các object truyện */] }; // Placeholder
}

export default async function NewestPage() {
  const newestComicsData = await getNewestComics();
  const comics = newestComicsData.data;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Truyện Mới Nhất</h1>
      {comics && comics.length > 0 ? (
        <div className="grid grid-cols-2 mobile-l:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
          {/* 
            Ví dụ sử dụng breakpoint tùy chỉnh 'mobile-l' nếu bạn đã định nghĩa nó.
            Điều chỉnh số cột cho phù hợp với mật độ mong muốn.
          */}
          {comics.map((comic: any) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <p>Hiện chưa có truyện mới nào.</p>
      )}
      {/* Component Phân trang nếu cần */}
    </main>
  );
}
```

## 4. Lưu ý Quan trọng

*   **Mật độ Thông tin**: Cân nhắc số lượng cột hiển thị trên các kích thước màn hình khác nhau để tránh làm giao diện quá chật chội hoặc quá thưa thớt.
*   **Hiệu suất**: Nếu hiển thị một số lượng rất lớn các card, hãy đảm bảo component `ComicCard` được tối ưu và cân nhắc các kỹ thuật virtual scrolling (mặc dù CSS Grid với lazy loading ảnh thường đủ tốt cho hầu hết các trường hợp).
*   **Tính nhất quán**: Sử dụng cùng một logic bố cục lưới (hoặc các biến thể tương tự) trên tất cả các trang danh sách để tạo trải nghiệm người dùng nhất quán.

Bố cục lưới là một phần cơ bản nhưng quan trọng của thiết kế frontend cho các trang web hiển thị nhiều nội dung. Sử dụng CSS Grid với Tailwind CSS trong Next.js giúp việc này trở nên đơn giản và hiệu quả.
