# Tài liệu Mô tả Database Schema cho Trang Web Truyện Tranh

## Giới thiệu

Tài liệu này mô tả chi tiết database schema được đề xuất cho backend của trang web truyện tranh Next.js. Schema này được thiết kế dựa trên việc phân tích các API được cung cấp và các thực tiễn tốt nhất cho việc lưu trữ và quản lý dữ liệu truyện tranh, người dùng, và các tương tác liên quan.

File SQL đầy đủ cho schema này có thể được tìm thấy trong file đính kèm: [comic_site_schema.sql](comic_site_schema.sql).

## Tổng quan về các Bảng Chính

Schema bao gồm các bảng chính sau:

1.  **Users**: Lưu trữ thông tin người dùng (đăng nhập, hồ sơ).
2.  **Genres**: Lưu trữ các thể loại truyện.
3.  **Authors**: Lưu trữ thông tin tác giả/họa sĩ.
4.  **Publishers**: Lưu trữ thông tin nhà xuất bản.
5.  **Comics**: Bảng trung tâm, lưu trữ thông tin chi tiết về mỗi bộ truyện.
6.  **Chapters**: Lưu trữ thông tin về từng chương của một bộ truyện.
7.  **Pages**: Lưu trữ từng trang ảnh của một chương.
8.  **Comments**: Lưu trữ bình luận của người dùng về truyện hoặc chương.
9.  **Favorites**: Lưu trữ danh sách truyện yêu thích của người dùng.
10. **Reading_Progress**: Theo dõi tiến độ đọc truyện của người dùng.
11. **Comic_Views & Chapter_Views**: Theo dõi lượt xem cho truyện và chương (có thể dùng để tổng hợp và hiển thị số liệu thống kê).

Ngoài ra, có các bảng trung gian (junction tables) để quản lý các mối quan hệ nhiều-nhiều:

*   **Comic_Genres**: Liên kết Comics và Genres.
*   **Comic_Authors**: Liên kết Comics và Authors (có thể bao gồm vai trò của tác giả).
*   **Comic_Publishers**: Liên kết Comics và Publishers.

## Chi tiết từng Bảng

Dưới đây là mô tả chi tiết cho từng bảng, bao gồm các cột, kiểu dữ liệu và mục đích của chúng.

### 1. Bảng `Users`

Lưu trữ thông tin tài khoản người dùng.

