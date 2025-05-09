# Workflow Kỹ thuật: Tính năng Yêu thích/Đánh dấu Truyện (Favorite/Bookmark Feature) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Tính năng Yêu thích (hoặc Đánh dấu/Theo dõi) Truyện cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Tính năng này cho phép người dùng đã đăng nhập lưu lại các truyện họ quan tâm để dễ dàng truy cập sau này.

## 2. Yêu cầu Tiên quyết

*   **Hệ thống Xác thực Người dùng**: Người dùng cần có khả năng đăng nhập để sử dụng tính năng này (tham khảo workflow "Luồng Đăng nhập/Đăng ký").
*   **API Backend**: Cần có các API endpoint để:
    *   Thêm một truyện vào danh sách yêu thích của người dùng.
    *   Xóa một truyện khỏi danh sách yêu thích của người dùng.
    *   Lấy danh sách các truyện yêu thích của người dùng hiện tại.
    *   Kiểm tra xem một truyện cụ thể có nằm trong danh sách yêu thích của người dùng hiện tại không.

## 3. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 3.1: Thiết kế Giao diện Người dùng (UI) cho Nút Yêu thích

1.  **Vị trí Nút**: Thường đặt ở Trang Chi tiết Truyện, gần thông tin truyện hoặc các nút hành động khác. Có thể xuất hiện trên `ComicCard` (dưới dạng icon nhỏ).
2.  **Trạng thái Nút**: Nút cần thay đổi giao diện để phản ánh trạng thái hiện tại (ví dụ: icon trái tim rỗng khi chưa yêu thích, icon trái tim đầy khi đã yêu thích).
3.  **Icon**: Sử dụng icon dễ nhận biết (ví dụ: trái tim, ngôi sao, bookmark).

### Bước 3.2: Tạo Component Nút Yêu thích (`FavoriteButton`)

1.  **Vị trí File**: `src/components/comics/FavoriteButton.tsx` (hoặc tương tự).
2.  **Client Component**: Đánh dấu `"use client";` vì nó sẽ xử lý tương tác người dùng và gọi API.
3.  **Props**: `comicId` (ID của truyện), `initialIsFavorited` (trạng thái yêu thích ban đầu, lấy từ server).
4.  **State**: Sử dụng `useState` để quản lý trạng thái yêu thích hiện tại (`isFavorited`) và trạng thái loading (`isLoading`).
5.  **Logic Xử lý Click**:
    *   Khi click, gọi API backend tương ứng (thêm/xóa khỏi yêu thích).
    *   Cập nhật `isFavorited` state dựa trên response từ API.
    *   Xử lý lỗi nếu API call thất bại.
    *   Sử dụng `useSession` (từ `next-auth`) để kiểm tra người dùng đã đăng nhập chưa. Nếu chưa, có thể hiển thị thông báo yêu cầu đăng nhập hoặc điều hướng đến trang đăng nhập.

