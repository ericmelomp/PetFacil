import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getServices = () => api.get('/services').then(res => res.data);
export const createService = (data) => api.post('/services', data).then(res => res.data);
export const updateService = (id, data) => api.put(`/services/${id}`, data).then(res => res.data);
export const deleteService = (id) => api.delete(`/services/${id}`).then(res => res.data);

export const getAppointments = (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return api.get('/appointments', { params }).then(res => res.data);
};

export const createAppointment = (data) => api.post('/appointments', data).then(res => res.data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data).then(res => res.data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`).then(res => res.data);

export const getBilling = (startDate, endDate) => {
  return api.get('/billing', {
    params: { startDate, endDate }
  }).then(res => res.data);
};

