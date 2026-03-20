import React from 'react';

const ProfileCard = ({ user, onConnect, connectionStatus }) => {
  const { name, designation, company, batch, skills } = user;
  
  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase() : '?';

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold' }}>
        {getInitials(name)}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 5px 0' }}>{name}</h3>
        <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>
          {designation} {company ? `at ${company}` : ''} | Batch: {batch}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {skills && skills.slice(0, 3).map((s, i) => (
            <span key={i} style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{s}</span>
          ))}
          {skills && skills.length > 3 && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+{skills.length - 3} more</span>
          )}
        </div>
      </div>
      <div>
        {connectionStatus === 'connected' ? (
          <button className="btn-secondary" disabled>Connected</button>
        ) : connectionStatus === 'pending' ? (
          <button className="btn-secondary" disabled>Pending</button>
        ) : (
          <button className="btn-primary" onClick={() => onConnect(user._id)}>Connect</button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
