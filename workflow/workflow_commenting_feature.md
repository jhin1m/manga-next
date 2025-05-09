# Workflow Kỹ thuật: Tính năng Bình luận (Commenting Feature) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Tính năng Bình luận cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Tính năng này cho phép người dùng đã đăng nhập để lại bình luận trên các trang chi tiết truyện hoặc từng chương truyện.

## 2. Yêu cầu Tiên quyết

*   **Hệ thống Xác thực Người dùng**: Người dùng cần đăng nhập để bình luận (tham khảo workflow "Luồng Đăng nhập/Đăng ký").
*   **API Backend**: Cần có các API endpoint để:
    *   Đăng một bình luận mới (liên kết với truyện/chương và người dùng).
    *   Lấy danh sách các bình luận cho một truyện/chương (có thể hỗ trợ phân trang, sắp xếp).
    *   (Tùy chọn) Chỉnh sửa bình luận của chính người dùng.
    *   (Tùy chọn) Xóa bình luận của chính người dùng (hoặc admin/mod).
    *   (Tùy chọn) Trả lời một bình luận (nested comments).
    *   (Tùy chọn) Thích/Không thích bình luận.

## 3. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 3.1: Thiết kế Giao diện Người dùng (UI) cho Khu vực Bình luận

1.  **Vị trí**: Thường đặt ở cuối Trang Chi tiết Truyện hoặc Trang Đọc Truyện (sau nội dung chính).
2.  **Form Đăng Bình luận (`CommentForm`)**:
    *   Một ô `textarea` để người dùng nhập nội dung bình luận.
    *   Nút "Gửi bình luận".
    *   Chỉ hiển thị form này nếu người dùng đã đăng nhập. Nếu chưa, hiển thị thông báo/link yêu cầu đăng nhập.
3.  **Danh sách Bình luận (`CommentList`)**:
    *   Hiển thị các bình luận đã có.
    *   Mỗi bình luận (`CommentItem`) thường bao gồm: Avatar người dùng, tên người dùng, nội dung bình luận, thời gian đăng.
    *   (Tùy chọn) Nút trả lời, nút thích/không thích, nút tùy chọn (chỉnh sửa/xóa nếu là chủ sở hữu hoặc admin).
    *   Phân trang cho danh sách bình luận nếu có nhiều.
    *   Sắp xếp bình luận (ví dụ: mới nhất, cũ nhất, nhiều lượt thích nhất).

### Bước 3.2: Tạo Component Form Đăng Bình luận (`CommentForm`)

1.  **Vị trí File**: `src/components/comments/CommentForm.tsx`.
2.  **Client Component**: Đánh dấu `"use client";`.
3.  **Props**: `targetId` (ID của truyện hoặc chương đang được bình luận), `parentId` (tùy chọn, nếu là trả lời bình luận).
4.  **State**: `content` (nội dung bình luận), `isLoading`, `error`.
5.  **Logic `handleSubmit`**:
    *   Kiểm tra người dùng đã đăng nhập (sử dụng `useSession`).
    *   Validate nội dung (không trống).
    *   Gọi API backend để đăng bình luận.
    *   Nếu thành công, xóa nội dung form và có thể kích hoạt việc tải lại danh sách bình luận.

```tsx
// src/components/comments/CommentForm.tsx
"use client";
import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  targetId: string; // ID của truyện hoặc chương
  targetType: "comic" | "chapter";
  parentId?: string | null; // ID của bình luận cha nếu là trả lời
  onCommentPosted: () => void; // Callback để refresh danh sách bình luận
}

export default function CommentForm({ targetId, targetType, parentId = null, onCommentPosted }: CommentFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!content.trim()) {
      setError("Nội dung bình luận không được để trống.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, targetId, targetType, parentId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Không thể gửi bình luận.");
      }
      setContent("");
      onCommentPosted(); // Gọi callback để làm mới danh sách bình luận
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return <p>Đang tải...</p>;
  if (status !== "authenticated") {
    return <p>Vui lòng <Link href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`} className="text-blue-400 hover:underline">đăng nhập</Link> để bình luận.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-6 p-4 bg-gray-700 rounded-lg">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        rows={3}
        className="w-full p-2 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      <button 
        type="submit" 
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
}
```

### Bước 3.3: Tạo Component Hiển thị Bình luận (`CommentItem` và `CommentList`)

1.  **`CommentItem.tsx`**: Hiển thị một bình luận đơn lẻ.
    *   Props: `comment` (object chứa thông tin bình luận: user, content, date, replies, etc.).
    *   Hiển thị avatar, tên người dùng, thời gian, nội dung.
    *   (Tùy chọn) Nút trả lời, thích, menu tùy chọn.
2.  **`CommentList.tsx`**: Hiển thị danh sách các `CommentItem`.
    *   Props: `comments` (mảng các bình luận).
    *   Có thể hỗ trợ hiển thị bình luận lồng nhau (nested comments).

```tsx
// src/components/comments/CommentItem.tsx (Ví dụ đơn giản)
import Image from "next/image";
// interface Comment { id: string; user: { name: string; image?: string }; content: string; createdAt: string; replies?: Comment[]; }
// interface CommentItemProps { comment: Comment; onReply: (commentId: string) => void; }

