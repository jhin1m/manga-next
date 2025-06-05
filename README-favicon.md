# 🎨 Favicon Setup Guide

## Tổng quan
Dự án đã được cấu hình favicon hoàn chỉnh với NextJS 15 App Router, hỗ trợ tất cả thiết bị và trình duyệt.

## 📁 Cấu trúc Files

### App Directory (`src/app/`)
```
src/app/
├── favicon.ico          # Favicon chính (đã có)
├── icon.svg            # SVG icon (mới tạo)
├── apple-icon.tsx      # Apple touch icon (mới tạo)
└── manifest.ts         # Web app manifest (mới tạo)
```

### Public Directory (sẽ được tạo)
```
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── icon-192.png
├── icon-512.png
└── apple-touch-icon-*.png
```

## 🚀 Cách sử dụng

### 1. Tạo icons tự động
```bash
# Cài đặt sharp (nếu chưa có)
pnpm add sharp

# Tạo tất cả icon sizes
pnpm run generate:icons
```

### 2. Kiểm tra favicon
- **Development**: `http://localhost:3000/favicon.ico`
- **Browser tab**: Kiểm tra icon hiển thị
- **Mobile**: Test trên iOS/Android

### 3. Tùy chỉnh icon
Chỉnh sửa file `src/app/icon.svg` để thay đổi design favicon.

## ✨ Tính năng

### ✅ Đã cấu hình
- [x] Favicon cơ bản (favicon.ico)
- [x] SVG icon scalable
- [x] Apple touch icon cho iOS
- [x] Web app manifest cho PWA
- [x] Script tự động generate icons
- [x] SEO integration

### 🎯 Hỗ trợ
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Mobile, Tablet
- **Platforms**: Windows, macOS, iOS, Android
- **PWA**: Progressive Web App support

## 🛠️ Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa gradient trong `src/app/icon.svg`:
```svg
<linearGradient id="gradient">
  <stop offset="0%" style="stop-color:#1a1a1a"/>
  <stop offset="100%" style="stop-color:#333333"/>
</linearGradient>
```

### Thay đổi design
Chỉnh sửa path elements trong SVG để tạo design mới.

### Manifest settings
Cập nhật `src/app/manifest.ts` để thay đổi PWA settings.

## 🔧 Troubleshooting

### Favicon không hiển thị
1. Clear browser cache
2. Test trong incognito mode
3. Kiểm tra file paths
4. Restart dev server

### Icons bị mờ
1. Kiểm tra SVG quality
2. Tăng resolution trong script
3. Sử dụng PNG thay SVG

## 📚 Tài liệu tham khảo
- [NextJS Favicon Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Apple Touch Icons](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
