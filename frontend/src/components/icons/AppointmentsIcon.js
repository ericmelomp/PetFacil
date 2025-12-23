import React from 'react';

const AppointmentsIcon = ({ size = 24, color = 'currentColor' }) => {
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
      add_2
    </span>
  );
};

export default AppointmentsIcon;

