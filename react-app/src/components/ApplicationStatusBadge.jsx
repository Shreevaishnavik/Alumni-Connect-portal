import React from 'react';

const ApplicationStatusBadge = ({ status }) => {
  const colorMap = {
    applied: { bg: '#E3F2FD', text: '#1565C0', label: 'Applied' },
    under_review: { bg: '#FFF3E0', text: '#E65100', label: 'Under Review' },
    accepted: { bg: '#E8F5E9', text: '#2E7D32', label: 'Accepted' },
    rejected: { bg: '#FFEBEE', text: '#C62828', label: 'Rejected' },
  };

  const current = colorMap[status] || colorMap.applied;

  return (
    <span style={{ 
      backgroundColor: current.bg, 
      color: current.text, 
      padding: '4px 8px', 
      borderRadius: '4px', 
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      {current.label}
    </span>
  );
};

export default ApplicationStatusBadge;
