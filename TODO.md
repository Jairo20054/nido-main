# TODO: Implement Local Authentication

## 1. Fix Backend Response Format
- Change authController responses from 'usuario'/'token' to 'user'/'token' to match frontend expectations

## 2. Update AuthContext API Endpoint
- Change /auth/me to /auth/profile in AuthContext.js

## 3. Remove OAuth Components from Frontend
- Remove Facebook login button from LoginForm.jsx
- Remove social login sections

## 4. Adjust User Model and Forms
- Update RegisterForm to use 'name' field instead of firstName/lastName
- Adjust validation to match backend (min 6 chars for password)

## 5. Update Password Validation
- Change frontend authService validatePassword to min 6 chars

## 6. Fix Redirect After Auth
- Check if /dashboard exists, otherwise redirect to home page

## 7. Test Authentication Flow
- Test register and login functionality
- Verify JWT persistence and protected routes
