# TODO: Rental Social App Project Steps

## Overview
This TODO tracks the progress of creating the Facebook-like homepage for the housing rental social network. Steps are broken down logically from the approved plan. Each step will be marked as [ ] Incomplete or [x] Complete as we proceed.

## Steps

1. [ ] Create frontend/package.json with dependencies (Vite, React, React Router, axios) and scripts (dev, build, start).
2. [ ] Create frontend/vite.config.js for Vite configuration with proxy to backend.
3. [ ] Create frontend/index.html as the entry HTML template.
4. [ ] Create frontend/src/main.jsx to render the App component with React Router.
5. [ ] Create frontend/src/App.jsx as the main layout component integrating all sub-components (Header, Sidebar, StoriesCarousel, Composer, Feed, RightPanel).
6. [ ] Create frontend/src/styles/vars.css with CSS variables for colors, spacing, radii, shadows (e.g., --bg: #0f1113, --radius-md: 12px).
7. [ ] Create frontend/src/styles/global.css importing vars.css and defining base styles, grid layout utilities.
8. [ ] Create frontend/src/components/Header/Header.jsx and Header.module.css (64px sticky header with logo, search bar 520px desktop, icons).
9. [ ] Create frontend/src/components/Sidebar/Sidebar.jsx and Sidebar.module.css (280px left sidebar with menu items and "Publicar propiedad" button).
10. [ ] Create frontend/src/components/Stories/StoriesCarousel.jsx and StoriesCarousel.module.css (horizontal scrollable stories, 84x84 circles, "Crear historia" first item, modal trigger).
11. [ ] Create frontend/src/components/Composer/Composer.jsx and Composer.module.css (input composer with avatar and action buttons).
12. [ ] Create frontend/src/components/Feed/Feed.jsx and Feed.module.css (central feed rendering PostCard and PropertyCard in responsive grid).
13. [ ] Create frontend/src/components/PropertyCard/PropertyCard.jsx and PropertyCard.module.css (320px cards with price badge, hover effect, modal open).
14. [ ] Create frontend/src/components/PostCard/PostCard.jsx and PostCard.module.css (social post cards with images, interactions).
15. [ ] Create frontend/src/components/RightPanel/RightPanel.jsx and RightPanel.module.css (320px right panel with ads, contacts, mini-map placeholder).
16. [ ] Create frontend/src/components/PropertyModal/PropertyModal.jsx and PropertyModal.module.css (modal dialog with gallery, details, map, CTA; accessibility attributes).
17. [ ] Create frontend/src/api/mockData.js with mock properties and posts for Feed.
18. [ ] Create frontend/src/utils/format.js with helpers for formatting dates and prices.
19. [ ] Create server/package.json with Express, cors, nodemon and scripts (dev, start).
20. [ ] Create server/server.js as the main Express app with route mounting and port 4000.
21. [ ] Create server/routes/properties.js (GET/POST /api/properties with query params and validation).
22. [ ] Create server/routes/stories.js (GET/POST /api/stories).
23. [ ] Create server/routes/auth.js (placeholder auth routes).
24. [ ] Create server/data/properties.json with 6 example property objects (id, title, city, etc.).
25. [ ] Create server/data/stories.json with example stories.
26. [ ] Create README.md with setup instructions, endpoint examples, responsive guide, CSS tokens.
27. [ ] Install dependencies: Run npm install in frontend and server directories.
28. [ ] Test setup: Run dev servers for frontend (port 5173) and backend (port 4000), verify API responses (e.g., GET /api/properties).
29. [ ] Visual verification: Launch browser to check layout fidelity (header 64px, stories 84x84, etc.), interact with components (e.g., open modal).

## Next Steps After Completion
- Run `npm run build` in frontend for production check.
- Add any user-requested iterations (e.g., more data, features).