*   `id` (SERIAL PRIMARY KEY): Khóa chính, tự tăng.
*   `username` (VARCHAR(255) UNIQUE NOT NULL): Tên đăng nhập duy nhất.
*   `email` (VARCHAR(255) UNIQUE NOT NULL): Email duy nhất.
*   `password_hash` (VARCHAR(255) NOT NULL): Mật khẩu đã được hash.
*   `avatar_url` (VARCHAR(255)): URL ảnh đại diện.
*   `role` (VARCHAR(50) NOT NULL DEFAULT 'user'): Vai trò người dùng (ví dụ: 'user', 'admin', 'moderator').
*   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Thời gian tạo tài khoản.
*   `updated_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Thời gian cập nhật thông tin lần cuối.

### 2. Bảng `Genres`

Lưu trữ các thể loại truyện.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `name` (VARCHAR(255) UNIQUE NOT NULL): Tên thể loại.
*   `slug` (VARCHAR(255) UNIQUE NOT NULL): Slug cho URL thân thiện.
*   `description` (TEXT): Mô tả thể loại.
*   `created_at`, `updated_at`: Dấu thời gian.

### 3. Bảng `Authors`

Lưu trữ thông tin tác giả/họa sĩ.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `name` (VARCHAR(255) NOT NULL): Tên tác giả.
*   `slug` (VARCHAR(255) UNIQUE NOT NULL): Slug cho URL.
*   `bio` (TEXT): Tiểu sử tác giả.
*   `avatar_url` (VARCHAR(255)): Ảnh đại diện tác giả.
*   `created_at`, `updated_at`: Dấu thời gian.

### 4. Bảng `Publishers`

Lưu trữ thông tin nhà xuất bản.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `name` (VARCHAR(255) UNIQUE NOT NULL): Tên nhà xuất bản.
*   `slug` (VARCHAR(255) UNIQUE NOT NULL): Slug cho URL.
*   `description` (TEXT): Mô tả nhà xuất bản.
*   `logo_url` (VARCHAR(255)): URL logo.
*   `created_at`, `updated_at`: Dấu thời gian.

### 5. Bảng `Comics`

Bảng chính lưu trữ thông tin về các bộ truyện.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `title` (VARCHAR(255) NOT NULL): Tên truyện.
*   `slug` (VARCHAR(255) UNIQUE NOT NULL): Slug cho URL.
*   `alternative_titles` (JSONB): Lưu trữ mảng các tên thay thế (ví dụ: tên tiếng Anh, tên gốc).
*   `description` (TEXT): Mô tả chi tiết truyện.
*   `cover_image_url` (VARCHAR(255)): URL ảnh bìa.
*   `status` (VARCHAR(50) NOT NULL DEFAULT 'ongoing'): Trạng thái truyện (ví dụ: 'ongoing', 'completed', 'hiatus', 'cancelled').
*   `release_date` (DATE): Ngày phát hành.
*   `country_of_origin` (VARCHAR(100)): Quốc gia xuất xứ.
*   `age_rating` (VARCHAR(50)): Giới hạn độ tuổi.
*   `total_views` (INTEGER DEFAULT 0): Tổng lượt xem (có thể được cập nhật bằng trigger hoặc batch job).
*   `total_favorites` (INTEGER DEFAULT 0): Tổng lượt yêu thích (có thể được cập nhật bằng trigger hoặc batch job).
*   `last_chapter_uploaded_at` (TIMESTAMP WITH TIME ZONE): Thời gian chương cuối cùng được tải lên.
*   `uploader_id` (INTEGER REFERENCES Users(id)): ID người dùng đã tải lên truyện này (nếu có).
*   `created_at`, `updated_at`: Dấu thời gian.

### 6. Bảng `Chapters`

Lưu trữ thông tin về các chương của một bộ truyện.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `comic_id` (INTEGER NOT NULL REFERENCES Comics(id) ON DELETE CASCADE): Khóa ngoại, liên kết đến truyện.
*   `chapter_number` (VARCHAR(50) NOT NULL): Số thứ tự chương (hỗ trợ dạng '10.5', 'Extra 1').
*   `title` (VARCHAR(255)): Tiêu đề chương (nếu có).
*   `slug` (VARCHAR(255) NOT NULL): Slug cho URL chương, duy nhất trong phạm vi một truyện.
*   `release_date` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Ngày phát hành chương.
*   `view_count` (INTEGER DEFAULT 0): Lượt xem chương.
*   `uploader_id` (INTEGER REFERENCES Users(id)): ID người dùng đã tải lên chương này.
*   `created_at`, `updated_at`: Dấu thời gian.
*   `UNIQUE (comic_id, slug)` và `UNIQUE (comic_id, chapter_number)`: Đảm bảo tính duy nhất.

### 7. Bảng `Pages`

Lưu trữ từng trang ảnh của một chương.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `chapter_id` (INTEGER NOT NULL REFERENCES Chapters(id) ON DELETE CASCADE): Khóa ngoại, liên kết đến chương.
*   `page_number` (INTEGER NOT NULL): Số thứ tự trang trong chương.
*   `image_url` (VARCHAR(255) NOT NULL): URL của ảnh trang.
*   `image_alt_text` (VARCHAR(255)): Văn bản thay thế cho ảnh (hỗ trợ SEO và accessibility).
*   `created_at`: Dấu thời gian.
*   `UNIQUE (chapter_id, page_number)`: Đảm bảo mỗi trang trong một chương là duy nhất.

### 8. Bảng `Comic_Genres` (Bảng trung gian)

Quản lý mối quan hệ nhiều-nhiều giữa `Comics` và `Genres`.

*   `comic_id` (INTEGER REFERENCES Comics(id)): Khóa ngoại.
*   `genre_id` (INTEGER REFERENCES Genres(id)): Khóa ngoại.
*   `created_at`: Dấu thời gian.
*   `PRIMARY KEY (comic_id, genre_id)`.

### 9. Bảng `Comic_Authors` (Bảng trung gian)

Quản lý mối quan hệ nhiều-nhiều giữa `Comics` và `Authors`.

*   `comic_id` (INTEGER REFERENCES Comics(id)): Khóa ngoại.
*   `author_id` (INTEGER REFERENCES Authors(id)): Khóa ngoại.
*   `role` (VARCHAR(100)): Vai trò của tác giả đối với truyện đó (ví dụ: 'Story', 'Art').
*   `created_at`: Dấu thời gian.
*   `PRIMARY KEY (comic_id, author_id, role)`: `role` được thêm vào khóa chính nếu một tác giả có thể có nhiều vai trò cho cùng một truyện.

### 10. Bảng `Comic_Publishers` (Bảng trung gian)

Quản lý mối quan hệ nhiều-nhiều giữa `Comics` và `Publishers`.

*   `comic_id` (INTEGER REFERENCES Comics(id)): Khóa ngoại.
*   `publisher_id` (INTEGER REFERENCES Publishers(id)): Khóa ngoại.
*   `created_at`: Dấu thời gian.
*   `PRIMARY KEY (comic_id, publisher_id)`.

### 11. Bảng `Comments`

Lưu trữ bình luận của người dùng.

*   `id` (SERIAL PRIMARY KEY): Khóa chính.
*   `user_id` (INTEGER NOT NULL REFERENCES Users(id)): Người dùng viết bình luận.
*   `comic_id` (INTEGER REFERENCES Comics(id)): Bình luận cho truyện (nếu có).
*   `chapter_id` (INTEGER REFERENCES Chapters(id)): Bình luận cho chương (nếu có).
*   `parent_comment_id` (INTEGER REFERENCES Comments(id)): Bình luận cha (nếu là trả lời).
*   `content` (TEXT NOT NULL): Nội dung bình luận.
*   `created_at`, `updated_at`: Dấu thời gian.
*   `CONSTRAINT chk_comment_target`: Đảm bảo bình luận có ít nhất một mục tiêu (truyện hoặc chương).

### 12. Bảng `Favorites`

Lưu trữ truyện yêu thích của người dùng.

*   `user_id` (INTEGER NOT NULL REFERENCES Users(id)): Khóa ngoại.
*   `comic_id` (INTEGER NOT NULL REFERENCES Comics(id)): Khóa ngoại.
*   `created_at`: Dấu thời gian.
*   `PRIMARY KEY (user_id, comic_id)`.

### 13. Bảng `Reading_Progress`

Theo dõi tiến độ đọc của người dùng.

*   `user_id` (INTEGER NOT NULL REFERENCES Users(id)): Khóa ngoại.
*   `comic_id` (INTEGER NOT NULL REFERENCES Comics(id)): Khóa ngoại.
*   `last_read_chapter_id` (INTEGER REFERENCES Chapters(id)): Chương cuối cùng đã đọc.
*   `last_read_page_number` (INTEGER): Số trang cuối cùng đã đọc trong chương đó.
*   `progress_percentage` (REAL): Phần trăm tiến độ đọc của toàn bộ truyện (tính toán dựa trên số chương/trang đã đọc).
*   `updated_at`: Dấu thời gian.
*   `PRIMARY KEY (user_id, comic_id)`.

### 14. Bảng `Comic_Views`

Theo dõi lượt xem truyện.

*   `id` (BIGSERIAL PRIMARY KEY): Khóa chính.
*   `comic_id` (INTEGER NOT NULL REFERENCES Comics(id)): Truyện được xem.
*   `user_id` (INTEGER REFERENCES Users(id)): Người dùng đã xem (nếu đăng nhập).
*   `ip_address` (VARCHAR(45)): Địa chỉ IP (cho người dùng ẩn danh, cân nhắc GDPR).
*   `user_agent` (TEXT): Thông tin trình duyệt.
*   `viewed_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Thời gian xem.

