import React, { useState, useEffect } from 'react';
import useDebouncedValue from '../hooks/useDebouncedValue';
import './SearchBar.css'; // Assuming you might add some styles

const SearchBar = ({ onSearch, placeholder = 'Buscar...', initialValue = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 350);

    useEffect(() => {
        onSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearch]);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="search-bar-container" style={{ marginBottom: '20px' }}>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleChange}
                style={{
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '25px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                }}
            />
        </div>
    );
};

export default SearchBar;
