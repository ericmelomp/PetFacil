import React from 'react';

const BillingIcon = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="6" x2="12" y2="18"/>
      <path d="M15 9.5a3 3 0 1 0 0 5"/>
      <path d="M9 9.5a3 3 0 1 1 0 5"/>
    </svg>
  );
};

export default BillingIcon;

