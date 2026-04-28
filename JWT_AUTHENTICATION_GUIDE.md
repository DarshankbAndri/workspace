# JWT Token Authentication Implementation Guide

## Overview
This document explains the JWT (JSON Web Token) authentication implementation for the Travel Reimbursement System. All APIs now require JWT token authentication, except for the login endpoint.

## Default Credentials
- **Default Password**: `andritz`
- **Demo Users**: 
  - Username: `alice` (HR role)
  - Username: `bob` (Manager role)
  - Username: `charlie` (Employee role)

## Backend Implementation

### 1. Dependencies Added
JWT dependencies have been added to `pom.xml`:
- `jjwt-api` - JWT token creation and parsing
- `jjwt-impl` - Implementation
- `jjwt-jackson` - JSON serialization

### 2. Database Schema Changes
- Added `password` field to the `users` table
- Password is stored as encrypted hash using BCrypt

### 3. New Classes Created

#### JwtUtil (`util/JwtUtil.java`)
Utility class for JWT token operations:
- `generateToken(String username)` - Creates a JWT token valid for 24 hours
- `extractUsername(String token)` - Extracts username from token
- `validateToken(String token)` - Validates token signature and expiration
- `getClaims(String token)` - Parses token claims

**Configuration** (in `application.properties`):
```properties
app.jwt.secret=mySecureSecretKeyForJWTTokenGenerationAndValidation12345
app.jwt.expiration=86400000  # 24 hours in milliseconds
```

#### JwtFilter (`filter/JwtFilter.java`)
Spring Security filter that:
- Intercepts all incoming requests
- Extracts JWT token from `Authorization: Bearer <token>` header
- Validates token and sets authentication in SecurityContext
- Allows unauthenticated access to login endpoint

#### AuthController (`controller/AuthController.java`)
New endpoints for authentication:

**POST /auth/login**
- Request body:
  ```json
  {
    "username": "alice",
    "password": "andritz"
  }
  ```
- Response:
  ```json
  {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Johnson",
      "role": "HR",
      "department": "Human Resources",
      "active": true
    },
    "message": "Login successful"
  }
  ```

**POST /auth/change-password**
- Requires JWT token in `Authorization` header
- Request body:
  ```json
  {
    "currentPassword": "andritz",
    "newPassword": "mynewpassword",
    "confirmPassword": "mynewpassword"
  }
  ```
- Response:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

#### DTOs Created
- `LoginRequest` - Contains username and password
- `LoginResponse` - Contains JWT token and user information
- `ChangePasswordRequest` - Contains current and new password

### 4. Security Configuration Updates
Updated `SecurityConfig.java`:
- Added JWT filter to the filter chain
- Configured stateless session management (no cookies)
- Secured all endpoints except `/auth/login`
- Kept CORS configuration for frontend compatibility

### 5. User Service Updates
Updated `UserService.java`:
- Added `PasswordEncoder` dependency
- Set default password (`andritz`) when creating new users
- Password is automatically hashed using BCrypt

## Frontend Implementation

### 1. Updated AuthContext (`context/AuthContext.js`)
Now manages both user data and JWT token:
```javascript
{
  isAuthenticated,  // Boolean
  user,            // User object
  token,           // JWT token string
  login(userData, jwtToken),    // Store user and token
  logout(),        // Clear everything
  getToken(),      // Retrieve token
  loading          // Loading state
}
```

### 2. Updated API Service (`services/api.js`)
- **Request Interceptor**: Automatically adds JWT token to all requests
  ```
  Authorization: Bearer <token>
  ```
- **Response Interceptor**: Handles 401 errors by clearing auth and redirecting to login
- New endpoints:
  - `login(username, password)` - Calls `/auth/login`
  - `changePassword(currentPassword, newPassword, confirmPassword)` - Calls `/auth/change-password`

### 3. Updated LoginPage (`pages/LoginPage.js`)
- Replaced demo user selection with username/password form
- Calls `POST /auth/login` with credentials
- Stores JWT token and user data
- Redirects to dashboard on success
- Shows appropriate error messages

### 4. New ChangePasswordPage (`pages/ChangePasswordPage.js`)
- Accessible via user menu in navbar
- Form with current password, new password, and confirmation
- Client-side validation for password matching and length
- Calls `POST /auth/change-password` endpoint
- Shows success message and redirects to dashboard

