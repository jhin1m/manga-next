# Workflow Kỹ thuật: Luồng Đăng nhập/Đăng ký (Login/Registration Flow) - Next.js

## 1. Mục tiêu

Workflow này mô tả các bước kỹ thuật tổng quan để phát triển và triển khai Luồng Đăng nhập và Đăng ký cho một trang web truyện tranh tương tự dokiraw.com, sử dụng Next.js. Điều này bao gồm các form, tương tác API, và quản lý phiên người dùng.

## 2. Các Bước Kỹ thuật Triển khai với Next.js

### Bước 2.1: Lựa chọn Phương thức Xác thực

1.  **Xác thực dựa trên Credentials (Email/Password)**: Phổ biến nhất. Yêu cầu backend lưu trữ hash mật khẩu an toàn.
2.  **Xác thực qua OAuth (Social Login - Google, Facebook, GitHub, v.v.)**: Cung cấp trải nghiệm đăng nhập tiện lợi cho người dùng.
3.  **Xác thực không mật khẩu (Passwordless - Magic Links, OTP)**: Gửi link hoặc mã một lần qua email/SMS.

*Dokiraw.com dường như không có tính năng đăng nhập/đăng ký rõ ràng cho người dùng cuối để đọc truyện. Tuy nhiên, nếu xây dựng một trang tương tự có các tính năng cộng đồng (bình luận, yêu thích), xác thực là cần thiết. Workflow này sẽ tập trung vào credentials và gợi ý OAuth.* 

### Bước 2.2: Thiết kế Giao diện Người dùng (UI) cho Form

1.  **Trang Đăng nhập (`/login`)**:
    *   Input cho Email/Tên đăng nhập.
    *   Input cho Mật khẩu.
    *   Nút "Đăng nhập".
    *   Link "Quên mật khẩu?".
    *   Link "Chưa có tài khoản? Đăng ký".
    *   (Tùy chọn) Các nút Đăng nhập qua Mạng xã hội.
2.  **Trang Đăng ký (`/register`)**:
    *   Input cho Tên hiển thị/Username.
    *   Input cho Email.
    *   Input cho Mật khẩu.
    *   Input cho Xác nhận Mật khẩu.
    *   Nút "Đăng ký".
    *   Link "Đã có tài khoản? Đăng nhập".
3.  **Styling**: Sử dụng Tailwind CSS để tạo form rõ ràng, dễ sử dụng và responsive.

### Bước 2.3: Tạo các Route và Page Components

1.  **App Router**:
    *   `src/app/login/page.tsx`
    *   `src/app/register/page.tsx`
2.  **Pages Router**:
    *   `src/pages/login.tsx`
    *   `src/pages/register.tsx`

Các page này sẽ chứa các form và logic xử lý client-side.

### Bước 2.4: Tạo Form Components (Client Components)

1.  **`LoginForm.tsx`** (`src/components/auth/LoginForm.tsx`):
    *   Đánh dấu `"use client";`.
    *   Sử dụng `useState` để quản lý giá trị các input (email, password).
    *   Sử dụng `useState` để quản lý lỗi và trạng thái loading.
    *   Hàm `handleSubmit`:
        *   Validate input (ví dụ: email hợp lệ, mật khẩu không trống).
        *   Gọi API backend để đăng nhập.
        *   Xử lý response: Nếu thành công, lưu token/session và điều hướng người dùng. Nếu lỗi, hiển thị thông báo.
2.  **`RegisterForm.tsx`** (`src/components/auth/RegisterForm.tsx`):
    *   Tương tự `LoginForm`, quản lý các input (username, email, password, confirmPassword).
    *   Validate input (ví dụ: mật khẩu khớp, email chưa tồn tại - backend sẽ kiểm tra chính).
    *   Gọi API backend để đăng ký.
    *   Xử lý response.

```tsx
// Ví dụ src/components/auth/LoginForm.tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react"; // Nếu dùng NextAuth.js

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Giả sử API endpoint là /api/auth/login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Đăng nhập thất bại.");
      }
      // Đăng nhập thành công, backend có thể trả về token hoặc set cookie session
      // Nếu dùng NextAuth.js:
      // const result = await signIn("credentials", { redirect: false, email, password });
      // if (result?.error) throw new Error(result.error);
      
      router.push("/"); // Điều hướng về trang chủ hoặc dashboard
      router.refresh(); // Refresh để cập nhật trạng thái server (ví dụ: header)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  // JSX cho form...
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Đăng Nhập</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Mật khẩu</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
        {/* Links to register, forgot password */}
    </form>
  );
}
```

### Bước 2.5: API Routes cho Backend Logic (Nếu không dùng Backend riêng)

Nếu bạn không có một backend API riêng, bạn có thể sử dụng API Routes của Next.js (`src/app/api/...` hoặc `src/pages/api/...`) để xử lý logic xác thực.

1.  **`/api/auth/login`**: Nhận email, password. Kiểm tra với database. Nếu hợp lệ, tạo session/token (ví dụ: sử dụng JWT hoặc thư viện như `iron-session`) và trả về response thành công.
2.  **`/api/auth/register`**: Nhận username, email, password. Hash mật khẩu (ví dụ: dùng `bcryptjs`). Lưu người dùng mới vào database. Trả về response thành công.
3.  **`/api/auth/logout`**: Xóa session/token.
4.  **`/api/auth/user`**: Trả về thông tin người dùng hiện tại nếu đã đăng nhập (để client biết trạng thái).

### Bước 2.6: Quản lý Phiên (Session Management)

