import React, { useState, useEffect } from 'react';
import './App.css';
import AgendaView from './components/AgendaView';
import AppointmentManagement from './components/AppointmentManagement';
import ServicesManagement from './components/ServicesManagement';
import BillingView from './components/BillingView';
import { getAppointments, getServices } from './services/api';
import CalendarIcon from './components/icons/CalendarIcon';
import AppointmentsIcon from './components/icons/AppointmentsIcon';
import ServicesIcon from './components/icons/ServicesIcon';
import BillingIcon from './components/icons/BillingIcon';

function App() {
  const [currentView, setCurrentView] = useState('agenda');
  const [menuOpen, setMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, servicesData] = await Promise.all([
        getAppointments(),
        getServices()
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const menuItems = [
    { id: 'agenda', label: 'Agenda', Icon: CalendarIcon },
    { id: 'appointments', label: 'Agendamentos', Icon: AppointmentsIcon },
    { id: 'services', label: 'Serviços', Icon: ServicesIcon },
    { id: 'billing', label: 'Faturamento', Icon: BillingIcon }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <button 
            className="hamburger-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
          <h1>PetFácil</h1>
        </div>
      </header>

      {/* Menu Overlay */}
      {menuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <nav className={`sidebar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menu</h2>
          <button 
            className="close-menu-button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>
        <ul className="menu-list">
          {menuItems.map(item => {
            const IconComponent = item.Icon;
            return (
              <li key={item.id}>
                <button
                  className={`menu-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleViewChange(item.id)}
                >
                  <span className="menu-icon">
                    <IconComponent size={24} />
                  </span>
                  <span className="menu-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="app-main">
        {currentView === 'agenda' && (
          <AgendaView appointments={appointments} />
        )}
        {currentView === 'appointments' && (
          <AppointmentManagement
            appointments={appointments}
            services={services}
            onUpdate={loadData}
          />
        )}
        {currentView === 'services' && (
          <ServicesManagement
            services={services}
            onUpdate={loadData}
          />
        )}
        {currentView === 'billing' && (
          <BillingView appointments={appointments} />
        )}
      </main>
    </div>
  );
}

export default App;

