# Test Authentication Changes

## Các thay đổi đã thực hiện:

### 1. ✅ Cập nhật NextAuth configuration (`src/lib/auth.ts`)
- Thay đổi credentials từ `email` thành `emailOrUsername`
- Thêm logic phát hiện email vs username (kiểm tra có chứa '@' không)
- Cập nhật query để tìm user bằng email hoặc username

### 2. ✅ Cập nhật Login Form (`src/components/auth/login-form.tsx`)
- Thay đổi schema validation từ `email` thành `emailOrUsername`
- Cập nhật form fields và labels
- Cập nhật signIn call để sử dụng `emailOrUsername`

### 3. ✅ Cập nhật Register Form (`src/components/auth/register-form.tsx`)
- Thêm import `signIn` từ next-auth/react
- Thêm logic auto-login sau khi đăng ký thành công
- Cập nhật toast messages và flow

### 4. ✅ Cập nhật Translation files
- Thêm `emailOrUsername` key vào cả en.json và vi.json
- Thêm `emailOrUsernameRequired` error message

## Test Cases cần kiểm tra:

### Login Form:
1. **Đăng nhập bằng email**: 
   - Input: `user@example.com` + password
   - Expected: Thành công nếu credentials đúng

2. **Đăng nhập bằng username**:
   - Input: `username` + password  
   - Expected: Thành công nếu credentials đúng

3. **Validation errors**:
   - Input trống: Hiển thị "Please enter your email or username"
   - Password trống: Hiển thị "Don't forget your password!"

### Register Form:
1. **Đăng ký thành công + auto-login**:
   - Input: username, email, password, confirmPassword
   - Expected: 
     - Đăng ký thành công
     - Tự động đăng nhập
     - Redirect về trang chủ
     - Toast: "Welcome! You have been logged in successfully."

2. **Đăng ký thành công nhưng auto-login thất bại**:
   - Expected: 
     - Toast: "Registration successful, but auto-login failed. Please log in manually."
     - Redirect về /auth/login

3. **Đăng ký thất bại**:
   - Input: email/username đã tồn tại
   - Expected: Hiển thị error message

### Database Integration:
1. **User lookup by email**: Kiểm tra `prisma.users.findFirst` với email
2. **User lookup by username**: Kiểm tra `prisma.users.findFirst` với username

## Cách test:

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test Login**:
   - Truy cập `/auth/login`
   - Thử đăng nhập bằng email và username
   - Kiểm tra validation messages

3. **Test Register**:
   - Truy cập `/auth/register`
   - Đăng ký tài khoản mới
   - Kiểm tra auto-login flow

4. **Test i18n**:
   - Chuyển đổi ngôn ngữ (EN/VI)
   - Kiểm tra labels và error messages

## Potential Issues:

1. **NextAuth session**: Cần kiểm tra session có được tạo đúng không
2. **Database queries**: Kiểm tra performance của findFirst vs findUnique
3. **Error handling**: Đảm bảo tất cả edge cases được xử lý
4. **Translation keys**: Kiểm tra tất cả keys có tồn tại trong cả 2 ngôn ngữ

## Files đã thay đổi:
- `src/lib/auth.ts`
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/messages/en.json`
- `src/messages/vi.json`
