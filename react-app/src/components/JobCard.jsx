import React from 'react';

const JobCard = ({ job, onApply, hasApplied, isStudent }) => {
  const { title, company, type, requiredSkills, deadline, postedBy } = job;
  
  const typeColors = {
    job: 'var(--success)',
    internship: 'var(--info)',
    mentorship: 'var(--warning)'
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>{title}</h3>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{company}</p>
        </div>
        <span style={{ background: typeColors[type], color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize' }}>
          {type}
        </span>
      </div>
      
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Posted by: {postedBy?.name || 'Unknown'} | Deadline: {deadline ? new Date(deadline).toLocaleDateString() : 'N/A'}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
        {requiredSkills && requiredSkills.map((s, i) => (
          <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{s}</span>
        ))}
      </div>

      {isStudent && (
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          {hasApplied ? (
            <button className="btn-secondary" disabled>Already Applied</button>
          ) : (
            <button className="btn-primary" onClick={() => onApply(job._id)}>Apply</button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
