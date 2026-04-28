# JWT Authentication - Quick Start Guide

## What's Been Implemented

✅ **JWT Token Authentication** - Secure stateless authentication
✅ **Default Password** - All users created with default password "andritz"
✅ **Login API** - POST /auth/login endpoint
✅ **Change Password** - POST /auth/change-password endpoint
✅ **Secured All APIs** - All endpoints except login require JWT token
✅ **Frontend Integration** - Login page, token storage, and password change UI

## Quick Test Instructions

### 1. Start the Backend
```bash
cd travel-reimbursement-system
mvn clean install
mvn spring-boot:run
```
Server will run on: `http://localhost:8080/api`

### 2. Start the Frontend
```bash
cd travel-reimbursement-frontend
npm install
npm start
```
Frontend will run on: `http://localhost:3000`

### 3. Test Login in Browser
1. Go to `http://localhost:3000/login`
2. Enter username: `alice` (or `bob`, `charlie`)
3. Enter password: `andritz`
4. Click Login
5. You should see the dashboard

### 4. Test Change Password
1. Click user avatar/menu in navbar (top right)
2. Click "Change Password"
3. Enter current password: `andritz`
4. Enter new password: e.g., `newpassword123`
5. Confirm new password: `newpassword123`
6. Click "Change Password"
7. You should see success message and be redirected to dashboard
8. You can now login with the new password

### 5. Test API with cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "andritz"
  }'
```

**Response:** You'll get a JWT token in the response.

**Use Token in Request:**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Key Features

### Login
- Username and password authentication
- Returns JWT token valid for 24 hours
- Returns user information
- Shows error messages for invalid credentials

### All APIs Protected
- **Exception**: POST /auth/login
- **Exception**: GET /swagger-ui/**, /v3/api-docs/** (for API documentation)
- **All other endpoints**: Require valid JWT token in Authorization header

### Change Password
- Only authenticated users can change password
- Validates current password
- Ensures new password matches confirmation
- Password must be at least 6 characters
- Updates are immediate

## Files Modified/Created

### Backend
- `pom.xml` - Added JWT dependencies
- `entity/User.java` - Added password field
- `util/JwtUtil.java` - JWT token utilities (NEW)
- `filter/JwtFilter.java` - JWT validation filter (NEW)
- `controller/AuthController.java` - Login and password endpoints (NEW)
- `dto/LoginRequest.java` - Login request DTO (NEW)
- `dto/LoginResponse.java` - Login response DTO (NEW)
- `dto/ChangePasswordRequest.java` - Change password request DTO (NEW)
- `service/UserService.java` - Updated to set default password
- `config/SecurityConfig.java` - Updated for JWT authentication
- `resources/application.properties` - Added JWT configuration

### Frontend
- `context/AuthContext.js` - Updated to store JWT token
- `services/api.js` - Added interceptors for JWT token, new login/changePassword endpoints
- `pages/LoginPage.js` - Updated UI for username/password login
- `pages/ChangePasswordPage.js` - New password change form (NEW)
- `components/Navbar.js` - Added change password menu option
- `App.js` - Added change password route and import

## Default Test Users

All users have the default password: **andritz**

| Username | Role     | Department           |
|----------|----------|----------------------|
| alice    | HR       | Human Resources      |
| bob      | MANAGER  | Engineering          |
| charlie  | EMPLOYEE | Engineering          |

## Important Notes

⚠️ **For Production:**
1. Change the JWT secret in `application.properties` to a strong random string
2. Use environment variables instead of hardcoding secrets
3. Change default password and force users to set their own
4. Enable HTTPS
5. Set secure CORS origins
6. Add password complexity requirements
7. Implement token refresh mechanism
8. Add rate limiting to login endpoint

## Troubleshooting

**Q: "Invalid username or password" error**
A: Check that:
- Username is spelled correctly (case-sensitive)
- Password is exactly "andritz"
- User exists in database

**Q: 401 Unauthorized on API calls**
A: Check that:
- Token is included in Authorization header
- Token format is: `Bearer <token>`
- Token hasn't expired (24 hours)

**Q: CORS errors**
A: Backend CORS is configured for:
- http://localhost:3000
- http://127.0.0.1:3000

If frontend runs on different port, update `SecurityConfig.java`

**Q: Database doesn't have users**
A: Check `data.sql` is being loaded. The data script should create default users on startup.

## Next Steps

1. ✅ Test login with demo users
2. ✅ Test changing password
3. ✅ Verify all APIs require token
4. ✅ Test token expiration (24 hours)
5. Deploy to production with proper security configuration
6. Implement refresh token for better UX
7. Add password complexity requirements
8. Add multi-factor authentication

## Support

For detailed information, see: `JWT_AUTHENTICATION_GUIDE.md`

