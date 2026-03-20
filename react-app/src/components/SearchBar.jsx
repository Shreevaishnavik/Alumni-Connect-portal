import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <span style={{ position: 'absolute', left: '10px', top: '10px' }}>🔍</span>
      <input 
        type="text"
        placeholder="Search directory by name or company..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ paddingLeft: '35px' }}
      />
    </div>
  );
};

export default SearchBar;
