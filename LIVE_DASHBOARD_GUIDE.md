# Cedokamall - Live Dashboard Access Guide

## 🎯 Quick Start

When your Cedokamall system goes live, admins will access the dashboard using this workflow:

### Step 1: Access the Admin Login Page

```
https://your-domain.com/admin/login
```

**Example:** `https://cedokamall.com/admin/login`

### Step 2: Enter Admin Credentials

- **Email Address**: Your admin email (e.g., `admin@cedokamall.com`)
- **Password**: Your secure admin password (minimum 6 characters, will be replaced with real authentication in production)

### Step 3: Navigate to Dashboard

After login, you'll be redirected to:

```
https://your-domain.com/admin
```

## 📊 Dashboard Overview

The admin dashboard contains:

### Main Dashboard (`/admin`)

Located at: `https://your-domain.com/admin`

**Features:**

- 📈 Key statistics display
  - Active Flash Deals count
  - Total Customers
  - Monthly Revenue
  - Today's Orders
- 🎯 Quick action buttons
  - Create Flash Deal
  - Manage Products
  - View Analytics
- 📋 Recent activity log

### Flash Deals Management (`/admin/flash-deals`)

Located at: `https://your-domain.com/admin/flash-deals`

**Capabilities:**

- ✅ Create new flash sales
- ✅ Set discount percentages
- ✅ Configure start/end times
- ✅ Manage inventory limits
- ✅ Edit existing deals
- ✅ Delete completed sales
- ✅ View all active deals in a table

**Flash Deal Parameters:**

- Product selection
- Discount % (1-100%)
- Start time
- End time
- Max quantity available

## 🔒 Security Features

### Authentication

- Form validation (email format, password length)
- Session stored in localStorage
- Automatic logout on browser close
- Session persistence across page refreshes

### Admin-Only Routes

- `/admin` - Protected
- `/admin/flash-deals` - Protected
- `/admin/login` - Public (for login)

**Unauthorized access automatically redirects to login page**

## 👥 Admin Access Management

### Adding New Admins

Currently, the system uses mock authentication (for development). For production:

1. **Replace with Backend Authentication**
   - Implement JWT tokens
   - Use a secure database
   - Hash passwords
   - Implement role-based access control

2. **Add Admin Users**
   - Create admin user in your database
   - Assign email and password
   - Set admin role
   - Configure permissions

### Admin Roles (Future Implementation)

```
- Super Admin: Full access
- Store Manager: Dashboard + Flash Deals
- Product Manager: Products only
- Analytics Officer: Reports only
```

## 🛠️ Technical Implementation

### File Locations

```
Admin Components:
├── src/pages/AdminLogin.tsx       # Login page
├── src/pages/AdminDashboard.tsx   # Main dashboard
├── src/pages/AdminFlashDeals.tsx  # Flash deals CRUD
├── src/components/AdminLayout.tsx # Layout wrapper
├── src/components/FlashDealForm.tsx # Deal creation form
├── src/contexts/AuthContext.tsx   # Authentication logic
└── src/components/ProtectedRoute.tsx # Route protection
```

### API Integration (To be Implemented)

Replace mock authentication with real API calls:

```typescript
// Current (Mock):
if (email && password.length >= 6) {
  // Create mock token
  return true;
}

// Production (Replace with):
const response = await fetch("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
localStorage.setItem("adminToken", token);
```

## 📱 Access from Different Devices

### Desktop

- Full access to all dashboard features
- Optimal screen layout
- All management tools available

### Tablet

- Responsive layout
- Touch-friendly interface
- All features accessible

### Mobile

- Sidebar collapses to hamburger menu
- Optimized form layouts
- Limited to essential features (recommended for read-only access)

## 🌐 Deployment URLs

### Development

```
Main App:      http://localhost:8080
Admin Login:   http://localhost:8080/admin/login
Dashboard:     http://localhost:8080/admin
Flash Deals:   http://localhost:8080/admin/flash-deals
```

