# 📝 HƯỚNG DẪN GIAO DIỆN VÀ LUỒNG HOẠT ĐỘNG - BIÊN TẬP VIÊN (EDITOR)

## 🎯 Tổng Quan

**Editor Dashboard** là hệ thống quản lý nội dung dành cho **Biên tập viên**, cho phép tạo, chỉnh sửa và quản lý các bài viết tin tức và Wiki articles.

---

## 🚪 Truy Cập

### Đăng Nhập
1. Truy cập `/login`
2. Đăng nhập với tài khoản có role **EDITOR**
3. Tự động redirect đến `/editor`

### URL
- **Dashboard chính:** `/editor`
- **Quản lý tin tức:** `/editor` (chọn menu "Tin tức")
- **Quản lý Wiki:** `/editor` (chọn menu "Wiki")

---

## 🎨 GIAO DIỆN CHI TIẾT

### 1. **Layout Tổng Quan**

```
┌─────────────────────────────────────────────────────────────┐
│  [Editor Panel]  [☰]                                        │  ← Header Sidebar
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │              Main Content Area                    │
│ (Menu)   │              (Dynamic Content)                    │
│          │                                                   │
│          │                                                   │
│          │                                                   │
│ [Đăng    │                                                   │
│  xuất]   │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### 2. **Sidebar Menu**

| Menu Item | Icon | Mô Tả |
|-----------|------|-------|
| **Tổng quan** | 📊 TrendingUp | Dashboard với thống kê tổng quan |
| **Tin tức** | 📰 Newspaper | Quản lý bài viết tin tức |
| **Wiki** | 📚 BookOpen | Quản lý Wiki articles |
| **Thông báo** | 🔔 Bell | Xem thông báo hệ thống |
| **Hồ sơ** | ⚙️ Settings | Quản lý thông tin cá nhân |
| **Đăng xuất** | 🚪 LogOut | Đăng xuất khỏi hệ thống |

**Tính năng Sidebar:**
- ✅ Collapse/Expand (click icon ☰)
- ✅ Highlight menu đang active
- ✅ Responsive design

---

## 📊 1. TRANG TỔNG QUAN (Dashboard)

### Giao Diện

```
┌─────────────────────────────────────────────────────────────┐
│ Chào mừng, [Tên Editor]!                                     │
│ Quản lý nội dung tin tức và wiki                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📰       │  │ 📚       │  │ 👁️       │  │ ✅       │   │
│  │ Tổng bài │  │ Wiki     │  │ Tổng lượt│  │ Đã       │   │
│  │ viết     │  │ articles │  │ xem      │  │ publish  │   │
│  │ 0        │  │ 0        │  │ 0        │  │ 0        │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Tin tức gần đây        │  │ Wiki articles gần đây  │    │
│  │ [Xem tất cả →]         │  │ [Xem tất cả →]         │    │
│  │                        │  │                        │    │
│  │  📰                    │  │  📚                    │    │
│  │  Chưa có tin tức nào   │  │  Chưa có bài viết nào  │    │
│  └────────────────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Thống Kê Cards

#### Card 1: Tổng Bài Viết
- **Icon:** 📰 Newspaper (màu xanh dương)
- **Giá trị:** Tổng số bài viết tin tức đã tạo
- **Thay đổi:** Số bài viết mới trong tháng (+X)

#### Card 2: Wiki Articles
- **Icon:** 📚 BookOpen (màu xanh lá)
- **Giá trị:** Tổng số Wiki articles đã tạo
- **Thay đổi:** Số articles mới trong tháng (+X)

#### Card 3: Tổng Lượt Xem
- **Icon:** 👁️ Eye (màu tím)
- **Giá trị:** Tổng lượt xem tất cả bài viết
- **Thay đổi:** % tăng/giảm so với tháng trước

#### Card 4: Đã Publish
- **Icon:** ✅ CheckCircle (màu cam)
- **Giá trị:** Số bài viết đã publish
- **Thay đổi:** Số bài publish trong tháng (+X)

