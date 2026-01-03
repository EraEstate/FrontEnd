# Frontend Auto-Commit Script

Script tự động commit các thay đổi của Frontend thành 100 commits riêng biệt.

## Cách Sử Dụng

### 1. Chạy Script
```bash
cd FE/apartmentFE
node autocommit.js
```

### 2. Push Lên Remote
```bash
git push
```

## Thông Tin

Script sẽ tự động tạo 100 commits với các thông điệp liên quan đến:
- Component setup và configuration
- Page components (HomePage, PropertiesPage, Admin pages, etc.)
- API services và integration
- i18n translations cho nhiều ngôn ngữ
- State management với Zustand
- WebSocket services
- Utilities và helpers
- Styling và configuration files

## Lưu Ý

- Script sẽ tự động stage và commit các file
- Nếu file không tồn tại hoặc không có thay đổi, commit đó sẽ bị skip
- Mỗi commit tập trung vào một chức năng cụ thể
- Không có emoji, chỉ text thuần túy

