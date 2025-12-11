import React, { useState } from 'react';
import './ServicesManagement.css';
import { createService, updateService, deleteService } from '../services/api';

const ServicesManagement = ({ services, onUpdate }) => {
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: 60
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      duration: 60
    });
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingService(null);
    setFormData({
      name: '',
      duration: 60
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData);
      }
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

    setLoading(true);
    try {
      await deleteService(id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erro ao excluir serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="services-management">
      <div className="services-header">
        <h2>Gerenciar Serviços</h2>
        <button className="add-button" onClick={handleNew}>
          + Adicionar Serviço
        </button>
      </div>

      <div className="services-list">
        {services.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum serviço cadastrado ainda.</p>
            <p>Clique em "Adicionar Serviço" para começar.</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-info">
                <h3>{service.name}</h3>
                <div className="service-details">
                  <span>⏱ {service.duration} min</span>
                </div>
              </div>
              <div className="service-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(service)}
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(service.id)}
                  disabled={loading}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button className="close-button" onClick={handleClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-group">
                <label>Nome do Serviço *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Banho e Tosa"
                />
              </div>

              <div className="form-group">
                <label>Duração (minutos) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="60"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleClose}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;

