import React, { useState } from 'react';
import './BillingView.css';
import { getBilling } from '../services/api';

const BillingView = ({ appointments }) => {
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas inicial e final.');
      return;
    }

    setLoading(true);
    try {
      const data = await getBilling(startDate, endDate);
      console.log('Billing data received:', { startDate, endDate, data });
      setBillingData(data);
    } catch (error) {
      console.error('Error fetching billing:', error);
      alert('Erro ao buscar faturamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // Handle YYYY-MM-DD format directly to avoid timezone issues
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    // Fallback for other formats
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDateRange = (mode, date) => {
    const start = new Date(date);
    const end = new Date(date);

    if (mode === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (mode === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day;
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (mode === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    // Return dates in YYYY-MM-DD format for API
    const formatDateForAPI = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      start: formatDateForAPI(start),
      end: formatDateForAPI(end)
    };
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const range = getDateRange(mode, currentDate);
    setStartDate(range.start);
    setEndDate(range.end);
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
    const range = getDateRange(viewMode, newDate);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const range = getDateRange(viewMode, today);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  // Initialize dates on mount
  React.useEffect(() => {
    const range = getDateRange(viewMode, currentDate);
    setStartDate(range.start);
    setEndDate(range.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search when dates change
  React.useEffect(() => {
    if (startDate && endDate) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day;
      weekStart.setDate(diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      }
      return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1} ${weekStart.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="billing-view">
      <div className="billing-header">
        <h2>Faturamento</h2>
      </div>

      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('day')}
        >
          Dia
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('week')}
        >
          Semana
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('month')}
        >
          Mês
        </button>
      </div>

      <div className="billing-date-navigation">
        <button className="nav-button" onClick={() => navigateDate(-1)}>‹</button>
        <h3>{getHeaderTitle()}</h3>
        <button className="nav-button" onClick={() => navigateDate(1)}>›</button>
      </div>

      <div className="billing-today-btn">
        <button className="today-button" onClick={goToToday}>Hoje</button>
      </div>

      <div className="billing-filters">
        <div className="filter-info">
          <span>Período: {formatDate(startDate)} até {formatDate(endDate)}</span>
        </div>
      </div>

      {loading && (
        <div className="billing-loading">
          <div className="loading-spinner"></div>
          <p>Carregando faturamento...</p>
        </div>
      )}

      {!loading && billingData && (
        <div className="billing-results">
          <div className="billing-summary">
            <div className="summary-card">
              <div className="summary-label">Total Faturado</div>
              <div className="summary-value total">{formatCurrency(billingData.total)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Quantidade de Serviços</div>
              <div className="summary-value count">{billingData.count}</div>
            </div>
          </div>

          {billingData.byDay && billingData.byDay.length > 0 ? (
            <div className="billing-by-day">
              <h3>Faturamento por Dia</h3>
              
              {/* Gráfico de Pizza - Serviços */}
              {billingData.byService && billingData.byService.length > 0 && (
                <div className="billing-pie-chart">
                  <h4>Serviços Prestados</h4>
                  <div className="pie-chart-container">
                    <svg className="pie-chart-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                      {(() => {
                        const totalCount = billingData.byService.reduce((sum, s) => sum + s.count, 0);
                        if (totalCount === 0) return null;
                        
                        let currentAngle = -90; // Start at top
                        const colors = ['#1a1a1a', '#4a4a4a', '#6a6a6a', '#8a8a8a', '#aaaaaa', '#cacaca'];
                        
                        return billingData.byService.map((service, index) => {
                          const percentage = (service.count / totalCount) * 100;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          
                          // Calculate arc path
                          const startAngleRad = (startAngle * Math.PI) / 180;
                          const endAngleRad = (endAngle * Math.PI) / 180;
                          const centerX = 100;
                          const centerY = 100;
                          const radius = 80;
                          
                          const x1 = centerX + radius * Math.cos(startAngleRad);
                          const y1 = centerY + radius * Math.sin(startAngleRad);
                          const x2 = centerX + radius * Math.cos(endAngleRad);
                          const y2 = centerY + radius * Math.sin(endAngleRad);
                          
                          const largeArcFlag = angle > 180 ? 1 : 0;
                          
                          const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                          ].join(' ');
                          
                          currentAngle = endAngle;
                          
                          return (
                            <path
                              key={service.name}
                              d={pathData}
                              fill={colors[index % colors.length]}
                              stroke="#fff"
                              strokeWidth="2"
                              className="pie-segment"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="pie-legend">
                      {billingData.byService.map((service, index) => {
                        const totalCount = billingData.byService.reduce((sum, s) => sum + s.count, 0);
                        const percentage = totalCount > 0 ? ((service.count / totalCount) * 100).toFixed(1) : 0;
                        const colors = ['#1a1a1a', '#4a4a4a', '#6a6a6a', '#8a8a8a', '#aaaaaa', '#cacaca'];
                        
                        return (
                          <div key={service.name} className="pie-legend-item">
                            <div 
                              className="pie-legend-color" 
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <div className="pie-legend-text">
                              <span className="pie-legend-name">{service.name}</span>
                              <span className="pie-legend-value">{service.count} ({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Gráfico Minimalista */}
              <div className="billing-chart">
                <svg className="chart-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                  {/* Linhas de referência horizontais */}
                  {(() => {
                    const maxValue = Math.max(...billingData.byDay.map(d => d.total), 0);
                    if (maxValue === 0) return null;
                    const lines = 4;
                    return Array.from({ length: lines }, (_, i) => {
                      const y = (i / (lines - 1)) * 160 + 20;
                      return (
                        <line 
                          key={`line-${i}`}
                          x1="50" 
                          y1={y} 
                          x2="380" 
                          y2={y} 
                          stroke="#e5e5e5" 
                          strokeWidth="1"
                        />
                      );
                    });
                  })()}
                  
                  {/* Barras minimalistas */}
                  {billingData.byDay.map((dayData, index) => {
                    const maxValue = Math.max(...billingData.byDay.map(d => d.total), 0);
                    if (maxValue === 0) return null;
                    const barHeight = (dayData.total / maxValue) * 160;
                    const barWidth = Math.max(8, (320 / billingData.byDay.length) - 4);
                    const spacing = (380 - 50) / billingData.byDay.length;
                    const x = 50 + (index * spacing) + (spacing - barWidth) / 2;
                    const y = 180 - barHeight;
                    
                    return (
                      <g key={`bar-${index}`} className="chart-bar-group">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill="#1a1a1a"
                          className="chart-bar"
                          rx="2"
                        />
                        <text
                          x={x + barWidth / 2}
                          y="195"
                          fontSize="10"
                          fill="#999"
                          textAnchor="middle"
                          className="chart-label"
                        >
                          {(() => {
                            // Extract day from YYYY-MM-DD format without timezone conversion
                            const dayParts = dayData.day.split('-');
                            return dayParts.length === 3 ? parseInt(dayParts[2], 10) : new Date(dayData.day + 'T12:00:00').getDate();
                          })()}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {billingData.byDay.map((dayData, index) => (
                <div key={index} className="day-billing-card">
                  <div className="day-billing-header">
                    <div className="day-date">{formatDate(dayData.day)}</div>
                    <div className="day-total">{formatCurrency(dayData.total)}</div>
                    <div className="day-count">{dayData.count} serviço{dayData.count > 1 ? 's' : ''}</div>
                  </div>
                  <div className="day-appointments">
                    {dayData.appointments.map(apt => (
                      <div key={apt.id} className="day-appointment-item">
                        <div className="appointment-info">
                          <span className="appointment-pet">{apt.pet_name}</span>
                          <span className="appointment-service">{apt.service_name || 'Sem serviço'}</span>
                        </div>
                        <div className="appointment-price">
                          {apt.price ? formatCurrency(parseFloat(apt.price)) : 'Sem preço'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="billing-empty">
              <p>Nenhum faturamento encontrado para o período selecionado.</p>
              <p className="billing-hint">Certifique-se de que os agendamentos têm preço cadastrado.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !billingData && (
        <div className="billing-empty">
          <p>Selecione um período para visualizar o faturamento.</p>
        </div>
      )}
    </div>
  );
};

export default BillingView;

