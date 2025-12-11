import React from 'react';

const ServicesIcon = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <circle cx="12" cy="12" r="1"/>
    </svg>
  );
};

export default ServicesIcon;

