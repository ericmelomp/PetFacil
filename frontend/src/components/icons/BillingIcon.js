import React from 'react';

const BillingIcon = ({ size = 24, color = 'currentColor' }) => {
  return (
    <span 
      className="material-symbols-outlined" 
      style={{ 
        fontSize: size, 
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      attach_money
    </span>
  );
};

export default BillingIcon;