### 15. Bảng `Chapter_Views`

Theo dõi lượt xem chương.

*   `id` (BIGSERIAL PRIMARY KEY): Khóa chính.
*   `chapter_id` (INTEGER NOT NULL REFERENCES Chapters(id)): Chương được xem.
*   `user_id` (INTEGER REFERENCES Users(id)): Người dùng đã xem (nếu đăng nhập).
*   `ip_address` (VARCHAR(45)): Địa chỉ IP.
*   `user_agent` (TEXT): Thông tin trình duyệt.
*   `viewed_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Thời gian xem.

## Indexes

Các chỉ mục (indexes) đã được định nghĩa trong file SQL để tối ưu hóa hiệu suất truy vấn cho các cột thường xuyên được sử dụng trong điều kiện `WHERE`, `JOIN`, hoặc `ORDER BY`.

Ví dụ:

*   `idx_comics_title` trên `Comics(title)`
*   `idx_chapters_comic_id_release_date` trên `Chapters(comic_id, release_date DESC)`
*   Và nhiều chỉ mục khác cho các bảng `Comments`, `Comic_Views`, `Chapter_Views`.

## Triggers

Một số trigger đã được định nghĩa để tự động hóa các tác vụ:

1.  **`update_comic_on_chapter_change()`**: Tự động cập nhật `Comics.updated_at` và `Comics.last_chapter_uploaded_at` khi một chương mới được thêm hoặc cập nhật.
2.  **`update_updated_at_column()`**: Một trigger chung để tự động cập nhật cột `updated_at` trên nhiều bảng mỗi khi một bản ghi được cập nhật.

## Lưu ý khi Triển khai

*   Schema này được viết cho PostgreSQL, nhưng có thể dễ dàng điều chỉnh cho các hệ quản trị cơ sở dữ liệu SQL khác (ví dụ: MySQL, SQL Server) với một vài thay đổi nhỏ về cú pháp (ví dụ: `SERIAL` thành `AUTO_INCREMENT`, `TIMESTAMP WITH TIME ZONE` thành `DATETIME`).
*   Cân nhắc việc sử dụng UUID làm khóa chính thay vì `SERIAL` nếu có yêu cầu về việc tạo ID không tuần tự hoặc phân tán.
*   Kiểu dữ liệu `JSONB` cho `alternative_titles` là đặc thù của PostgreSQL, cung cấp khả năng truy vấn JSON hiệu quả. Nếu sử dụng CSDL khác, có thể cần lưu dưới dạng TEXT và xử lý ở tầng ứng dụng, hoặc sử dụng kiểu JSON gốc nếu có.
*   Việc lưu trữ `ip_address` cần tuân thủ các quy định về quyền riêng tư dữ liệu như GDPR.
*   Các trigger giúp duy trì tính nhất quán dữ liệu nhưng cần được kiểm tra kỹ lưỡng về hiệu suất.

Đây là một schema cơ sở vững chắc. Tùy thuộc vào các tính năng cụ thể và yêu cầu hiệu suất của ứng dụng, schema này có thể cần được điều chỉnh và tối ưu hóa thêm trong quá trình phát triển.

