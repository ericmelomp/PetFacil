import React, { useState } from 'react';
import './AgendaView.css';

const AgendaView = ({ appointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [expandedAppointments, setExpandedAppointments] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState(null);

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
      
      return aptYear === year && aptMonth === month && aptDay === day && apt.status !== 'cancelled';
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
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

  const toggleAppointment = (appointmentId) => {
    setExpandedAppointments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'scheduled': 'Agendado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const today = new Date();
  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    const sortedAppointments = [...dayAppointments].sort((a, b) => 
      new Date(a.appointment_date) - new Date(b.appointment_date)
    );

    return (
      <div className="agenda-day-view">
        <div className="agenda-day-header">
          <h3>{formatDate(currentDate)}</h3>
          {sortedAppointments.length > 0 && (
            <div className="agenda-count">
              {sortedAppointments.length} agendamento{sortedAppointments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="agenda-appointments-list">
          {sortedAppointments.length === 0 ? (
            <div className="agenda-empty">
              <p>Nenhum agendamento para este dia</p>
            </div>
          ) : (
            sortedAppointments.map(apt => {
              const isExpanded = expandedAppointments.has(apt.id);
              return (
                <div key={apt.id} className={`agenda-appointment-card ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="agenda-card-main"
                    onClick={() => toggleAppointment(apt.id)}
                  >
                    <div className="agenda-time">{formatTime(apt.appointment_date)}</div>
                    <div className="agenda-content">
                      <div className="agenda-pet-name">{apt.pet_name}</div>
                      <div className="agenda-owner">{apt.owner_name}</div>
                      {apt.service_name && (
                        <div className="agenda-service">{apt.service_name}</div>
                      )}
                      {apt.pickup_service && (
                        <div className="agenda-pickup">→ Leva e Traz</div>
                      )}
                    </div>
                    <button className="expand-button">
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="agenda-card-details">
                      <div className="detail-row">
                        <span className="detail-label">Telefone:</span>
                        <span className="detail-value">{apt.owner_phone || 'Não informado'}</span>
                      </div>
                      {apt.price && (
                        <div className="detail-row">
                          <span className="detail-label">Preço:</span>
                          <span className="detail-value price">{formatCurrency(parseFloat(apt.price))}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status status-${apt.status || 'scheduled'}`}>
                          {getStatusLabel(apt.status || 'scheduled')}
                        </span>
                      </div>
                      {apt.pickup_service && apt.pickup_address && (
                        <div className="detail-row">
                          <span className="detail-label">Endereço:</span>
                          <span className="detail-value">{apt.pickup_address}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <div className="detail-row full-width">
                          <span className="detail-label">Observações:</span>
                          <span className="detail-value">{apt.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    return (
      <div className="agenda-week-view">
        <div className="agenda-week-grid">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const sortedAppointments = [...dayAppointments].sort((a, b) => 
              new Date(a.appointment_date) - new Date(b.appointment_date)
            );
            const isCurrentDay = isToday(day);

            return (
              <div key={index} className={`agenda-week-day ${isCurrentDay ? 'today' : ''}`}>
                <div className="agenda-week-day-header">
                  <div className="agenda-week-day-name">{dayNames[index]}</div>
                  <div className="agenda-week-day-number">{day.getDate()}</div>
                </div>
                <div className="agenda-week-appointments">
                  {sortedAppointments.map(apt => {
                    const isExpanded = expandedAppointments.has(apt.id);
                    return (
                      <div 
                        key={apt.id} 
                        className={`agenda-week-item ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => toggleAppointment(apt.id)}
                      >
                        <div className="agenda-week-item-header">
                          <div className="agenda-week-time">{formatTime(apt.appointment_date)}</div>
                          <div className="agenda-week-pet">{apt.pet_name}</div>
                          {apt.pickup_service && <span className="pickup-icon">→</span>}
                          <button className="expand-button-small">
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="agenda-week-details">
                            <div className="week-detail">{apt.owner_name}</div>
                            {apt.service_name && (
                              <div className="week-detail">{apt.service_name}</div>
                            )}
                            {apt.price && (
                              <div className="week-detail price">{formatCurrency(parseFloat(apt.price))}</div>
                            )}
                            {apt.notes && (
                              <div className="week-detail notes">{apt.notes}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
      <div className="agenda-month-view">
        <div className="agenda-month-grid">
          {dayNames.map(day => (
            <div key={day} className="agenda-month-day-header">{day}</div>
          ))}
          {days.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentDay = isToday(date);
            const isSelected = selectedDay && date && selectedDay.toDateString() === date.toDateString();
            
            return (
              <div
                key={index}
                className={`agenda-month-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => date && setSelectedDay(date)}
              >
                {date && (
                  <>
                    <div className="agenda-month-day-number">{date.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="agenda-month-count-badge">
                        {dayAppointments.length}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        {selectedDay && (
          <div className="month-day-details">
            <div className="month-day-details-header">
              <h4>{formatDate(selectedDay)}</h4>
              <button className="close-details-btn" onClick={() => setSelectedDay(null)}>×</button>
            </div>
            <div className="month-day-appointments">
              {getAppointmentsForDate(selectedDay).length === 0 ? (
                <p className="no-appointments">Nenhum agendamento para este dia</p>
              ) : (
                getAppointmentsForDate(selectedDay)
                  .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
                  .map(apt => {
                    const isExpanded = expandedAppointments.has(apt.id);
                    return (
                      <div key={apt.id} className={`month-appointment-item ${isExpanded ? 'expanded' : ''}`}>
                        <div 
                          className="month-item-header"
                          onClick={() => toggleAppointment(apt.id)}
                        >
                          <span className="month-item-time">{formatTime(apt.appointment_date)}</span>
                          <span className="month-item-pet">{apt.pet_name}</span>
                          {apt.pickup_service && <span className="pickup-icon">→</span>}
                          <button className="expand-button-small">
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="month-item-details">
                            <div className="detail-row">
                              <span className="detail-label">Dono:</span>
                              <span className="detail-value">{apt.owner_name}</span>
                            </div>
                            {apt.owner_phone && (
                              <div className="detail-row">
                                <span className="detail-label">Telefone:</span>
                                <span className="detail-value">{apt.owner_phone}</span>
                              </div>
                            )}
                            {apt.service_name && (
                              <div className="detail-row">
                                <span className="detail-label">Serviço:</span>
                                <span className="detail-value">{apt.service_name}</span>
                              </div>
                            )}
                            {apt.price && (
                              <div className="detail-row">
                                <span className="detail-label">Preço:</span>
                                <span className="detail-value price">{formatCurrency(parseFloat(apt.price))}</span>
                              </div>
                            )}
                            {apt.notes && (
                              <div className="detail-row full-width">
                                <span className="detail-label">Observações:</span>
                                <span className="detail-value">{apt.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
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
    <div className="agenda-view">
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

      <div className="agenda-header">
        <button className="nav-button" onClick={() => navigateDate(-1)}>‹</button>
        <h2>{getHeaderTitle()}</h2>
        <button className="nav-button" onClick={() => navigateDate(1)}>›</button>
      </div>

      <div className="agenda-today-btn">
        <button className="today-button" onClick={goToToday}>Hoje</button>
      </div>

      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
};

export default AgendaView;