1.  **HTTPOnly Cookies**: Cách an toàn để lưu trữ session ID hoặc token. Backend sẽ set cookie này.
2.  **JWT (JSON Web Tokens)**: Có thể lưu trong `localStorage` (ít an toàn hơn cookie) hoặc HTTPOnly cookie. JWT chứa thông tin người dùng và được ký bởi server.
3.  **Thư viện `next-auth` (Khuyến nghị)**: Đây là giải pháp toàn diện cho xác thực trong Next.js. Hỗ trợ credentials, OAuth, database adapters, quản lý session, và nhiều hơn nữa. Nó đơn giản hóa rất nhiều bước.
    *   Cài đặt: `npm install next-auth`.
    *   Cấu hình trong `src/app/api/auth/[...nextauth]/route.ts` (App Router) hoặc `src/pages/api/auth/[...nextauth].ts` (Pages Router).
    *   Cung cấp `SessionProvider` trong `layout.tsx` hoặc `_app.tsx`.
    *   Sử dụng hooks như `useSession`, `signIn`, `signOut`.

### Bước 2.7: Bảo vệ Route (Protected Routes)

Một số trang (ví dụ: trang hồ sơ người dùng, trang cài đặt) chỉ nên truy cập được khi người dùng đã đăng nhập.

1.  **Client-Side**: Trong component của trang được bảo vệ, sử dụng hook để kiểm tra trạng thái đăng nhập (ví dụ: `useSession` từ `next-auth` hoặc gọi API `/api/auth/user`). Nếu chưa đăng nhập, điều hướng về trang login.
2.  **Server-Side (Middleware hoặc `getServerSideProps`)**: Kiểm tra session trên server. Nếu chưa đăng nhập, điều hướng.
    *   **Next.js Middleware**: (`middleware.ts` ở root hoặc `src`). Kiểm tra request, nếu là route cần bảo vệ và chưa có session, rewrite hoặc redirect.
    *   **`getServerSideProps` (Pages Router)**: Kiểm tra session, nếu không có thì redirect.
    *   **App Router (Server Components)**: Có thể kiểm tra session trực tiếp trong Server Component và quyết định render gì hoặc redirect.

### Bước 2.8: Hiển thị Trạng thái Người dùng và Nút Logout

1.  **Trong Header**: Hiển thị tên người dùng/avatar và nút "Đăng xuất" nếu đã đăng nhập. Ngược lại, hiển thị nút "Đăng nhập"/"Đăng ký".
2.  Sử dụng context hoặc session data để render có điều kiện.

### Bước 2.9: Xử lý Quên Mật khẩu

1.  **Form "Quên Mật khẩu"**: Nhập email.
2.  **API Backend**: Gửi email chứa link reset mật khẩu (link này thường chứa token dùng một lần).
3.  **Trang "Đặt lại Mật khẩu"**: Người dùng click link, nhập mật khẩu mới. Backend xác thực token và cập nhật mật khẩu.

## 3. Sử dụng `next-auth` (Ví dụ tóm tắt)

Nếu dùng `next-auth`:

1.  **Cài đặt**: `npm install next-auth`
2.  **Tạo `[...nextauth]` route**:
    ```typescript
    // src/app/api/auth/[...nextauth]/route.ts (hoặc pages/api/...)
    import NextAuth from "next-auth"
    import CredentialsProvider from "next-auth/providers/credentials"
    // import GoogleProvider from "next-auth/providers/google";

    export const authOptions = {
      providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials, req) {
            // Logic kiểm tra credentials với database của bạn
            // const user = await db.users.findUnique({ where: { email: credentials.email } });
            // if (user && bcrypt.compareSync(credentials.password, user.password)) {
            //   return { id: user.id, name: user.name, email: user.email };
            // }
            // return null;
            // Placeholder:
            if (credentials?.email === "user@example.com" && credentials?.password === "password") {
                return { id: "1", name: "Test User", email: "user@example.com" };
            }
            return null;
          }
        }),
        // GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
      ],
      // secret: process.env.NEXTAUTH_SECRET, // Cần thiết cho production
      // pages: { signIn: 
'/login
' }, // Trang đăng nhập tùy chỉnh
    };
    const handler = NextAuth(authOptions);
    export { handler as GET, handler as POST };
    ```
3.  **Thêm `SessionProvider`**:
    ```tsx
    // src/components/auth/NextAuthProvider.tsx
    "use client";
    import { SessionProvider } from "next-auth/react";
    export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
        return <SessionProvider>{children}</SessionProvider>;
    }

    // src/app/layout.tsx
    import NextAuthProvider from "@/components/auth/NextAuthProvider";
    // ...
    <NextAuthProvider>
        {/* ... your app ... */}
    </NextAuthProvider>
    // ...
    ```
4.  **Sử dụng Hooks trong Components**:
    ```tsx
    import { useSession, signIn, signOut } from "next-auth/react";
    const { data: session, status } = useSession();
    if (status === "authenticated") { /* Đã đăng nhập */ }
    // Gọi signIn() hoặc signOut()
    ```

## 4. Lưu ý Quan trọng

*   **Bảo mật**: Luôn hash mật khẩu phía backend. Sử dụng HTTPS. Cẩn thận với XSS, CSRF.
*   **Trải nghiệm Người dùng**: Cung cấp phản hồi rõ ràng (lỗi, thành công). Giữ form đơn giản.
*   **Validation**: Validate input cả phía client và server.
*   **Tách biệt Logic**: Giữ logic UI (Client Components) và logic backend (API Routes/Backend riêng) tách biệt.

Luồng đăng nhập/đăng ký là một phần phức tạp nhưng quan trọng. Sử dụng thư viện như `next-auth` có thể giảm đáng kể công sức và tăng cường bảo mật.
