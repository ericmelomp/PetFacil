import React, { useState } from 'react';
import './AppointmentManagement.css';
import AppointmentForm from './AppointmentForm';
import { deleteAppointment, updateAppointment } from '../services/api';

const AppointmentManagement = ({ appointments, services, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    setDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete.id);
      onUpdate();
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erro ao excluir agendamento. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
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
                  {appointment.payment_method && (
                    <div className="appointment-info-row">
                      <span className="info-label">Pagamento:</span>
                      <span className="info-value">{appointment.payment_method}</span>
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

      {showDeleteConfirm && appointmentToDelete && (
        <div className="confirm-modal-overlay" onClick={handleDeleteCancel}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Tem certeza que deseja excluir permanentemente este agendamento?</p>
              <div className="confirm-appointment-info">
                <p><strong>Pet:</strong> {appointmentToDelete.pet_name}</p>
                <p><strong>Dono:</strong> {appointmentToDelete.owner_name}</p>
                {appointmentToDelete.appointment_date && (
                  <p><strong>Data:</strong> {formatDateTime(appointmentToDelete.appointment_date)}</p>
                )}
                {appointmentToDelete.service_name && (
                  <p><strong>Serviço:</strong> {appointmentToDelete.service_name}</p>
                )}
              </div>
              <p className="confirm-warning">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-cancel-button"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="confirm-delete-button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;