### Preview Sections

#### Tin Tức Gần Đây
- Hiển thị 5-10 bài viết mới nhất
- Click "Xem tất cả →" → Chuyển sang trang Quản lý Tin tức

#### Wiki Articles Gần Đây
- Hiển thị 5-10 articles mới nhất
- Click "Xem tất cả →" → Chuyển sang trang Quản lý Wiki

---

## 📰 2. QUẢN LÝ TIN TỨC (News Management)

### Giao Diện

```
┌─────────────────────────────────────────────────────────────┐
│ Tin tức                                                      │
│ Quản lý bài viết tin tức                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [🔍 Tìm kiếm...]  [📁 Category ▼]  [➕ Tạo bài viết mới]  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📰 Bài viết 1                                        │    │
│  │ [Hình ảnh]  Tiêu đề bài viết                        │    │
│  │            📅 15/12/2024  👁️ 1,234 views           │    │
│  │            [✏️ Sửa]  [👁️ Xem]  [🗑️ Xóa]            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📰 Bài viết 2                                        │    │
│  │ ...                                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [◀ Trước]  [1] [2] [3]  [Sau ▶]                            │
└─────────────────────────────────────────────────────────────┘
```

### Chức Năng

#### A. Tìm Kiếm & Lọc
- **Tìm kiếm:** Theo tiêu đề, nội dung
- **Lọc theo Category:**
  - Thị trường BDS
  - Chính sách - Pháp luật
  - Đầu tư BDS
  - Thiết kế - Trang trí
  - Kinh nghiệm mua bán
- **Sắp xếp:** Mới nhất, Lượt xem nhiều nhất, A-Z

#### B. Danh Sách Bài Viết
Mỗi bài viết hiển thị:
- **Hình ảnh thumbnail**
- **Tiêu đề**
- **Category badge** (màu sắc theo category)
- **Ngày đăng**
- **Lượt xem**
- **Trạng thái:** Draft / Published
- **Actions:**
  - ✏️ **Sửa** → Mở form chỉnh sửa
  - 👁️ **Xem** → Xem preview công khai
  - 🗑️ **Xóa** → Xóa bài viết (chỉ Editor, Admin mới xóa được)

#### C. Tạo Bài Viết Mới
Click **"➕ Tạo bài viết mới"** → Mở form:

