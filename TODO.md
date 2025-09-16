# TODO: Implement SearchBar on Explore Click in LeftSidebar

## Steps to Complete

- [x] Modify LeftSidebar.jsx to accept onExploreClick prop and handle "Explorar" click with callback instead of navigation
- [x] Modify Home.jsx to add showSearchBar state and toggle it via onExploreClick
- [x] Pass onExploreClick prop from Home to LeftSidebar
- [x] Conditionally render SearchBar in Home.jsx when showSearchBar is true
- [ ] Test that clicking "Explorar" shows SearchBar without navigation, and other menu items navigate normally