export default function CommentItem({ comment, onReply }) {
  return (
    <div className="p-3 mb-3 bg-gray-750 rounded-lg border border-gray-700">
      <div className="flex items-start space-x-3">
        <Image src={comment.user.image || "/default-avatar.png"} alt={comment.user.name} width={32} height={32} className="rounded-full" />
        <div>
          <p className="text-sm font-semibold text-white">{comment.user.name}</p>
          <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <p className="mt-2 text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
      {/* Nút trả lời, thích, v.v. */}
      {/* <button onClick={() => onReply(comment.id)} className="text-xs text-blue-400 hover:underline mt-1">Trả lời</button> */}
      {/* {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-600 pl-3">
          {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} onReply={onReply} />)}
        </div>
      )} */}
    </div>
  );
}

// src/components/comments/CommentList.tsx
// interface CommentListProps { comments: Comment[]; onReply: (commentId: string) => void; }
export default function CommentList({ comments, onReply }) {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-400 italic">Chưa có bình luận nào.</p>;
  }
  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
}
```

### Bước 3.4: Tạo Component Chính Quản lý Bình luận (`CommentsSection`)

1.  **Vị trí File**: `src/components/comments/CommentsSection.tsx`.
2.  **Client Component**: Đánh dấu `"use client";`.
3.  **Props**: `targetId` (ID truyện/chương), `targetType`.
4.  **State**: `comments` (danh sách bình luận), `isLoading`, `error`, `page` (nếu có phân trang), `sortBy`.
5.  **Logic**: Fetch danh sách bình luận từ API khi component mount và khi có thay đổi (ví dụ: đăng bình luận mới, đổi trang, đổi sắp xếp).
    *   Sử dụng `useEffect` để fetch ban đầu.
    *   Hàm `fetchComments` để gọi API.
    *   Hàm `handleCommentPosted` (truyền vào `CommentForm`) để fetch lại bình luận sau khi đăng.

```tsx
// src/components/comments/CommentsSection.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
// import Pagination from "@/components/ui/Pagination"; // Nếu có phân trang

interface CommentsSectionProps {
  targetId: string;
  targetType: "comic" | "chapter";
}

export default function CommentsSection({ targetId, targetType }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Thêm state cho pagination, sorting nếu cần

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ví dụ: /api/comments?targetId=abc&targetType=comic&page=1&sortBy=newest
      const response = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}`);
      if (!response.ok) {
        throw new Error("Không thể tải bình luận.");
      }
      const data = await response.json();
      setComments(data.comments || []); // Giả sử API trả về { comments: [...] }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // const handleReply = (commentId: string) => { /* Logic mở form trả lời cho commentId */ }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Bình luận ({comments.length})</h3>
      <CommentForm targetId={targetId} targetType={targetType} onCommentPosted={fetchComments} />
      {isLoading && <p>Đang tải bình luận...</p>}
      {error && <p className="text-red-400">Lỗi: {error}</p>}
      {!isLoading && !error && <CommentList comments={comments} /* onReply={handleReply} */ />}
      {/* Pagination component nếu có */}
    </div>
  );
}
```

### Bước 3.5: API Routes cho Backend Logic

1.  **`/api/comments` (POST)**: Nhận `content`, `targetId`, `targetType`, `parentId` (tùy chọn). Lấy `userId` từ session. Lưu bình luận vào database. Trả về bình luận mới hoặc status thành công.
2.  **`/api/comments` (GET)**: Nhận `targetId`, `targetType`, `page`, `limit`, `sortBy`. Lấy danh sách bình luận từ database, có thể join với thông tin user. Trả về danh sách bình luận và thông tin phân trang.
3.  (Tùy chọn) Các API cho sửa, xóa, thích bình luận.

    *Backend cần các bảng: `Comments` (content, userId, targetId, targetType, parentId, createdAt), `Users` (để lấy thông tin người bình luận).*

### Bước 3.6: Tích hợp `CommentsSection` vào Trang

Đặt `CommentsSection` component vào Trang Chi tiết Truyện hoặc Trang Đọc Truyện.

```tsx
// Ví dụ trong src/app/m/[comicSlug]/page.tsx
// import CommentsSection from "@/components/comments/CommentsSection";
// ...
// <main className="...">
//   {/* ... Nội dung trang chi tiết truyện ... */}
//   <CommentsSection targetId={comicInfo.id} targetType="comic" />
// </main>
// ...
```

## 4. Lưu ý Quan trọng

*   **Bảo mật**: Ngăn chặn XSS trong nội dung bình luận (sanitize HTML phía client hoặc server). Kiểm tra quyền hạn cho việc sửa/xóa bình luận.
*   **Performance**: Phân trang cho danh sách bình luận nếu có nhiều. Tối ưu hóa query database.
*   **Real-time Updates (Nâng cao)**: Để bình luận mới xuất hiện ngay lập tức cho tất cả người dùng, cân nhắc sử dụng WebSockets (ví dụ: với Socket.IO, Pusher) hoặc SWR/React Query để tự động revalidate.
*   **Moderation**: Cân nhắc hệ thống kiểm duyệt bình luận (tự động hoặc thủ công) để loại bỏ nội dung không phù hợp.
*   **Nested Comments**: Hiển thị bình luận trả lời có thể làm tăng độ phức tạp của UI và query. Cân nhắc độ sâu tối đa cho nested comments.

Tính năng bình luận làm tăng tính tương tác và cộng đồng cho trang web. Việc triển khai cần chú ý đến trải nghiệm người dùng, bảo mật và hiệu suất.
