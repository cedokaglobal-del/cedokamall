# Admin Dashboard Access Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8080`

### 3. Access Admin Dashboard

#### Admin Login

- **URL**: `http://localhost:8080/admin/login`
- **Email**: Any valid email address (e.g., `admin@cedokamall.com`)
- **Password**: Any password with 6+ characters (e.g., `admin123`)
- **Note**: This is mock authentication for development. Replace with actual backend authentication before production.

#### Admin Dashboard

- **URL**: `http://localhost:8080/admin`
- **Accessible After**: Successful login at `/admin/login`
- **Features**:
  - Dashboard with key stats (Active Flash Deals, Total Customers, Monthly Revenue, Orders)
  - Quick actions panel
  - Recent activity log
  - Sidebar navigation

#### Flash Deals Management

- **URL**: `http://localhost:8080/admin/flash-deals`
- **Features**:
  - Create new flash deals
  - Edit existing deals
  - View deal details
  - Delete deals
  - Full CRUD operations

## Authentication System

### How Admin Authentication Works

1. **Login Flow**:
   - User enters email and password
   - Form validation checks email format and password length
   - Mock authentication (to be replaced with backend API)
   - On success: Token stored in localStorage
   - Redirected to `/admin` dashboard

2. **Protected Routes**:
   - `/admin` - Protected route (redirects to login if not authenticated)
   - `/admin/flash-deals` - Protected route (redirects to login if not authenticated)
   - `/admin/login` - Public route (accessible to everyone)

3. **Session Management**:
   - Auth token stored in localStorage
   - Session persists across page refreshes
   - Logout clears session and redirects to login page
   - ProtectedRoute component checks authentication on every protected page load

### Security Notes (Development)

- Current authentication is **MOCK** for development purposes
- **NEVER use this in production** without implementing:
  - Backend API authentication
  - Secure token generation (JWT)
  - Password hashing
  - HTTPS-only cookies
  - Session expiration
  - Rate limiting on login attempts

## File Structure

### Authentication Files

- `src/contexts/AuthContext.tsx` - Authentication context and provider
- `src/components/ProtectedRoute.tsx` - Route protection component
- `src/pages/AdminLogin.tsx` - Login page
- `src/components/AdminLayout.tsx` - Admin layout with sidebar
- `src/config/security.ts` - Security utilities and validation

### Admin Pages

- `src/pages/AdminDashboard.tsx` - Main dashboard
- `src/pages/AdminFlashDeals.tsx` - Flash deals management
- `src/components/FlashDealForm.tsx` - Flash deal form component
- `src/types/flashDeal.ts` - Flash deal types

## Environment Configuration

### Development (.env.local)

```env
VITE_API_URL=http://localhost:3000
VITE_DEV_PORT=8080
VITE_ENV=development
VITE_ADMIN_EMAIL=admin@cedokamall.com
VITE_ADMIN_PASSWORD=admin123
VITE_ENABLE_FLASH_DEALS=true
```

### Configuration File

- `.env.example` - Template for environment variables
- `.env.local` - Development environment (git ignored)
- See `.env.example` for all available options

## Available Commands

```bash
# Development
npm run dev              # Start dev server (port 8080)

# Production
npm run build            # Create production build
npm run preview          # Preview production build locally

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint

# Full Development Flow
npm install              # Install dependencies
npm run dev              # Start development server
```

## URLs Reference

### Public Pages

- Home: `http://localhost:8080/`
- Shop: `http://localhost:8080/shop`
- Product: `http://localhost:8080/product/:id`
- Cart: `http://localhost:8080/cart`

### Admin Pages

- Login: `http://localhost:8080/admin/login`
- Dashboard: `http://localhost:8080/admin`
- Flash Deals: `http://localhost:8080/admin/flash-deals`

## Next Steps for Production

1. **Backend API Integration**
   - Replace mock authentication in `src/contexts/AuthContext.tsx`
   - Implement real API calls for login
   - Add JWT token handling

2. **Database Setup**
   - Set up admin user management
   - Create flash deals database
   - Add user authentication

3. **Security Hardening**
   - Implement HTTPS
   - Add CSRF protection
   - Set up rate limiting
   - Configure CORS properly

4. **Admin Features**
   - Add analytics page (`/admin/analytics`)
   - Add settings page (`/admin/settings`)
   - Implement admin user management
   - Add logging and audit trails

5. **Testing**
   - Add unit tests for components
   - Add integration tests for auth flow
   - Add e2e tests for admin dashboard

## Troubleshooting

### Login Issues

- **Cannot log in**: Check that email is valid and password is at least 6 characters
- **Token not persisting**: Check browser localStorage (may be disabled or full)
- **Redirects to login**: Session may have expired, try logging in again

### Development Server Issues

- **Port 8080 in use**: Change port in `vite.config.ts` or use different port
- **Node modules issues**: Delete `node_modules` and `package-lock.json`, then run `npm install`
- **Build errors**: Clear `.vite` cache and `dist` folder, then rebuild

### Admin Dashboard Not Loading

- Check browser console for errors
- Verify you're logged in (check localStorage for `adminToken`)
- Ensure all dependencies are installed with `npm install`

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check `.env.local` configuration
4. Verify Node.js version (requires 16+)
