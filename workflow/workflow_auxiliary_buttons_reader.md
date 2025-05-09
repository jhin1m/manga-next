# Workflow Kỹ thuật: Các Nút Tương tác Phụ trong Trang Đọc (Auxiliary Buttons in Reader) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Các Nút Tương tác Phụ (Auxiliary Buttons) trên Trang Đọc Truyện của một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Các nút này có thể bao gồm: chuyển đổi chế độ đọc (cuộn dọc/từng trang), báo lỗi chương, cài đặt hiển thị, v.v.

## 2. Yêu cầu Tiên quyết

*   Component Trang Đọc Truyện (`ComicReaderClient` hoặc tương tự) đã tồn tại và hiển thị nội dung chương (tham khảo workflow "Trang Đọc Truyện").
*   Hệ thống xác thực người dùng (nếu một số nút yêu cầu đăng nhập, ví dụ: báo lỗi).
*   API Backend (nếu cần, ví dụ: để gửi báo lỗi).

## 3. Các Bước Kỹ thuật Triển khai với Next.js

Các nút này thường là một phần của `ReaderNavigationBar` hoặc một thanh công cụ nổi riêng biệt trong trang đọc.

### Bước 3.1: Xác định các Nút Tương tác Phụ Cần thiết

Dựa trên dokiraw.com và các trang truyện phổ biến, các nút có thể bao gồm:

1.  **Chuyển đổi Chế độ Đọc**: (Ví dụ: Cuộn dọc liên tục vs. Từng trang một theo chiều ngang). Dokiraw chủ yếu dùng cuộn dọc.
2.  **Báo lỗi Chương**: Cho phép người dùng báo cáo các vấn đề với chương hiện tại (ảnh lỗi, sai thứ tự, v.v.).
3.  **Cài đặt Hiển thị (Tùy chọn)**: Ví dụ: điều chỉnh độ sáng, chọn màu nền (nếu không dùng dark mode toàn cục).
4.  **Nút Chia sẻ Chương (Tùy chọn)**.
5.  **Nút Thêm vào Yêu thích (Tùy chọn, nếu chưa có ở nơi khác)**.

### Bước 3.2: Thiết kế Giao diện Người dùng (UI)

1.  **Vị trí**: Thường tích hợp vào `ReaderNavigationBar` hoặc một thanh công cụ nổi (floating toolbar) có thể ẩn/hiện.
2.  **Icon**: Sử dụng icon rõ ràng cho mỗi chức năng.
3.  **Dropdown/Modal**: Một số cài đặt phức tạp hơn có thể nằm trong một dropdown menu hoặc modal.

### Bước 3.3: Triển khai Logic cho Từng Nút

Các nút này sẽ là Client Components hoặc một phần của `ComicReaderClient.tsx`.

#### 3.3.1. Nút Chuyển đổi Chế độ Đọc (Ví dụ: nếu hỗ trợ nhiều chế độ)

*   **State**: Cần một state (ví dụ: `readingMode: 'scroll' | 'paged'`) trong `ComicReaderClient` hoặc một context riêng nếu phức tạp.
*   **Logic**: Khi click, thay đổi state `readingMode`. Component hiển thị ảnh (`ImageDisplay`) sẽ cần render khác nhau dựa trên `readingMode` này.
    *   `scroll`: Hiển thị tất cả ảnh theo chiều dọc.
    *   `paged`: Hiển thị một ảnh một lúc, có nút chuyển trang trái/phải cho từng ảnh.
*   *Dokiraw dường như chỉ tập trung vào chế độ cuộn dọc, nên nút này có thể không cần thiết nếu theo sát thiết kế đó.* 

#### 3.3.2. Nút Báo lỗi Chương (`ReportChapterButton`)

1.  **Tạo Component**: `src/components/reader/ReportChapterButton.tsx`.
2.  **Client Component**: `"use client";`.
3.  **Props**: `chapterId`, `comicTitle`, `chapterNumber`.
4.  **State**: `isModalOpen`, `reportContent`, `isLoading`, `error`, `successMessage`.
5.  **UI Modal**: Khi click nút, hiển thị một modal cho phép người dùng:
    *   Chọn loại lỗi (ví dụ: Ảnh mờ, Sai thứ tự, Thiếu trang, Khác).
    *   Nhập mô tả chi tiết (optional).
    *   Nút "Gửi báo lỗi".
6.  **Logic `handleSubmitReport`**:
    *   Kiểm tra đăng nhập (nếu cần).
    *   Gọi API backend `/api/reports/chapter` với `chapterId`, loại lỗi, mô tả.
    *   Hiển thị thông báo thành công/thất bại.

