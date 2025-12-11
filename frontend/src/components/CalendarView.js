import React, { useState } from 'react';
import './CalendarView.css';

const CalendarView = ({ appointments, onDateSelect, onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    // Get date components in local timezone
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const aptYear = aptDate.getFullYear();
      const aptMonth = aptDate.getMonth();
      const aptDay = aptDate.getDate();
      
      return aptYear === year && aptMonth === month && aptDay === day;
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getWeekDays = (date) => {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day;
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayHours = () => {
    const hours = [];
    for (let i = 7; i <= 20; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getAppointmentsForHour = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      const aptHour = aptDate.getHours();
      return aptDateStr === dateStr && aptHour === hour;
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    const hours = getDayHours();
    const sortedAppointments = [...dayAppointments].sort((a, b) => 
      new Date(a.appointment_date) - new Date(b.appointment_date)
    );

    return (
      <div className="day-view">
        <div className="day-view-header">
          <h3>{formatDate(currentDate)}</h3>
          {sortedAppointments.length > 0 && (
            <div className="day-appointments-count">
              {sortedAppointments.length} agendamento{sortedAppointments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="day-timeline">
          {hours.map(hour => {
            const hourAppointments = getAppointmentsForHour(currentDate, hour);
            return (
              <div key={hour} className="day-hour-slot">
                <div className="hour-label">{hour.toString().padStart(2, '0')}:00</div>
                <div className="hour-content">
                  {hourAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="day-appointment-card"
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <div className="appointment-time">
                        {formatTime(apt.appointment_date)}
                      </div>
                      <div className="appointment-pet">{apt.pet_name}</div>
                      <div className="appointment-owner">{apt.owner_name}</div>
                      {apt.service_name && (
                        <div className="appointment-service">{apt.service_name}</div>
                      )}
                      {apt.pickup_service && (
                        <div className="appointment-pickup">→ Leva e Traz</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {sortedAppointments.length === 0 && (
          <div className="empty-day-message">
            <p>Nenhum agendamento para este dia</p>
            <button className="add-appointment-btn" onClick={() => onDateSelect(currentDate)}>
              + Adicionar Agendamento
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekRange = weekStart.getDate() === weekEnd.getDate() 
      ? `${weekStart.getDate()} de ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${weekStart.getDate()} - ${weekEnd.getDate()} de ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;

    return (
      <div className="week-view">
        <div className="week-header">
          <h3>Semana de {weekRange}</h3>
        </div>
        <div className="week-grid">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const sortedAppointments = [...dayAppointments].sort((a, b) => 
              new Date(a.appointment_date) - new Date(b.appointment_date)
            );
            const isCurrentDay = isToday(day);

            return (
              <div key={index} className={`week-day-column ${isCurrentDay ? 'today' : ''}`}>
                <div className="week-day-header">
                  <div className="week-day-name">{dayNames[index]}</div>
                  <div className="week-day-number">{day.getDate()}</div>
                  {dayAppointments.length > 0 && (
                    <div className="week-day-count">{dayAppointments.length}</div>
                  )}
                </div>
                <div className="week-day-appointments">
                  {sortedAppointments.slice(0, 5).map(apt => (
                    <div
                      key={apt.id}
                      className="week-appointment-item"
                      onClick={() => onAppointmentClick(apt)}
                      title={`${apt.pet_name} - ${formatTime(apt.appointment_date)}`}
                    >
                      <div className="week-appointment-time">
                        {formatTime(apt.appointment_date)}
                      </div>
                      <div className="week-appointment-pet">{apt.pet_name}</div>
                      {apt.pickup_service && <span className="pickup-icon">→</span>}
                    </div>
                  ))}
                  {dayAppointments.length > 5 && (
                    <div className="week-more-appointments">
                      +{dayAppointments.length - 5} mais
                    </div>
                  )}
                  {dayAppointments.length === 0 && (
                    <button
                      className="week-add-btn"
                      onClick={() => onDateSelect(day)}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    return (
      <div className="month-view">
        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {days.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''}`}
                onClick={() => date && onDateSelect(date)}
              >
                {date && (
                  <>
                    <div className="day-number">{date.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="appointments-preview">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            className="appointment-dot"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(apt);
                            }}
                            title={`${apt.pet_name} - ${formatTime(apt.appointment_date)}`}
                          >
                            {apt.pickup_service && '→'}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="more-appointments">+{dayAppointments.length - 2}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return formatDate(currentDate);
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      }
      return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1} ${weekStart.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="calendar-view">
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => setViewMode('day')}
        >
          Dia
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => setViewMode('week')}
        >
          Semana
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          Mês
        </button>
      </div>

      <div className="calendar-header">
        <button className="nav-button" onClick={() => navigateDate(-1)}>‹</button>
        <h2>{getHeaderTitle()}</h2>
        <button className="nav-button" onClick={() => navigateDate(1)}>›</button>
      </div>

      <div className="calendar-today-btn">
        <button className="today-button" onClick={goToToday}>Hoje</button>
      </div>

      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot today-dot"></span>
          <span>Hoje</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot">→</span>
          <span>Com leva e traz</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

