import React, { useState } from 'react';

const FilterPanel = ({ onFilter }) => {
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');

  const handleApply = () => {
    onFilter({ batch, department, skills });
  };

  const handleClear = () => {
    setBatch('');
    setDepartment('');
    setSkills('');
    onFilter({});
  };

  return (
    <div className="card" style={{ background: 'var(--bg)' }}>
      <h4>Filters</h4>
      <input type="number" placeholder="Batch Year" value={batch} onChange={e => setBatch(e.target.value)} />
      <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
      <input type="text" placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button className="btn-primary" onClick={handleApply}>Apply</button>
        <button className="btn-secondary" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};

export default FilterPanel;