```tsx
// src/components/reader/ReportChapterButton.tsx (Ví dụ cơ bản)
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// Modal component (bạn có thể dùng thư viện hoặc tự tạo)
// import Modal from "@/components/ui/Modal"; 

interface ReportChapterButtonProps {
  chapterId: string;
}

export default function ReportChapterButton({ chapterId }: ReportChapterButtonProps) {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitReport = async () => {
    if (status !== "authenticated") {
      setMessage("Vui lòng đăng nhập để báo lỗi.");
      return;
    }
    if (!reportType) {
        setMessage("Vui lòng chọn loại lỗi.");
        return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, type: reportType, description: reportDescription }),
      });
      if (!response.ok) throw new Error("Gửi báo lỗi thất bại.");
      setMessage("Cảm ơn bạn đã báo lỗi! Chúng tôi sẽ xem xét sớm.");
      setIsModalOpen(false); // Đóng modal sau khi thành công
    } catch (error: any) {
      setMessage(error.message || "Đã có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return null;

  return (
    <>
      <button 
        onClick={() => { 
            if (status !== "authenticated") { alert("Vui lòng đăng nhập để báo lỗi."); return; }
            setIsModalOpen(true); 
            setMessage(""); // Reset message khi mở modal
        }}
        className="p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-400 hover:text-white"
        title="Báo lỗi chương này"
      >
        <ExclamationTriangleIcon className="h-5 w-5" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Báo lỗi chương</h3>
            {message && <p className={`mb-3 text-sm ${message.includes("Cảm ơn") ? "text-green-400" : "text-red-400"}`}>{message}</p>}
            <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)} 
                className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
            >
                <option value="">-- Chọn loại lỗi --</option>
                <option value="image_blur">Ảnh mờ/vỡ</option>
                <option value="wrong_order">Sai thứ tự trang</option>
                <option value="missing_page">Thiếu trang</option>
                <option value="translation_error">Lỗi dịch thuật</option>
                <option value="other">Khác</option>
            </select>
            <textarea 
                placeholder="Mô tả chi tiết (tùy chọn)" 
                rows={3} 
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500 text-white">Hủy</button>
              <button onClick={handleSubmitReport} disabled={isLoading} className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                {isLoading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

#### 3.3.3. Nút Cài đặt Hiển thị (Nếu có)

*   Có thể mở một dropdown hoặc modal nhỏ cho phép người dùng:
    *   Điều chỉnh độ sáng (yêu cầu thao tác DOM phức tạp hơn, có thể dùng CSS filter `brightness()` trên container ảnh).
    *   Chọn màu nền (nếu không dùng Dark Mode toàn cục).
*   Lưu cài đặt vào `localStorage` để duy trì giữa các phiên.

### Bước 3.4: Tích hợp các Nút vào `ReaderNavigationBar` hoặc Thanh công cụ riêng

Trong `ReaderNavigationBar.tsx` hoặc một component thanh công cụ nổi mới:

```tsx
// Ví dụ trong ReaderNavigationBar.tsx
// import ReportChapterButton from "./ReportChapterButton";
// ...
// <div className="flex items-center gap-2">
//   {/* ... các nút điều hướng chương ... */}
//   <ThemeToggleButton /> {/* Nếu có nút dark mode ở đây */}
//   <ReportChapterButton chapterId={chapterInfo.id} />
//   {/* Các nút cài đặt khác */}
// </div>
// ...
```

### Bước 3.5: API Backend cho Báo lỗi (Nếu có)

1.  **`/api/reports/chapter` (POST)**: Nhận `chapterId`, `userId` (từ session), `type`, `description`. Lưu báo lỗi vào database (bảng `ChapterReports`).

## 4. Lưu ý Quan trọng

*   **Trải nghiệm Người dùng**: Giữ cho các nút và cài đặt dễ hiểu, dễ truy cập nhưng không làm xao lãng trải nghiệm đọc chính.
*   **Độ phức tạp**: Chỉ thêm các nút thực sự cần thiết. Quá nhiều tùy chọn có thể làm rối người dùng.
*   **Lưu trữ Cài đặt**: Nếu có cài đặt hiển thị, sử dụng `localStorage` để lưu lựa chọn của người dùng.
*   **Phản hồi từ Báo lỗi**: Cung cấp phản hồi rõ ràng cho người dùng sau khi họ gửi báo lỗi.

Các nút tương tác phụ giúp tăng cường trải nghiệm người dùng và cho phép họ tùy chỉnh hoặc tương tác sâu hơn với nội dung.
