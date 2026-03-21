import React from 'react';

const JobCard = ({ job, onApply, hasApplied, isStudent }) => {
  const { title, company, type, description, requiredSkills, deadline, postedBy } = job;
  
  const typeConfig = {
    job:        { color: 'var(--success)', bg: 'rgba(5, 150, 105, 0.08)', label: 'Job' },
    internship: { color: 'var(--info)',    bg: 'rgba(59, 130, 246, 0.08)', label: 'Internship' },
    mentorship: { color: 'var(--warning)', bg: 'rgba(217, 119, 6, 0.08)',  label: 'Mentorship' },
  };
  const cfg = typeConfig[type] || typeConfig.job;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>{title}</h3>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{company}</p>
        </div>
        <span style={{
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.color}30`,
          padding: '4px 14px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px'
        }}>
          {cfg.label}
        </span>
      </div>

      {description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', lineHeight: 1.6 }}>
          {description.length > 160 ? description.substring(0, 160) + '…' : description}
        </p>
      )}

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Posted by <strong style={{ color: 'var(--text-secondary)' }}>{postedBy?.name || 'Unknown'}</strong>
        {deadline && <> · Deadline: <strong style={{ color: 'var(--text-secondary)' }}>{new Date(deadline).toLocaleDateString()}</strong></>}
      </p>

      {requiredSkills && requiredSkills.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {requiredSkills.map((s, i) => (
            <span key={i} style={{
              background: 'rgba(236, 72, 153, 0.07)',
              color: 'var(--accent)',
              border: '1px solid rgba(236,72,153,0.15)',
              padding: '3px 12px', borderRadius: '12px',
              fontSize: '12px', fontWeight: 600
            }}>{s}</span>
          ))}
        </div>
      )}

      {isStudent && (
        <div style={{ textAlign: 'right' }}>
          {hasApplied ? (
            <button className="btn-secondary" disabled style={{ opacity: 0.7 }}>✓ Applied</button>
          ) : (
            <button className="btn-primary" onClick={() => onApply(job._id)}>Apply Now</button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
