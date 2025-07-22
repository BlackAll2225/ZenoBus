# Services Layer

Thư mục này chứa tất cả các service để giao tiếp với API Backend.

## Cấu trúc

```
services/
├── api.ts           # Cấu hình axios và interceptors
├── authService.ts   # Authentication services
├── types.ts         # Type definitions
├── index.ts         # Export tất cả services
└── README.md        # Documentation
```

## Cách sử dụng

### 1. Import service

```typescript
import { authService, LoginCredentials } from '@/services';
```

### 2. Sử dụng trong component

```typescript
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await authService.login(credentials);
    // response có structure: { status, message, data }
    const { token, user } = response.data;
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// Admin login
const handleAdminLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await authService.adminLogin(credentials);
    // Admin response: { status, message, data: { token, admin } }
    const { token, admin } = response.data;
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## API Response Structure

Tất cả API calls đều trả về `ApiResponse<T>` structure:

```typescript
interface ApiResponse<T> {
  status: number;    // HTTP status code
  message: string;   // Response message
  data: T;          // Actual data
}
```

### Ví dụ Response

```typescript
// User login success response
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "phoneNumber": "0912345678",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}

// Admin login success response
{
  "status": 200,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": 1,
      "fullName": "Admin User",
      "username": "admin",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-12-04T10:30:00.000Z"
    }
  }
}

// Error response
{
  "status": 400,
  "message": "Invalid credentials",
  "data": null
}
```

## Features

### ✅ Automatic Token Management
- Tự động thêm Bearer token vào headers
- Tự động clear token khi 401/403
- Redirect khi unauthorized

### ✅ Error Handling
- Centralized error handling
- Type-safe error responses
- Consistent error format

### ✅ Type Safety
- Full TypeScript support
- Interface definitions cho tất cả API calls
- Generic response types với `ApiResponse<T>`

### ✅ Request/Response Interceptors
- Automatic token injection
- Error handling
- Request/response logging (có thể thêm)

## API Base URL

Hiện tại sử dụng: `http://localhost:5000/api`

Có thể thay đổi trong file `api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Error Handling

Services tự động handle các lỗi phổ biến:

- **401 Unauthorized**: Clear token và redirect to login
- **403 Forbidden**: Redirect to home page
- **Network errors**: Throw với message rõ ràng

## Thêm Service mới

1. Tạo file service mới (ví dụ: `tripService.ts`)
2. Import `api` từ `./api`
3. Export từ `index.ts`
4. Thêm types vào `types.ts` nếu cần

```typescript
// tripService.ts
import api from './api';
import { ApiResponse, PaginatedResponse } from './types';

interface Trip {
  id: number;
  from: string;
  to: string;
  departureTime: string;
  price: number;
}

export const tripService = {
  searchTrips: (params): Promise<ApiResponse<PaginatedResponse<Trip>>> => 
    api.get('/schedules', { params }).then(res => res.data),
  
  getTripDetails: (id: number): Promise<ApiResponse<Trip>> => 
    api.get(`/schedules/${id}`).then(res => res.data),
};
```
