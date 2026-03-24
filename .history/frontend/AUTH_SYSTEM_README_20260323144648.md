# 🔐 Schedulify Authentication System

Complete frontend authentication system with token management, role-based access control, and session persistence.

## 📋 Features

✅ **User Authentication**
- Login with email and password
- Automatic token storage in localStorage
- SessionRestoration on page refresh
- Logout with token cleanup

✅ **Session Management**
- Auto-restore user session from localStorage
- Token expiration detection
- Server-side token verification
- Graceful session recovery

✅ **Role-Based Access Control (RBAC)**
- Multiple roles supported (ADMIN, USER, etc.)
- Protected routes component
- Role checking utilities
- Unauthorized page redirect

✅ **Security**
- Bearer token authentication
- Protected API requests
- Token expiration validation
- Secure localStorage usage

✅ **Modern UI**
- Beautiful loading states
- Gradient backgrounds with Tailwind CSS
- Responsive design
- Icon-based navigation

## 🏗️ Architecture

### Core Files

```
frontend/src/
├── context/
│   └── AuthContext.jsx          # Auth state management
├── components/
│   └── ProtectedRoute.jsx       # Route protection component
├── hooks/
│   └── useAuth.js              # Custom hook for auth
├── utils/
│   └── tokenHelper.js          # Token utilities
└── pages/
    └── UnauthorizedPage.jsx    # 403 Forbidden page
```

## 🚀 Quick Start

### 1. Provide AuthProvider at Root

The `AuthProvider` is already wrapped in `main.jsx`:

```jsx
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

### 2. Use Authentication in Components

```jsx
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { user, isAuthenticated, login, logout, error } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### 3. Protect Routes

```jsx
// Protect route - requires authentication
<Route
  path="/dashboard"
  element={<ProtectedRoute element={<Dashboard />} />}
/>

// Protect route - requires specific role
<Route
  path="/admin"
  element={
    <ProtectedRoute
      element={<AdminPanel />}
      requiredRoles={["ADMIN"]}
    />
  }
/>
```

## 📚 API Reference

### useAuth Hook

```jsx
const {
  user,           // { id, email, role, name, ... }
  token,          // JWT token string
  isAuthenticated, // boolean
  isLoading,      // boolean - true while restoring session
  error,          // string or null
  login,          // async (email, password) => void
  logout,         // async () => void
  restoreSession, // async () => void
  clearError,     // () => void
} = useAuth();
```

### Token Helper Functions

```jsx
import {
  saveAuthData,        // (token, user) => void
  getToken,            // () => token | null
  getUser,             // () => user | null
  clearAuthData,       // () => void
  isAuthenticated,     // () => boolean
  decodeToken,         // (token) => decoded | null
  isTokenExpired,      // (token) => boolean
  getUserRole,         // () => role | null
  hasRole,             // (role) => boolean
  hasAnyRole,          // (roles[]) => boolean
} from "../utils/tokenHelper";
```

### ProtectedRoute Props

```jsx
<ProtectedRoute
  element={<Component />}           // Required: Component to render
  requiredRoles={["ADMIN", "MOD"]}  // Optional: Array of allowed roles
/>
```

**Behavior:**
- ❌ Not authenticated → Redirect to `/login`
- ✅ Authenticated, no role check → Render component
- ❌ Authenticated, role check failed → Redirect to `/unauthorized`
- ✅ Authenticated, has required role → Render component
- ⏳ Loading → Show loading spinner

## 🔄 Flow Diagrams

### Login Flow

```
User Email + Password
        ↓
   Login Form
        ↓
  API: POST /auth/login
        ↓
  Receive: Token + User
        ↓
  Save: localStorage
        ↓
  Update: AuthContext
        ↓
  Redirect: /dashboard
```

### Session Restoration

```
App Loads
    ↓
AuthProvider mounts
    ↓
restoreSession() called
    ↓
Check localStorage for token + user
    ↓
Token expired? ← Yes → Clear & Skip
    ↓
API: GET /auth/verify with token
    ↓
Valid? → Yes → Restore session
    ↓
Set AuthContext state
    ↓
App ready with authenticated user
```

### Protected Route Flow

```
User navigates to /admin
    ↓
ProtectedRoute rendered
    ↓
Check isLoading?
    ├─ Yes → Show spinner
    └─ No → Continue
    ↓
Check isAuthenticated?
    ├─ No → Redirect /login
    └─ Yes → Continue
    ↓
Check requiredRoles?
    ├─ Yes, but no match → Redirect /unauthorized
    └─ Match or not required → Render component
```

## 🔑 Key Concepts

### Token Storage

Tokens are stored in `localStorage` for persistence:
```javascript
localStorage.setItem('token', jwtToken)
localStorage.setItem('user', JSON.stringify(userData))
```

**Why localStorage?**
- Survives page refresh
- Simple API management
- Automatic inclusion via axios interceptor