```
┌─────────────────────────────────────────────────────────────┐
│ Tạo Bài Viết Mới                                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Tiêu đề *                                                    │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Mô tả ngắn *                                                 │
│  [───────────────────────────────────────────────]            │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Nội dung *                                                   │
│  [Rich Text Editor]                                           │
│  [───────────────────────────────────────────────]            │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Hình ảnh đại diện *                                          │
│  [📷 Upload Image]                                            │
│                                                               │
│  Category *                                                    │
│  [📁 Thị trường BDS ▼]                                        │
│                                                               │
│  Tags (tùy chọn)                                              │
│  [🏷️ Thêm tag...]                                             │
│                                                               │
│  [💾 Lưu nháp]  [📤 Publish]  [❌ Hủy]                       │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **Tiêu đề** (required)
- **Mô tả ngắn** (required, max 200 chars)
- **Nội dung** (required, Rich Text Editor)
- **Hình ảnh đại diện** (required, upload)
- **Category** (required, dropdown)
- **Tags** (optional, multiple)

**Actions:**
- **💾 Lưu nháp:** Lưu bài viết ở trạng thái Draft
- **📤 Publish:** Publish bài viết ngay lập tức
- **❌ Hủy:** Hủy bỏ, quay lại danh sách

#### D. Chỉnh Sửa Bài Viết
Click **"✏️ Sửa"** → Mở form tương tự form tạo, với dữ liệu đã điền sẵn.

**Actions:**
- **💾 Lưu thay đổi:** Cập nhật bài viết
- **📤 Publish:** Publish nếu đang ở trạng thái Draft
- **❌ Hủy:** Hủy bỏ thay đổi

---

## 📚 3. QUẢN LÝ WIKI (Wiki Management)

### Giao Diện

```
┌─────────────────────────────────────────────────────────────┐
│ Wiki                                                          │
│ Quản lý Wiki articles                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 🛒 Mua    │  │ 🏠 Bán   │  │ 📄 Thuê  │  │ 💰 Tài   │   │
│  │ BĐS      │  │ BĐS       │  │ BĐS      │  │ chính    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  [🔍 Tìm kiếm...]  [📁 Category ▼]  [➕ Tạo article mới]    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📚 Article 1                                         │    │
│  │ [Hình ảnh]  Tiêu đề article                         │    │
│  │            📅 15/12/2024  👁️ 1,234 views            │    │
│  │            [✏️ Sửa]  [👁️ Xem]  [📤 Publish]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [◀ Trước]  [1] [2] [3]  [Sau ▶]                            │
└─────────────────────────────────────────────────────────────┘
```

### Categories

1. **🛒 Mua BĐS** - Hướng dẫn mua bất động sản
2. **🏠 Bán BĐS** - Mẹo bán nhà, định giá
3. **📄 Thuê BĐS** - Hướng dẫn thuê nhà
4. **💰 Tài chính BĐS** - Vay mua nhà, đầu tư
5. **📋 Quy hoạch - Pháp lý** - Thủ tục pháp lý
6. **🎨 Nội - Ngoại thất** - Thiết kế nhà
7. **🌬️ Phong thủy** - Phong thủy nhà ở

### Chức Năng

#### A. Tạo Wiki Article Mới
Click **"➕ Tạo article mới"** → Mở form:

```
┌─────────────────────────────────────────────────────────────┐
│ Tạo Wiki Article                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Tiêu đề *                                                    │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Slug (URL) *                                                  │
│  [───────────────────────────────────────────────]            │
│  (Tự động tạo từ tiêu đề)                                     │
│                                                               │
│  Category *                                                    │
│  [📁 Mua BĐS ▼]                                               │
│                                                               │
│  Mô tả ngắn *                                                 │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Nội dung *                                                   │
│  [Rich Text Editor]                                           │
│  [───────────────────────────────────────────────]            │
│                                                               │
│  Hình ảnh đại diện *                                          │
│  [📷 Upload Image]                                            │
│                                                               │
│  [💾 Lưu nháp]  [📤 Publish]  [❌ Hủy]                       │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields:**
- **Tiêu đề** (required)
- **Slug** (required, tự động tạo từ tiêu đề, có thể chỉnh sửa)
- **Category** (required)
- **Mô tả ngắn** (required)
- **Nội dung** (required, Rich Text Editor)
- **Hình ảnh đại diện** (required)

**Actions:**
- **💾 Lưu nháp:** Lưu article ở trạng thái Draft
- **📤 Publish:** Publish article (chỉ Editor và Admin mới publish được)
- **❌ Hủy:** Hủy bỏ

#### B. Chỉnh Sửa Wiki Article
Tương tự như chỉnh sửa tin tức.

#### C. Publish Wiki Article
- Editor có quyền **Publish** Wiki articles
- Click **"📤 Publish"** → Article được publish và hiển thị công khai

---

## 🔔 4. THÔNG BÁO (Notifications)

### Giao Diện

```
┌─────────────────────────────────────────────────────────────┐
│ Thông báo                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔔 Bài viết của bạn đã được publish                  │    │
│  │    2 giờ trước                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔔 Có comment mới trên bài viết của bạn               │    │
│  │    5 giờ trước                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Đánh dấu tất cả đã đọc]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Tính năng:**
- Xem danh sách thông báo
- Đánh dấu đã đọc
- Click vào thông báo → Chuyển đến bài viết liên quan

---

## ⚙️ 5. HỒ SƠ (Profile)

Quản lý thông tin cá nhân:
- Họ tên
- Email
- Số điện thoại
- Avatar
- Đổi mật khẩu

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### Luồng 1: Tạo Bài Viết Tin Tức Mới

```
1. Editor đăng nhập
   ↓
