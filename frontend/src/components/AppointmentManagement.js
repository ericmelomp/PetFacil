import React, { useState } from 'react';
import './AppointmentManagement.css';
import AppointmentForm from './AppointmentForm';
import { deleteAppointment, updateAppointment } from '../services/api';

const AppointmentManagement = ({ appointments, services, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} às ${formatTime(dateString)}`;
  };

  const handleNew = () => {
    setSelectedAppointment(null);
    setSelectedDate(new Date());
    setShowForm(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(null);
    setShowForm(true);
  };

  const handleCancel = async (appointment) => {
    if (!window.confirm(`Tem certeza que deseja cancelar o agendamento de ${appointment.pet_name}?`)) {
      return;
    }

    try {
      await updateAppointment(appointment.id, {
        ...appointment,
        status: 'cancelled'
      });
      onUpdate();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Erro ao cancelar agendamento. Tente novamente.');
    }
  };

  const handleComplete = async (appointment) => {
    try {
      await updateAppointment(appointment.id, {
        ...appointment,
        status: 'completed'
      });
      onUpdate();
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Erro ao marcar agendamento como concluído. Tente novamente.');
    }
  };

  const handlePaid = async (appointment) => {
    try {
      await updateAppointment(appointment.id, {
        ...appointment,
        paid: !appointment.paid
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating paid status:', error);
      alert('Erro ao atualizar status de pagamento. Tente novamente.');
    }
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o agendamento de ${appointment.pet_name}?`)) {
      return;
    }

    try {
      await deleteAppointment(appointment.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erro ao excluir agendamento. Tente novamente.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    onUpdate();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'scheduled': { label: 'Agendado', class: 'status-scheduled' },
      'completed': { label: 'Concluído', class: 'status-completed' },
      'cancelled': { label: 'Cancelado', class: 'status-cancelled' }
    };
    return statusMap[status] || { label: status, class: 'status-unknown' };
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

  return (
    <div className="appointment-management">
      <div className="appointment-management-header">
        <h2>Gerenciar Agendamentos</h2>
        <button className="new-appointment-btn" onClick={handleNew}>
          + Novo Agendamento
        </button>
      </div>

      <div className="appointment-filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'scheduled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('scheduled')}
        >
          Agendados
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Concluídos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelados
        </button>
      </div>

      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum agendamento encontrado.</p>
            <button className="add-first-btn" onClick={handleNew}>
              Criar Primeiro Agendamento
            </button>
          </div>
        ) : (
          filteredAppointments.map(appointment => {
            const statusBadge = getStatusBadge(appointment.status);
            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-card-header">
                  <div className="appointment-pet-info">
                    <h3>{appointment.pet_name}</h3>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="appointment-actions">
                    {appointment.status !== 'cancelled' && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(appointment)}
                        >
                          Editar
                        </button>
                        {appointment.status === 'scheduled' && (
                          <>
                            <button
                              className="complete-btn"
                              onClick={() => handleComplete(appointment)}
                            >
                              Concluído
                            </button>
                            <button
                              className={`paid-btn ${appointment.paid ? 'paid' : ''}`}
                              onClick={() => handlePaid(appointment)}
                            >
                              {appointment.paid ? '✓ Pago' : 'Pago'}
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancel(appointment)}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {appointment.status === 'completed' && !appointment.paid && (
                          <button
                            className={`paid-btn ${appointment.paid ? 'paid' : ''}`}
                            onClick={() => handlePaid(appointment)}
                          >
                            {appointment.paid ? '✓ Pago' : 'Pago'}
                          </button>
                        )}
                      </>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(appointment)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <div className="appointment-card-body">
                  <div className="appointment-info-row">
                    <span className="info-label">Dono:</span>
                    <span className="info-value">{appointment.owner_name}</span>
                  </div>
                  {appointment.owner_phone && (
                    <div className="appointment-info-row">
                      <span className="info-label">Telefone:</span>
                      <span className="info-value">{appointment.owner_phone}</span>
                    </div>
                  )}
                  <div className="appointment-info-row">
                    <span className="info-label">Data/Hora:</span>
                    <span className="info-value">{formatDateTime(appointment.appointment_date)}</span>
                  </div>
                  {appointment.service_name && (
                    <div className="appointment-info-row">
                      <span className="info-label">Serviço:</span>
                      <span className="info-value">{appointment.service_name}</span>
                    </div>
                  )}
                  {appointment.price && (
                    <div className="appointment-info-row">
                      <span className="info-label">Preço:</span>
                      <span className="info-value price">R$ {parseFloat(appointment.price).toFixed(2)}</span>
                    </div>
                  )}
                  {appointment.pickup_service && (
                    <div className="appointment-info-row">
                      <span className="info-label">→ Leva e Traz:</span>
                      <span className="info-value">{appointment.pickup_address || 'Endereço não informado'}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="appointment-info-row">
                      <span className="info-label">Observações:</span>
                      <span className="info-value">{appointment.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          services={services}
          selectedDate={selectedDate}
          onClose={handleFormClose}
          onSave={onUpdate}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;