### 5. Updated Navbar (`components/Navbar.js`)
- Added "Change Password" option in user menu
- Appears above the Logout button

### 6. Updated App Routes (`App.js`)
- Added protected route: `/change-password`
- All routes except `/login` require authentication

## API Usage

### Making Authenticated Requests
All API requests (except login) automatically include the JWT token:

```javascript
// Token is automatically added by axios interceptor
const response = await api.get('/users');
// Header sent: Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

### Manual Header Example (cURL)
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Authentication Flow

### 1. Login Flow
```
User enters credentials (username, password)
        ↓
POST /auth/login
        ↓
Server validates credentials
        ↓
Server generates JWT token
        ↓
Return token + user data
        ↓
Client stores token in localStorage
        ↓
Redirect to dashboard
```

### 2. Authenticated Request Flow
```
Client makes API request
        ↓
Axios interceptor adds token to header
        ↓
Request sent with Authorization header
        ↓
JwtFilter validates token
        ↓
If valid: Continue to endpoint
If invalid: Return 401 Unauthorized
        ↓
Response interceptor checks status
        ↓
If 401: Clear auth data, redirect to login
```

### 3. Change Password Flow
```
User clicks "Change Password" in menu
        ↓
Navigate to /change-password
        ↓
User enters current password, new password, confirmation
        ↓
POST /auth/change-password with JWT token
        ↓
Server validates current password
        ↓
Server validates new password matches confirmation
        ↓
Server hashes and updates password
        ↓
Return success message
        ↓
Redirect to dashboard
```

## Testing

### Test Users (All with password: `andritz`)
1. **alice** - HR user, can create users and approve claims
2. **bob** - Manager, can approve/reject subordinates' claims
3. **charlie** - Employee, can create and submit claims

### Test Login via API
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "andritz"
  }'
```

### Test Authenticated Request
```bash
# First, get the token from login response
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

# Use token in request
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Test Change Password
```bash
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "andritz",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

## Security Features

1. **Password Hashing**: BCrypt encryption with configurable strength
2. **JWT Expiration**: Tokens expire after 24 hours
3. **Stateless Authentication**: No server-side sessions
4. **CORS Protection**: Only allowed origins can access API
5. **CSRF Protection**: Disabled for API (not needed with JWT)
6. **Token in Header**: Token sent via Authorization header, not cookies

## Configuration

### JWT Settings (in `application.properties`)
```properties
# Secret key for signing tokens (change in production!)
app.jwt.secret=mySecureSecretKeyForJWTTokenGenerationAndValidation12345

# Token expiration time in milliseconds (24 hours)
app.jwt.expiration=86400000

# For production, use environment variables:
# app.jwt.secret=${JWT_SECRET}
# app.jwt.expiration=${JWT_EXPIRATION}
```

### CORS Configuration
Update `SecurityConfig.java` to allow additional origins:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com"  // Add production URL
));
```

## Troubleshooting

### Issue: "Invalid username or password"
- Check username and password are correct
- Ensure user exists in database
- Check default password is still "andritz" if user was created before this update

### Issue: "401 Unauthorized" on protected endpoints
- Verify token is included in Authorization header
- Check token hasn't expired (24 hour limit)
- Verify token is not malformed
- Check if user is still active

### Issue: "Cannot set user authentication"
- Check JWT secret matches between server and client
- Verify token wasn't modified
- Check server logs for parsing errors

### Issue: Redirected to login from protected routes
- Token may have expired
- Local storage was cleared
- User session was terminated by server

## Next Steps / Improvements

1. **Token Refresh**: Implement refresh token mechanism for better UX
2. **Role-Based Access Control**: Secure endpoints based on user role
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Token Blacklist**: Implement logout token blacklist
5. **Audit Logging**: Log authentication events
6. **Multi-Factor Authentication**: Add 2FA for enhanced security
7. **Password Reset**: Add forgot password functionality
8. **Password Policy**: Implement password complexity requirements

## Database Migration

After deployment, existing users will not have passwords. You can:

1. **Set default password for existing users** (in database):
   ```sql
   UPDATE users SET password = '$2a$10$...' WHERE password IS NULL;
   -- Use a hashed version of 'andritz'
   ```

2. **Or force password reset on first login** by adding a flag to the User entity

3. **Or manually set password for each user** via an admin endpoint

