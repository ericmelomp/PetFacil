import React from 'react';

const AppointmentsIcon = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <line x1="7" y1="10" x2="17" y2="10"/>
      <line x1="7" y1="14" x2="17" y2="14"/>
      <line x1="7" y1="18" x2="12" y2="18"/>
    </svg>
  );
};

export default AppointmentsIcon;

