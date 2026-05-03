import { useState, useEffect } from 'react';
import { eventService } from '../../../services/eventService';

export const useEvents = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  const cargarEventosDisponibles = async () => {
    setLoading(true);
    try {
      const token = getToken();

      if (!token) {
        throw new Error('No hay token disponible. Por favor, inicia sesión nuevamente.');
      }

      const eventosData = await eventService.getAvailableEvents(token);
      setEventos(eventosData);

      const modalidades = [...new Set(eventosData.map(evento => evento.modalidad))];
      setCategorias(modalidades);

    } catch (error) {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCuposEvento = async (eventoId) => {
    try {
      await cargarEventosDisponibles();
    } catch (error) {
    }
  };

  useEffect(() => {
    if (filtroCategoria === '') {
      setEventosFiltrados(eventos);
    } else {
      const filtrados = eventos.filter(evento =>
        evento.modalidad === filtroCategoria
      );
      setEventosFiltrados(filtrados);
    }
  }, [eventos, filtroCategoria]);

  return {
    eventos,
    eventosFiltrados,
    categorias,
    loading,
    filtroCategoria,
    setFiltroCategoria,
    cargarEventosDisponibles,
    actualizarCuposEvento
  };
};