# TODO: Fix React App Errors

## High Priority
- [x] Add GoogleOAuthProvider to src/index.js to fix GoogleLoginButton render error
- [x] Update GoogleLoginButton.jsx with error handling for missing clientId
- [x] Start backend server to enable WebSocket connections (ws://localhost:5000/ws)

## Medium Priority
- [x] Fix CORS on manifest.json by updating public/manifest.json and public/_headers
- [ ] Replace external HTTPS image URLs (Unsplash, Picsum) with local HTTP placeholders in components (Home.jsx, PostCardEnhanced.jsx, socialMocks.js)
- [ ] Replace external video URLs (sample-videos.com) with local placeholders in ReelsViewer.jsx

## Low Priority
- [ ] Verify REACT_APP_GOOGLE_CLIENT_ID env var is set in Codespaces
- [ ] Test login functionality and console errors in browser
- [ ] Update ErrorBoundary for better error logging if needed

## Notes
- Backend needs to be running for WebSocket and auth endpoints
- Use `npm run dev` to start both frontend and backend
- Check console after each fix to confirm errors are resolved
