# KT - Trương Vũ Minh Vân/2280603646
# KT - CRUD User & Role API

API RESTful với Express.js + MongoDB (Docker) để quản lý User và Role.

## Yêu cầu

- [Node.js](https://nodejs.org/) (v16+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/) (để test API)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (để xem dữ liệu)

## Cài đặt & Chạy

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd KT
npm install
```

### 2. Khởi động MongoDB trên Docker

```bash
docker compose up -d
```

Container `mongodb-kt` sẽ chạy ở port **27017** với:
- Username: `admin`
- Password: `password123`
- Database: `kt_db`

### 3. Chạy server

```bash
npm start
```

Server chạy tại `http://localhost:3000`

---

## Kết nối MongoDB Compass

Mở MongoDB Compass, tạo New Connection với URI:

```
mongodb://admin:password123@localhost:27017/?authSource=admin
```

Nhấn **Connect** → chọn database **`kt_db`** → xem collections `roles` và `users`.

---

## Test API trên Postman

### Import Postman Collection có sẵn

Dự án đã có sẵn Postman collection trong thư mục `postman/`. Để import:

1. Mở **Postman** → nhấn **Import**
2. Chọn thư mục `postman/` trong dự án
3. Postman sẽ import collection **KT API** và environment **KT Local** (`baseUrl = http://localhost:3000`)
4. Chọn environment **KT Local** ở góc trên bên phải Postman

Collection đã được chia thành **4 phần** theo yêu cầu:

> Tất cả request body dùng **raw → JSON**

### Yêu cầu 1: CRUD Role & User (Xóa mềm)

**CRUD Role:**

| Method | URL | Body | Mô tả |
|--------|-----|------|-------|
| POST | `/roles` | `{ "name": "Admin", "description": "Quản trị viên" }` | Tạo role |
| GET | `/roles` | — | Lấy tất cả roles |
| GET | `/roles/:id` | — | Lấy role theo ID |
| PUT | `/roles/:id` | `{ "description": "Super Admin" }` | Cập nhật role |
| DELETE | `/roles/:id` | — | Xóa mềm role |

**CRUD User (getAll có query theo username includes):**

| Method | URL | Body | Mô tả |
|--------|-----|------|-------|
| POST | `/users` | `{ "username": "john", "password": "123456", "email": "john@test.com", "fullName": "John Doe", "role": "<role_id>" }` | Tạo user |
| GET | `/users` | — | Lấy tất cả users |
| GET | `/users?username=jo` | — | Tìm user theo username (includes) |
| GET | `/users/:id` | — | Lấy user theo ID |
| PUT | `/users/:id` | `{ "fullName": "John Updated" }` | Cập nhật user |
| DELETE | `/users/:id` | — | Xóa mềm user |

### Yêu cầu 2: Enable User

| Method | URL | Body | Mô tả |
|--------|-----|------|-------|
| POST | `/users/enable` | `{ "email": "john@test.com", "username": "john" }` | Nếu đúng email + username → `status: true` |

### Yêu cầu 3: Disable User

| Method | URL | Body | Mô tả |
|--------|-----|------|-------|
| POST | `/users/disable` | `{ "email": "john@test.com", "username": "john" }` | Nếu đúng email + username → `status: false` |

### Yêu cầu 4: Lấy Users theo Role

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/roles/:id/users` | Lấy tất cả users có role = id |

---

## Thứ tự test đề xuất

1. `POST /roles` → tạo role, **copy `_id`**
2. `GET /roles` → kiểm tra role vừa tạo
3. `POST /users` → tạo user (paste `_id` role vào trường `role`)
4. `GET /users` → kiểm tra user
5. `GET /users?username=jo` → test query includes
6. `POST /users/enable` → kiểm tra `status: true`
7. `POST /users/disable` → kiểm tra `status: false`
8. `GET /roles/:id/users` → lấy users theo role
9. `DELETE /users/:id` → xóa mềm, GET lại sẽ không thấy
10. Mở **MongoDB Compass** → kiểm tra `isDeleted: true`

---

## Cấu trúc dự án

```
KT/
├── bin/www              # Entry point
├── models/
│   ├── User.js          # User schema
│   └── Roles.js         # Role schema
├── routes/
│   └── index.js         # Tất cả API routes
├── postman/
│   ├── collections/     # Postman collection (KT API)
│   │   └── KT API/
│   │       ├── CRUD Role/
│   │       ├── CRUD User/
│   │       ├── Enable - Disable User/
│   │       └── Users by Role/
│   └── environments/    # Postman environment
│       └── KT Local.yaml
├── app.js               # Express config
├── docker-compose.yml   # MongoDB container
├── package.json
└── .gitignore
```
