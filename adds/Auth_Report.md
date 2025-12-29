# Báo cáo luồng Auth JWT (Next.js + React Query + Axios)

## Mục tiêu
- Đăng nhập bằng username/password để lấy Access Token.
- Backend tự set Refresh Token vào cookie `lims-refresh-token`.
- Frontend lưu Access Token trong cookie, tự động refresh khi 401.
- Bảo vệ các trang yêu cầu đăng nhập, gọi API kèm Authorization.

---

## Luồng đăng nhập
1. Người dùng nhập `username` và `password`.
2. FE gọi `POST /auth/login`.
3. Backend trả `accessToken` và set cookie `lims-refresh-token`.
4. FE lưu `accessToken` vào cookie (client).
5. Điều hướng vào màn hình chính nếu thành công.

Endpoint:
- POST https://c-lims-api-test.dtp-dev.site/auth/login
Body:
```json
{ "username": "0111111111", "password": "39067" }
```

Ví dụ component:
```tsx
// Login.tsx (rút gọn)
const onFinish = (values) => {
  loginMutation(values, {
    onSuccess: (data) => {
      setAccessToken(data.accessToken); // lưu cookie accessToken
      router.push('/default-values');
    },
  });
};
```

---

## Luồng refresh token
1. Mọi request API kèm `Authorization: Bearer <accessToken>`.
2. Nếu API trả 401:
   - FE gọi `GET /auth/refresh` (backend đọc cookie `lims-refresh-token`).
   - Nhận `accessToken` mới và tiếp tục request ban đầu.
3. Nếu refresh thất bại → xóa cookie accessToken → chuyển về `/login`.

Endpoint:
- GET https://c-lims-api.test.dtp-dev.site:6443/auth/refresh
Header: Cookie: lims-refresh-token=<token> (cookie do backend set)

---

## Lưu trữ Access Token bằng Cookie
- FE dùng cookie để lưu `accessToken` với thời gian ngắn (ví dụ 15 phút).
- Refresh Token do backend quản lý trong cookie HttpOnly `lims-refresh-token` (FE không truy cập).

Gợi ý util:
```ts
// api/cookies.ts
import Cookies from 'js-cookie';

export const setAccessToken = (token: string) => {
  Cookies.set('accessToken', token, {
    expires: 1/96, // ~15 phút
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const getAccessToken = () => Cookies.get('accessToken');
export const removeAccessToken = () => Cookies.remove('accessToken');
```

---

## Cấu hình Axios client + Interceptors
- baseURL: https://c-lims-api-test.dtp-dev.site
- withCredentials: true (để gửi/nhận cookie refresh từ backend).
- Request interceptor: gắn `Authorization` từ cookie accessToken.
- Response interceptor: tự động refresh khi 401 và retry request.

```ts
// app/api/axios.ts (ví dụ)
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://c-lims-api-test.dtp-dev.site';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(p => (error ? p.reject(error) : token && p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
        Cookies.set('accessToken', data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return api(original);
      } catch (e) {
        processQueue(e);
        Cookies.remove('accessToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## React Query: useLogin và gọi API
- Sử dụng `useMutation` để login, `useQuery` để tải dữ liệu.
- Tận dụng axios instance để tự refresh 401.

```ts
// hooks/useLogin.ts (ví dụ)
import { useMutation } from '@tanstack/react-query';
import { api } from '@/app/api/axios';

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      const { data } = await api.post('/auth/login', payload);
      return data;
    },
  });
```

---

## Gọi Default Value API
- GET /default-value?type=<type>
- Header: Authorization: Bearer <accessToken>
- 401 → axios tự refresh.

```ts
// services/defaultValue.ts
export const getDefaultValues = async (type: 'FormulaUnit' | 'TestGroup' | 'MethodGroup') => {
  const { data } = await api.get('/default-value', { params: { type } });
  return data;
};
```

---

## Bảo vệ route (guard)
- Client guard: kiểm tra có accessToken cookie, nếu không → chuyển /login.
- Server-side middleware (tuỳ chọn): kiểm tra cookie và redirect.

Client guard đơn giản:
```tsx
// components/AuthGuard.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) router.replace('/login');
  }, [router]);
  return <>{children}</>;
}
```

---

## Lưu ý & xử lý lỗi
- 401 Unauthorized: kiểm tra accessToken cookie có tồn tại/het hạn; đảm bảo `withCredentials: true`.
- Cookie:
  - `secure: true` yêu cầu HTTPS (sản xuất).
  - Domain/subdomain của API refresh khác port: cần CORS + credentials ở backend.
- Hydration lỗi:
  - Wrap toàn app bằng `QueryClientProvider` (client) trong layout server component.
  - Dùng `AntdRegistry` để tránh mismatch SSR/CSR.
- BaseURL: không dùng `http://localhost:3000` để gọi API backend.
- Không lưu Refresh Token trong FE; backend quản lý bằng HttpOnly cookie.

---

## Kết luận
- FE lưu `accessToken` bằng cookie và tự động refresh khi 401 qua axios interceptors.
- React Query quản lý mutation/query; layout phải có `QueryClientProvider`.
- Guard bảo vệ trang dữ liệu; API Default Values gọi kèm Authorization và tự retry sau refresh.