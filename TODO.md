# TODO for RentHub Dark Mode Facebook-like Implementation

This TODO tracks the progress of implementing the dark mode design mimicking Facebook, adapted for a housing rental social network. Steps are broken down logically from the approved plan. Each step will be marked as completed upon successful tool use confirmation.

## 1. Global Styles Setup
- [x] Update src/assets/styles/variables.css: Override :root with exact dark mode CSS variables (e.g., --bg-primary: #18191a; --text-primary: #e4e5e9; --accent: #0084ff; --border: #373737). Retain existing spacing/radius/transitions. Add .dark class support for manual toggle. Update media query for prefers-color-scheme: dark to match exactly.
- [x] Update src/assets/styles/global.css: Apply vars to * (background, color, border). Add global transitions (0.2s ease-in-out). Enhance hover for icons (color: var(--accent)). Add custom media queries for responsive breakpoints if needed beyond Tailwind.

## 2. Layout and SidebarRight
- [x] Update src/components/common/Layout/Layout.jsx: Import and add SidebarRight in .content-wrapper for desktop (flex row: LeftSidebar w-60 + main flex-1 px-4 + SidebarRight w-70). Hide SidebarRight on mobile (hidden lg:block).
- [x] Update src/components/common/Layout/Layout.css: Define --sidebar-width: 240px; --right-width: 280px; .content-wrapper { display: flex; } @media (min-width: 1024px) { flex-row; gap: var(--spacing-md); }. Mobile: flex-col, sidebars hidden.
- [x] Create src/components/SidebarRight/SidebarRight.jsx: Basic structure with sections ("Contactos" avatar list, "Anuncios" 3 rental cards using PostCard-like, "Páginas sugeridas"). Use mock data from socialMocks.js.
- [x] Create src/components/SidebarRight/SidebarRight.css: Width 280px; bg var(--bg-secondary); sections gap 24px; cards radius 12px, img 100x100 Unsplash house.

## 3. Header and LeftSidebar
### Sub-steps for Header:
- [ ] Update src/components/common/Header/Header.jsx: Adjust height 56px, flex layout (logo "RentHub" bold 20px var(--accent) left, SearchBar center bg #373737 with lupa SVG, right gap 16px: SVGs home/video/notif/badge/mensajes/más/avatar 32px). Add hamburger for mobile sidebar toggle. Integrate dropdowns via state.
- [ ] Update src/components/common/Header/Header.css: bg var(--bg-secondary); transitions 0.2s; icon hover var(--accent).

### Sub-steps for LeftSidebar:
- [ ] Update src/components/LeftSidebar/LeftSidebar.jsx: Vertical items gap 8px (Rent AI robot SVG, Amigos, Ofertas Pasadas clock, Favoritas bookmark, Grupos, Páginas edificio, Feeds, Ver más). Bottom: "Tus accesos directos" 4-5 cards (32px avatar + rental text e.g., "Apartamentos Bogotá").
- [ ] Update src/components/LeftSidebar/LeftSidebar.css: Width 240px; bg var(--bg-secondary); item hover bg #373737; mobile hidden lg:block with overlay.

## 4. Stories and CreatePost
- [ ] Update src/components/Stories/StoriesBar.jsx: Add left creation sidebar (300px: "Historias" + gear, "Tu historia" avatar+name+more, +Añadir circle var(--accent), "Crear con foto" blue gradient+camera, "Crear con texto" magenta+Aa, "Archivo" gray+clock). Carousel: horizontal flex gap 8px, 56px circles (border var(--accent) if viewed, Unsplash apartment cover, name overlay). Add modal state for fullscreen view/edit (5s timer, touch swipe).
- [ ] Update src/components/Stories/StoriesBar.css: Height 100px; overflow-x snap; mobile height 80px circles 44px; transitions 0.2s; modal fullscreen bg var(--bg-primary).
- [ ] Update src/components/social/Composer.jsx: Height 120px; flex avatar + input placeholder "¿Qué estás pensando...? ¿Buscas vivienda?", right icons (foto #00c851, sentimiento #f7b928, check-in var(--accent)), "Publicar" bg var(--accent). Focus: Modal with textarea, drag&drop upload (<10MB preview), privacy. POST /api/posts optimistic update.
- [ ] Update src/components/social/Composer.css: bg var(--bg-secondary) radius 12px; icons gap 24px; modal radius 12px.

## 5. Feed and PostCard
- [ ] Update src/pages/Home/Home.jsx: Integrate <StoriesBar />, <Composer />, <div className="feed gap-4"> {posts.map(<PostCard />)} </div>. Fetch GET /api/posts in useEffect, infinite scroll on scroll. Use rental mocks (20 items: house imgs, prices 500-1500€, desc "Oferta: Apartamento centro").
- [ ] Update src/pages/Home/Home.css: .feed { max-w-2xl mx-auto; } cards gap var(--spacing-md); preserve existing Hero/Category if fits social.
- [ ] Update src/components/PostCard/PostCard.jsx: Max 500px; header avatar+name/timestamp+more; img height 60% cover Unsplash house; desc 3 lines; price #00c851; footer icons gap 24px (heart likes, comment, share, bookmark) + counts. Link to /property/:id if rental.
- [ ] Update src/components/PostCard/PostCard.css: bg var(--bg-secondary) radius 12px; transitions 0.2s; hover effects.

## 6. Backend and Utils
- [ ] Update backend/server.js: Add app.use('/api/posts', require('./routes/socialRoutes')); app.use('/api/stories', ...). Preserve auth middleware.
- [ ] Create backend/routes/socialRoutes.js: GET /posts (return mock rental array), POST /posts (push {desc, img, price, userId}, res.json), similar for stories. Use in-memory or extend Prisma (add Post/Story models if needed).
- [ ] Update src/utils/socialMocks.js: Add 20 rental mocks {id, img: Unsplash ?house, price: random, desc: "Tour vivienda", likes: random}.
- [ ] Create src/utils/icons.js: Export Facebook-like SVGs (home, video, notif, camera, etc.) with paths, fill="currentColor".

## 7. Final Touches and Testing
- [ ] Update src/App.jsx: Add useEffect(() => document.body.classList.add('dark')); for default dark mode.
- [ ] Add aria-labels/alts across components (e.g., alt="Apartamento en Bogotá").
- [ ] Run `npm start` frontend, `node backend/server.js` backend. Use browser to verify dark mode, responsive (DevTools: mobile/tablet/desktop), stories/post creation (simulate files), feed with rentals.
- [ ] Check no breaks: ESLint, auth flow, API (console logs). Adjust Tailwind conflicts with !important if needed.
- [ ] Mark all [x] upon completion, then attempt_completion.

Progress: Update this file after each step.
