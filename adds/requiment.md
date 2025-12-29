## Yêu cầu

Xây dựng website sử dụng reactjs/nextjs gồm một số tính năng dưới đây

### **1. Đăng nhập**

- Người dùng nhập username + password để gọi API `/auth/login`.
- API trả **access token** và tự động set **refresh token** vào cookie.
- Frontend lưu **access token** (cookie hoặc memory).
- Nếu đã có access token hợp lệ → tự động vào màn hình chính.
- Khi access token hết hạn:
    - Gọi `/auth/refresh` (API tự đọc refresh token từ cookie).
    - Nhận access token mới và dùng tiếp.
### **2. Danh sách giá trị (Default Values)**

- Giao diện bảng hiển thị danh sách giá trị.
- Có **filter theo loại giá trị** (`FormulaUnit`, `TestGroup`, `MethodGroup`). filter sẽ được lưu tại searchParams
- Khi thay đổi loại → gọi API:
    
    ```
    GET /default-value?type=<type>
    ```
    
- Gửi kèm `Authorization: Bearer <access-token>`.
- Nếu API trả 401 → tự động refresh token → gọi lại request
### **3. Thêm giá trị mới**

- Có nút mở **dialog thêm giá trị**.
- Dialog gồm:
    - Select loại giá trị
    - Input giá trị
- Thêm thành công → đóng dialog → reload bảng.
## **Authentication API**

## **1. Login**

Đăng nhập bằng tài khoản người dùng để nhận **Access Token** và **Refresh Token**.

### **Endpoint**

```
POST /auth/login
```

### **Request Headers**

| Key | Value |
| --- | --- |
| Content-Type | application/json |

### **Request Body**
### **Request Body**

```json
{
  "username": "0111111111",
  "password": "39067"
}
```

### **cURL Example**

```bash
curl --location 'https://c-lims-api-test.dtp-dev.site/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "0111111111",
    "password": "39067"
}'
```
## **2. Refresh Access Token**

Sử dụng Refresh Token (được lưu trong cookie `lims-refresh-token`) để lấy Access Token mới.

### **Endpoint**

```
GET /auth/refresh
```

### **Request Headers**
### **cURL Example**

```bash
curl --location 'https://c-lims-api-test.dtp-dev.site/auth/refresh' \
--header 'Cookie: lims-refresh-token=<token>'
```
# **Default Value API**

## **3. Get All Values**

Lấy tất cả giá trị theo từng loại (type).

### **Endpoint**

```
GET /default-value
```

### **Query Parameters**
Request Headers
### **cURL Example**

```bash
curl --location 'https://c-lims-api-test.dtp-dev.site/default-value?type=<type>' \
--header 'Authorization: Bearer <access-token>'
```
### **Supported `type` Values**

- `FormulaUnit`
- `TestGroup`
- `MethodGroup`

---

## **4. Add New Value**

Thêm mới một giá trị theo từng loại.

### **Endpoint**

```
POST /default-value
```
Query Parameters
### **Request Headers**

| Key | Value |
| --- | --- |
| Authorization | Bearer `<access-token>` |
| Content-Type | application/json |

### **Request Body**

```json
{
  "value": "1000",
  "type": "FormulaUnit"
}
```
### **cURL Example**

```bash
curl --location 'https://c-lims-api.test.dtp-dev.site/default-value?type=<type>' \
--header 'Authorization: Bearer <access-token>' \
--header 'Content-Type: application/json' \
--data '{
    "value": "1000",
    "type": "FormulaUnit"
}'
```