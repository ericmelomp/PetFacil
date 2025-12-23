import React, { useState, useEffect } from 'react';
import './App.css';
import AgendaView from './components/AgendaView';
import AppointmentManagement from './components/AppointmentManagement';
import ServicesManagement from './components/ServicesManagement';
import BillingView from './components/BillingView';
import BillingAuth from './components/BillingAuth';
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
  const [isBillingAuthenticated, setIsBillingAuthenticated] = useState(false);
  const [showBillingAuth, setShowBillingAuth] = useState(false);
  const [previousView, setPreviousView] = useState('agenda');

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
    // Se sair do faturamento, resetar autenticação
    if (currentView === 'billing' && view !== 'billing') {
      setIsBillingAuthenticated(false);
    }
    
    // Se tentar acessar faturamento, verificar autenticação
    if (view === 'billing') {
      if (!isBillingAuthenticated) {
        setPreviousView(currentView);
        setShowBillingAuth(true);
        setMenuOpen(false);
        return;
      }
    }
    
    setCurrentView(view);
    setMenuOpen(false);
  };

  const handleBillingAuth = (authenticated) => {
    setShowBillingAuth(false);
    if (authenticated) {
      setIsBillingAuthenticated(true);
      setCurrentView('billing');
    } else {
      // Se cancelou, volta para a view anterior
      setCurrentView(previousView);
    }
  };

  const menuItems = [
    { id: 'agenda', label: 'Visualização', Icon: CalendarIcon },
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
        {currentView === 'billing' && isBillingAuthenticated && (
          <BillingView appointments={appointments} />
        )}
      </main>

      {/* Modal de autenticação para faturamento */}
      {showBillingAuth && (
        <BillingAuth onAuthenticate={handleBillingAuth} />
      )}
    </div>
  );
}

export default App;