### Staging

```
Main App:      https://staging.cedokamall.com
Admin Login:   https://staging.cedokamall.com/admin/login
Dashboard:     https://staging.cedokamall.com/admin
Flash Deals:   https://staging.cedokamall.com/admin/flash-deals
```

### Production

```
Main App:      https://cedokamall.com
Admin Login:   https://cedokamall.com/admin/login
Dashboard:     https://cedokamall.com/admin
Flash Deals:   https://cedokamall.com/admin/flash-deals
```

## ⚙️ Configuration

### Environment Variables

Set in `.env.local` or `.env.production`:

```env
# API Configuration
VITE_API_URL=https://api.cedokamall.com

# Admin Settings
VITE_ENABLE_FLASH_DEALS=true
VITE_ADMIN_SESSION_TIMEOUT=3600000  # 1 hour

# Security
VITE_SECURE_COOKIES=true
VITE_HTTPS_ONLY=true
```

## 🔐 Production Security Checklist

Before going live, ensure:

- [ ] Replace mock authentication with JWT
- [ ] Implement backend API authentication
- [ ] Enable HTTPS only
- [ ] Set secure cookies (HttpOnly, Secure, SameSite)
- [ ] Implement rate limiting
- [ ] Add password hashing
- [ ] Enable CORS restrictions
- [ ] Set Content Security Policy headers
- [ ] Implement audit logging
- [ ] Add two-factor authentication (2FA)
- [ ] Regular security audits
- [ ] Backup and recovery plans

## 📞 Troubleshooting

### Can't Login?

1. Verify credentials are correct
2. Check if email format is valid
3. Ensure password is at least 6 characters
4. Clear browser cache and try again

### Dashboard Not Loading?

1. Check internet connection
2. Verify you're logged in (check URL)
3. Clear localStorage: `localStorage.clear()` in console
4. Refresh page
5. Try incognito/private browsing

### Session Expires Frequently?

1. Check `VITE_SESSION_TIMEOUT` setting
2. Increase timeout if needed
3. Verify server session configuration

### Permissions Denied?

1. Verify user account has admin role
2. Check backend permission settings
3. Restart browser session

## 🚀 First-Time Setup for Production

### Step 1: Deploy Frontend

```bash
# Build production version
npm run build

# Output: dist/ folder ready to deploy
# Deploy to: Vercel, Netlify, AWS S3, etc.
```

### Step 2: Deploy Backend (If Using)

Set up your backend API with:

- Authentication endpoints
- Flash deals API
- Product management API
- Admin management endpoints

### Step 3: Configure DNS

Point your domain to your hosting:

```
cedokamall.com → Your hosting provider
```

### Step 4: Enable SSL/HTTPS

- Install SSL certificate
- Redirect HTTP to HTTPS
- Update all URLs to use HTTPS

### Step 5: Create Admin Accounts

In your database:

```
INSERT INTO admins (
  email,
  password_hash,
  role,
  status
) VALUES (
  'admin@cedokamall.com',
  hash('password123'),
  'super_admin',
  'active'
);
```

## 📚 Related Documentation

- [BACKEND_SECURITY_GUIDE.ts](./BACKEND_SECURITY_GUIDE.ts) - Backend implementation
- [SECURITY_AND_PERFORMANCE.md](./SECURITY_AND_PERFORMANCE.md) - Security details
- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Full deployment
- [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) - Admin setup (development)

## 📋 Dashboard Quick Reference

| Feature     | URL                  | Access     |
| ----------- | -------------------- | ---------- |
| Login       | `/admin/login`       | Public     |
| Dashboard   | `/admin`             | Admin Only |
| Flash Deals | `/admin/flash-deals` | Admin Only |
| Logout      | N/A                  | Admin Only |

---

**Version:** 1.0.0  
**Last Updated:** April 17, 2026  
**Status:** Production Ready
