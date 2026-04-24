# NIDO Authentication System Implementation

## Overview

This document describes the complete authentication system implemented for NIDO, a rental platform. The system uses Supabase Auth with PostgreSQL Row-Level Security (RLS) to provide secure, scalable user management.

## Architecture

### Core Components

1. **Supabase Auth**: Handles user registration, login, password reset, and session management
2. **Profiles Table**: Extended user information linked to auth.users
3. **Role-Based Access Control**: Admin, landlord, and tenant roles with proper permissions
4. **Row-Level Security**: Database-level access control policies
5. **Automatic Profile Creation**: Triggers create profiles and role-specific tables on signup

### Database Schema

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'tenant',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  id_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Role-Specific Tables
- **landlords**: Additional data for property owners
- **tenants**: Additional data for renters

#### Enums
- `user_role_enum`: 'admin', 'landlord', 'tenant'

## Authentication Flows

### 1. User Registration

**Frontend Request:**
```javascript
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "role": "tenant"
}
```

**Backend Process:**
1. Validate input data
2. Create user in Supabase Auth with metadata
3. Trigger `handle_new_user()` creates profile automatically
4. Trigger creates role-specific record (tenant/landlord table)
5. Auto-login user and return session token

**Response:**
```javascript
{
  "success": true,
  "message": "Cuenta creada correctamente.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tenant"
    }
  }
}
```

### 2. User Login

**Frontend Request:**
```javascript
POST /auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Backend Process:**
1. Validate credentials with Supabase Auth
2. Retrieve extended profile data
3. Return session token and user info

### 3. Password Reset

**Frontend Request:**
```javascript
POST /auth/forgot-password
{
  "email": "john@example.com"
}
```

**Backend Process:**
1. Send reset email via Supabase Auth
2. User clicks link and resets password
3. Frontend handles password update

### 4. Session Management

**Frontend Request:**
```javascript
GET /auth/me
Authorization: Bearer <token>
```

**Backend Process:**
1. Validate JWT token
2. Return current user profile data

## Security Implementation

### Row-Level Security Policies

#### Profiles Policies
```sql
-- Users can view their own profile
CREATE POLICY profiles_view_own ON profiles
  FOR SELECT USING (auth_id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY admin_profiles_all ON profiles
  USING (get_user_role(auth.uid()) = 'admin');
```

#### Role-Based Access
- **Admins**: Full access to all data
- **Landlords**: Access to their properties, tenants, contracts
- **Tenants**: Access to their applications, contracts, payments

### Triggers and Functions

#### Profile Creation Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_id, email, first_name, last_name, role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'tenant'::user_role_enum)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

#### Role-Specific Record Creation
Automatic creation of landlord/tenant records based on role.

## Frontend Integration

### AuthProvider Setup

```javascript
// AuthProvider.jsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  // ... other methods
};
```

### API Client Configuration

```javascript
// apiClient.js
const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, query, auth = true } = options;
  const token = auth ? getStoredToken() : null;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle response...
};
```

## TypeScript Types

Auto-generated types from Supabase schema provide type safety:

```typescript
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role_enum'];
```

## Security Considerations

### Password Requirements
- Minimum 8 characters
- Enforced by backend validation

### Session Security
- JWT tokens with expiration
- Automatic token refresh
- Secure token storage in localStorage

### Data Protection
- RLS prevents unauthorized data access
- Sensitive data encrypted at rest
- Audit logging for security events

### API Security
- CORS configured for frontend domain
- Input validation on all endpoints
- Rate limiting (recommended for production)

## Production Deployment

### Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-secure-jwt-secret
```

### Supabase Configuration
1. Enable email confirmation in Auth settings
2. Configure SMTP for email delivery
3. Set up custom domains (optional)
4. Configure password reset redirect URLs

### Monitoring
- Monitor failed login attempts
- Track user registration metrics
- Audit security events via audit_logs table

## Troubleshooting

### Common Issues

1. **Profile not created on signup**
   - Check trigger `handle_new_user` is active
   - Verify user_metadata contains required fields

2. **RLS blocking queries**
   - Ensure user is authenticated
   - Check role-based policies
   - Verify `auth.uid()` returns correct user ID

3. **Token expiration**
   - Implement automatic token refresh
   - Handle 401 responses by redirecting to login

### Debug Commands

```sql
-- Check user profiles
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Test authentication functions
SELECT get_current_user_profile();
```

## Future Enhancements

- OAuth integration (Google, Facebook)
- Multi-factor authentication
- Account verification via documents
- Session management dashboard
- Advanced audit logging

## Conclusion

The authentication system provides a solid foundation for NIDO with:
- Secure user registration and login
- Role-based access control
- Automatic profile management
- Production-ready security measures
- Type-safe frontend integration

The system is scalable, maintainable, and follows security best practices.