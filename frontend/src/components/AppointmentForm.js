import React, { useState, useEffect } from 'react';
import './AppointmentForm.css';
import { createAppointment, updateAppointment, deleteAppointment } from '../services/api';

const AppointmentForm = ({ appointment, services, selectedDate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    pet_name: '',
    owner_name: '',
    owner_phone: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    pickup_service: false,
    pickup_address: '',
    notes: '',
    price: '',
    status: 'scheduled'
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (appointment) {
      const date = new Date(appointment.appointment_date);
      // Format date in local timezone to avoid day shift
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setFormData({
        pet_name: appointment.pet_name || '',
        owner_name: appointment.owner_name || '',
        owner_phone: appointment.owner_phone || '',
        service_id: appointment.service_id || '',
        appointment_date: dateStr,
        appointment_time: date.toTimeString().slice(0, 5),
        pickup_service: appointment.pickup_service || false,
        pickup_address: appointment.pickup_address || '',
        notes: appointment.notes || '',
        price: appointment.price || '',
        status: appointment.status || 'scheduled'
      });
    } else if (selectedDate) {
      // Format date in local timezone to avoid day shift
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      const time = new Date().toTimeString().slice(0, 5);
      setFormData(prev => ({
        ...prev,
        appointment_date: date,
        appointment_time: time
      }));
    }
  }, [appointment, selectedDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create date in local timezone to avoid UTC conversion issues
      const [year, month, day] = formData.appointment_date.split('-').map(Number);
      const [hours, minutes] = formData.appointment_time.split(':').map(Number);
      
      // Create date object in local timezone
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Format as ISO string but keep local time (not UTC)
      // We'll send it as a string that PostgreSQL can parse
      const appointmentDateTime = localDate.toISOString();

      const data = {
        ...formData,
        appointment_date: appointmentDateTime,
        service_id: formData.service_id ? parseInt(formData.service_id) : null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      if (appointment) {
        await updateAppointment(appointment.id, data);
        onSave();
        onClose();
      } else {
        await createAppointment(data);
        // Mostrar animação de sucesso apenas para novos agendamentos
        setShowSuccess(true);
        onSave();
        // Fechar após a animação
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Erro ao salvar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    setLoading(true);
    try {
      await deleteAppointment(appointment.id);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erro ao excluir agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <div className="success-animation">
            <div className="success-circle">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 className="success-message">Agendamento criado com sucesso!</h2>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
              <button className="close-button" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Nome do Pet *</label>
            <input
              type="text"
              name="pet_name"
              value={formData.pet_name}
              onChange={handleChange}
              required
              placeholder="Ex: Rex"
            />
          </div>

          <div className="form-group">
            <label>Nome do Dono *</label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              required
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="owner_phone"
              value={formData.owner_phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label>Serviço</label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
            >
              <option value="">Selecione um serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preço (R$)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="scheduled">Agendado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data *</label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora *</label>
              <input
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="pickup_service"
                checked={formData.pickup_service}
                onChange={handleChange}
              />
              <span>→ Serviço de Leva e Traz</span>
            </label>
          </div>

          {formData.pickup_service && (
            <div className="form-group">
              <label>Endereço para Busca</label>
              <input
                type="text"
                name="pickup_address"
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Endereço completo"
              />
            </div>
          )}

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Anotações adicionais..."
            />
          </div>

          <div className="form-actions">
            {appointment && (
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
                disabled={loading}
              >
                Excluir
              </button>
            )}
            <div className="form-actions-right">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;