2. Vào Editor Dashboard (/editor)
   ↓
3. Click menu "Tin tức"
   ↓
4. Click button "➕ Tạo bài viết mới"
   ↓
5. Điền form:
   - Tiêu đề
   - Mô tả ngắn
   - Nội dung (Rich Text Editor)
   - Upload hình ảnh
   - Chọn category
   - Thêm tags (tùy chọn)
   ↓
6. Chọn action:
   a) "💾 Lưu nháp" → Lưu ở trạng thái Draft
   b) "📤 Publish" → Publish ngay lập tức
   ↓
7. Quay lại danh sách tin tức
   ↓
8. Bài viết hiển thị trong danh sách
```

### Luồng 2: Chỉnh Sửa Bài Viết

```
1. Vào menu "Tin tức"
   ↓
2. Tìm bài viết cần sửa
   ↓
3. Click "✏️ Sửa"
   ↓
4. Form mở với dữ liệu đã điền sẵn
   ↓
5. Chỉnh sửa các trường cần thiết
   ↓
6. Click "💾 Lưu thay đổi"
   ↓
7. Bài viết được cập nhật
```

### Luồng 3: Publish Wiki Article

```
1. Vào menu "Wiki"
   ↓
2. Tìm article cần publish
   ↓
3. Click "📤 Publish"
   ↓
4. Xác nhận publish
   ↓
5. Article được publish và hiển thị công khai
```

### Luồng 4: Xem Thống Kê

```
1. Vào Editor Dashboard
   ↓
2. Xem các Stats Cards:
   - Tổng bài viết
   - Wiki articles
   - Tổng lượt xem
   - Đã publish
   ↓
3. Click "Xem tất cả →" để xem chi tiết
```

---

## 🔐 PHÂN QUYỀN

### Editor Có Thể:
- ✅ Tạo bài viết tin tức
- ✅ Sửa bài viết tin tức
- ✅ Tạo Wiki articles
- ✅ Sửa Wiki articles
- ✅ **Publish Wiki articles** (quyền đặc biệt)
- ✅ Xem thống kê của mình
- ✅ Quản lý hồ sơ cá nhân

### Editor KHÔNG Thể:
- ❌ Xóa bài viết (chỉ Admin)
- ❌ Xóa Wiki articles (chỉ Admin)
- ❌ Quản lý users
- ❌ Quản lý properties/projects
- ❌ Truy cập Admin Dashboard

---

## 🎨 DESIGN SYSTEM

### Màu Sắc
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Orange (#F59E0B)
- **Danger:** Red (#EF4444)
- **Info:** Purple (#8B5CF6)

### Icons
- Sử dụng **Lucide React Icons**
- Consistent icon size: 20px (menu), 24px (cards)

### Typography
- **Heading 1:** 3xl, bold
- **Heading 2:** 2xl, bold
- **Body:** base, regular
- **Small:** sm, regular

### Spacing
- **Card padding:** 24px
- **Section gap:** 24px
- **Button padding:** 12px 16px

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 1024px)
- Sidebar: 256px (expanded), 80px (collapsed)
- Main content: Full width
- Grid: 4 columns (stats cards)

### Tablet (768px - 1024px)
- Sidebar: Collapsible
- Grid: 2 columns (stats cards)

### Mobile (< 768px)
- Sidebar: Hidden, toggle via hamburger menu
- Grid: 1 column (stats cards)
- Stack layout

---

## 🚀 TÍNH NĂNG TƯƠNG LAI

- [ ] Rich Text Editor với formatting
- [ ] Upload multiple images
- [ ] Preview bài viết trước khi publish
- [ ] Lịch sử chỉnh sửa (version control)
- [ ] Collaboration (nhiều Editor cùng chỉnh sửa)
- [ ] Analytics chi tiết (views, engagement)
- [ ] Export bài viết (PDF, Word)
- [ ] Scheduled publish (lên lịch publish)

---

**Last Updated:** 2024-12-18
**Version:** 1.0

