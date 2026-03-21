import React from 'react';

const ProfileCard = ({ user, onConnect, connectionStatus, connecting }) => {
  const { name, designation, company, batch, skills, role } = user;
  
  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'var(--grad-ux)', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '24px', fontWeight: 'bold', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
      }}>
        {getInitials(name)}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px 0' }}>{name}</h3>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {designation}{company ? ` at ${company}` : ''}{batch ? ` · Batch ${batch}` : ''}
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {skills && skills.slice(0, 3).map((s, i) => (
            <span key={i} style={{
              background: 'rgba(108, 56, 255, 0.08)',
              color: 'var(--primary)',
              border: '1px solid rgba(108,56,255,0.15)',
              padding: '2px 10px', borderRadius: '12px',
              fontSize: '12px', fontWeight: 600
            }}>{s}</span>
          ))}
          {skills && skills.length > 3 && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{skills.length - 3} more</span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {connectionStatus === 'connected' ? (
          <button className="btn-secondary" disabled style={{ opacity: 0.7 }}>✓ Connected</button>
        ) : connectionStatus === 'pending' ? (
          <button className="btn-secondary" disabled style={{ opacity: 0.7 }}>Pending…</button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => onConnect(user._id)}
            disabled={connecting}
            style={{ opacity: connecting ? 0.7 : 1 }}
          >
            {connecting ? '…' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
