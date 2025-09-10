Task: Improve HeroSection/SearchBar style and implement responsive filter display toggle on search click

Steps:
1. Update src/components/common/Header/SearchBar.jsx
   - Add a new prop onSearchClick (callback)
   - Call onSearchClick when the user clicks the "Buscar" button (handleSearch)
   - Keep existing onSearch call for search data

2. Update src/pages/Search/Search.jsx
   - Add a function to toggle filtersVisible state
   - Pass this function as onSearchClick prop to SearchBar
   - Optionally hide or remove the existing "Filtros" toggle button to avoid redundancy

3. Update src/pages/Home/HeroSection.jsx
   - Accept onSearchClick prop and pass it to SearchBar

4. Adjust CSS if needed for SearchBar and filters container for responsive and well-positioned display

5. Test the changes for:
   - SearchBar style matches screenshot size and style
   - Clicking "Buscar" toggles filters display responsively and well positioned
   - Filters toggle button in Search.jsx is hidden or adjusted

6. Cleanup and finalize

I will start with step 1.