```tsx
// src/components/comics/FavoriteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Giả sử dùng NextAuth.js
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  comicId: string | number;
  initialIsFavorited: boolean;
}

export default function FavoriteButton({ comicId, initialIsFavorited }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cập nhật trạng thái nếu prop initialIsFavorited thay đổi (ví dụ sau khi revalidate)
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggleFavorite = async () => {
    if (status !== "authenticated") {
      // Yêu cầu đăng nhập, có thể hiển thị modal hoặc điều hướng
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch(`/api/user/favorites/${comicId}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        // Body có thể không cần nếu chỉ dùng comicId trong URL
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thao tác thất bại");
      }
      setIsFavorited(!isFavorited);
    } catch (error: any) {
      console.error("Failed to toggle favorite:", error);
      // Hiển thị thông báo lỗi cho người dùng (ví dụ: sử dụng toast)
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse"></div>; // Placeholder loading

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || status !== "authenticated"} // Vô hiệu hóa nếu đang tải hoặc chưa đăng nhập
      className={`p-2 rounded-full transition-colors duration-200 
                  ${isLoading ? "cursor-not-allowed" : "hover:bg-gray-700 dark:hover:bg-gray-600"}
                  ${status !== "authenticated" ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      title={status !== "authenticated" ? "Đăng nhập để yêu thích" : (isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích")}
    >
      {isFavorited ? (
        <HeartSolid className="h-6 w-6 text-red-500" />
      ) : (
        <HeartOutline className="h-6 w-6 text-gray-400 group-hover:text-red-400" />
      )}
    </button>
  );
}
```

### Bước 3.3: Tích hợp `FavoriteButton`

1.  **Trang Chi tiết Truyện (`ComicDetailPage`)**:
    *   Fetch trạng thái yêu thích ban đầu của truyện cho người dùng hiện tại khi fetch dữ liệu chi tiết truyện (nếu người dùng đã đăng nhập).
    *   Truyền `comicId` và `initialIsFavorited` vào `FavoriteButton`.
    ```tsx
    // Trong src/app/m/[comicSlug]/page.tsx
    // ... (fetch comicDetails, bao gồm isFavorited cho user hiện tại nếu có)
    // <FavoriteButton comicId={comicInfo.id} initialIsFavorited={comicInfo.isUserFavorite || false} />
    ```
2.  **Trên `ComicCard` (Tùy chọn)**:
    *   Có thể thêm một icon yêu thích nhỏ trên card. Logic tương tự nhưng cần đảm bảo không làm card quá rối.

### Bước 3.4: API Routes cho Backend Logic (Nếu không dùng Backend riêng)

1.  **`/api/user/favorites/[comicId]` (POST)**: Thêm `comicId` vào danh sách yêu thích của người dùng hiện tại (lấy `userId` từ session).
2.  **`/api/user/favorites/[comicId]` (DELETE)**: Xóa `comicId` khỏi danh sách yêu thích.
3.  **`/api/user/favorites` (GET)**: Lấy danh sách tất cả truyện yêu thích của người dùng hiện tại.
4.  **`/api/comics/[comicSlugOrId]/is-favorited` (GET)**: (Hoặc tích hợp vào API chi tiết truyện) Kiểm tra xem truyện có được người dùng hiện tại yêu thích không.

    *Backend cần có bảng trong database để lưu trữ mối quan hệ user-comic (ví dụ: `UserFavorites` với `userId` và `comicId`).*

### Bước 3.5: Trang Danh sách Truyện Yêu thích (`/profile/favorites`)

1.  **Tạo Route và Page Component**: Ví dụ: `src/app/profile/favorites/page.tsx`.
2.  **Bảo vệ Route**: Trang này chỉ dành cho người dùng đã đăng nhập.
3.  **Fetch Dữ liệu**: Gọi API `/api/user/favorites` để lấy danh sách truyện yêu thích.
4.  **Hiển thị**: Sử dụng bố cục lưới và `ComicCard` để hiển thị danh sách truyện.

```tsx
// src/app/profile/favorites/page.tsx (Ví dụ cơ bản)
import ComicCard from "@/components/comics/ComicCard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Đường dẫn tới authOptions
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

async function getUserFavorites(userId: string) {
  // Giả sử API endpoint của bạn
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/favorites`, {
    headers: { /* Cần header Authorization nếu API yêu cầu */ },
    // Hoặc nếu API route của Next.js, nó sẽ tự biết session
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.favorites; // Giả sử API trả về { favorites: [...] }
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/profile/favorites");
  }

  // Giả sử session.user.id là ID người dùng trong DB của bạn
  const favoriteComics = await getUserFavorites(session.user.id as string);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Truyện Yêu Thích Của Bạn</h1>
      {favoriteComics && favoriteComics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favoriteComics.map((comic: any) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <p>Bạn chưa có truyện yêu thích nào. Hãy khám phá và thêm truyện vào danh sách nhé!</p>
      )}
    </main>
  );
}
```

### Bước 3.6: Cập nhật Trạng thái Yêu thích trên Giao diện

*   **Optimistic Updates (Nâng cao)**: Để trải nghiệm mượt mà hơn, bạn có thể cập nhật UI (thay đổi icon nút) ngay lập tức khi người dùng click, trước khi API call hoàn tất. Nếu API call thất bại, revert lại UI và thông báo lỗi.
*   **Revalidation/Refresh**: Sau khi thêm/xóa yêu thích, nếu người dùng điều hướng đến trang danh sách yêu thích, dữ liệu cần được cập nhật. Next.js App Router với Server Components có thể tự động revalidate hoặc bạn có thể dùng `router.refresh()`.

## 4. Lưu ý Quan trọng

*   **Trải nghiệm Người dùng khi Chưa Đăng nhập**: Xử lý trường hợp người dùng click nút yêu thích khi chưa đăng nhập một cách thân thiện (ví dụ: hiển thị popup yêu cầu đăng nhập, hoặc điều hướng đến trang đăng nhập và quay lại trang trước đó sau khi đăng nhập thành công).
*   **Performance**: API lấy danh sách yêu thích và kiểm tra trạng thái yêu thích cần nhanh chóng.
*   **Thông báo Phản hồi**: Cung cấp thông báo rõ ràng cho người dùng khi họ thêm/xóa yêu thích thành công hoặc khi có lỗi xảy ra (ví dụ: sử dụng toast notifications).

Tính năng Yêu thích giúp tăng tương tác của người dùng với trang web và khuyến khích họ quay trở lại. Việc triển khai cẩn thận cả phía frontend và backend là rất quan trọng.