### Token Validation

Three levels of validation:
1. **Client-side expiration check** - Using decoded exp claim
2. **Server verification** - GET /auth/verify endpoint
3. **API interceptor** - Every request includes Bearer token

### Role-Based Routes

```jsx
// Any authenticated user
<ProtectedRoute element={<Dashboard />} />

// ADMIN only
<ProtectedRoute element={<AdminPanel />} requiredRoles={["ADMIN"]} />

// Multiple roles allowed
<ProtectedRoute
  element={<Management />}
  requiredRoles={["ADMIN", "MODERATOR"]}
/>
```

## 🧪 Testing

### Test Login

```javascript
// Open browser console and run:
const { user } = useAuth();
console.log(user); // Should show user object
console.log(localStorage.getItem('token')); // Should show token
```

### Test Protected Routes

```javascript
// After login
window.location.href = '/admin'; // Should show page if ADMIN
window.location.href = '/dashboard'; // Should show page

// Clear auth to test protection
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.reload(); // Redirects to /login
```

### Test Role-Based Protection

```javascript
// In browser console
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'test@example.com',
  role: 'USER'
}));
// Try to access /admin → Should redirect to /unauthorized
```

## ⚙️ Server Integration

Your backend API should provide:

### 1. Login Endpoint

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "name": "John Doe"
  }
}
```

### 2. Verify Endpoint

```
GET /auth/verify
Authorization: Bearer <token>

Response:
{
  "valid": true
}
```

### 3. Logout Endpoint (Optional)

```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

## 🎨 Styling

All components use **Tailwind CSS** with:
- Dark gradient backgrounds (`bg-gradient-to-br from-slate-900`)
- Modern spacing and sizing
- Smooth transitions
- Responsive design
- Icon support (SVG)

### Loading State

```jsx
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900">
  <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
</div>
```

### Button Styles

```jsx
// Primary button
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  Login
</button>

// Secondary button
<button className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg">
  Cancel
</button>
```

## 🐛 Debugging

### Enable Console Logging

Edit `AuthContext.jsx` and uncomment console logs:

```javascript
const restoreSession = useCallback(async () => {
  console.log('🔄 Starting session restore...');
  // ... rest of code
  console.log('✅ Session restored:', { user, token });
}, []);
```

### Check Auth State

React DevTools:
1. Open DevTools
2. Go to Components tab
3. Find `AuthProvider`
4. Inspect `value` prop to see auth state

### Monitor API Calls

Network tab:
- Look for `POST /auth/login`
- Look for `GET /auth/verify`
- Check Authorization headers: `Bearer <token>`

## 📝 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "useAuth must be used within AuthProvider" | Hook used outside provider | Ensure AuthProvider wraps app |
| "Login failed" | Wrong credentials | Check email/password |
| Token not in headers | localStorage cleared | Axios interceptor might be disabled |
| Redirect to /login after login | Token verification failed | Check /auth/verify endpoint |
| 403 Unauthorized pages | Wrong role | Update user.role on server |

## 🚨 Security Notes

✅ **DO:**
- Use HTTPS in production
- Keep tokens in localStorage (or sessionStorage)
- Verify tokens on server
- Clear tokens on logout
- Check token expiration

❌ **DON'T:**
- Store sensitive data in JWT (it's encoded, not encrypted)
- Trust client-only validation
- Send tokens in URL query parameters
- Use same token forever (set exp time)
- Log tokens in production

## 🔄 Logout Flow

```javascript
const handleLogout = async () => {
  await logout(); // Clears token, user, localStorage
  navigate('/login');
};
```

**What happens:**
1. API call to `/auth/logout` (server audit trail)
2. Clear localStorage token and user
3. Update AuthContext state
4. Reset error messages
5. Components using `useAuth()` re-render
6. Protected routes redirect to /login

## 📦 Package Dependencies

All required packages are already installed:
- `react` (^19.2.4)
- `react-router-dom` (^7.13.1)
- `axios` (^1.13.6)
- `tailwindcss` (^4.2.1)

## 🎯 Next Steps

1. **Implement Login Page** - Use `useAuth()` hook for login form
2. **Implement Register Page** - Add user registration
3. **Add Refresh Token** - Extend session lifetime
4. **Add 2FA** - Two-factor authentication
5. **Add Social Login** - Google, GitHub, etc.
6. **Add Password Reset** - Forgot password flow
7. **Audit Logs** - Track login/logout events

## 📞 Support

For implementation questions:
- Check `AUTH_USAGE_GUIDE.jsx` for code examples
- Review `UnauthorizedPage.jsx` for modern UI patterns
- Inspect `tokenHelper.js` for utility functions
- Test with `testAuth.html` (create for manual testing)

---

**Remember:** Security is critical. Always validate on the server. Never trust client-side authentication alone. 🔒
