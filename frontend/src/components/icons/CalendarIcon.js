import React from 'react';

const CalendarIcon = ({ size = 24, color = 'currentColor' }) => {
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
      calendar_month
    </span>
  );
};

export default CalendarIcon;






