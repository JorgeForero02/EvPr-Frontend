import React, { useState, useEffect, useCallback } from 'react';
import { Filter, RefreshCw, Search, X, CalendarDays, LayoutGrid, Building2, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import KpiCard from '../../../../components/ui/KpiCard';

const ESTADOS_EVENTO = [
    { value: '', label: 'Todos los estados' },
    { value: '0', label: 'Borrador' },
    { value: '1', label: 'Publicado' },
    { value: '2', label: 'Cancelado' },
    { value: '3', label: 'Finalizado' },
];

const MODALIDADES = [
    { value: '', label: 'Todas las modalidades' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Virtual', label: 'Virtual' },
    { value: 'Híbrida', label: 'Híbrida' },
];

const ESTADO_LABELS = {
    '0': 'Borrador',
    '1': 'Publicado',
    '2': 'Cancelado',
    '3': 'Finalizado',
};

const ESTADO_COLORS = {
    '0': 'bg-slate-100 text-slate-700',
    '1': 'bg-green-100 text-green-700',
    '2': 'bg-red-100 text-red-700',
    '3': 'bg-blue-100 text-blue-700',
};

const EMPTY_FILTERS = { fechaDesde: '', fechaHasta: '', empresa: '', modalidad: '', estado: '' };

const EventosGlobalesDashboard = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [eventos, setEventos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAuth = useCallback(async (url) => {
        const token = localStorage.getItem('access_token');
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
    }, []);

    useEffect(() => {
        fetchAuth(`${API_URL}/empresas?incluir_pendientes=true`)
            .then(data => {
                const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                setEmpresas(list);
            })
            .catch(() => setEmpresas([]));
    }, [fetchAuth, API_URL]);

    const fetchEventos = useCallback(async (activeFilters) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (activeFilters.empresa) params.set('id_empresa', activeFilters.empresa);
            if (activeFilters.modalidad) params.set('modalidad', activeFilters.modalidad);
            if (activeFilters.estado !== '') params.set('estado', activeFilters.estado);
            if (activeFilters.fechaDesde) params.set('fecha_desde', activeFilters.fechaDesde);
            if (activeFilters.fechaHasta) params.set('fecha_hasta', activeFilters.fechaHasta);

            const data = await fetchAuth(`${API_URL}/eventos?${params.toString()}`);
            setEventos(Array.isArray(data?.data) ? data.data : []);
        } catch {
            setError('Error al cargar los eventos. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [fetchAuth, API_URL]);

    useEffect(() => {
        fetchEventos(EMPTY_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = () => {
        const next = { ...filters };
        setAppliedFilters(next);
        fetchEventos(next);
    };

    const handleClear = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        fetchEventos(EMPTY_FILTERS);
    };

    const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const stats = {
        total: eventos.length,
        borrador: eventos.filter(e => String(e.estado) === '0').length,
        publicado: eventos.filter(e => String(e.estado) === '1').length,
        cancelado: eventos.filter(e => String(e.estado) === '2').length,
        finalizado: eventos.filter(e => String(e.estado) === '3').length,
    };

    const hasActiveFilters = Object.values(appliedFilters).some(v => v !== '');

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-xl font-bold">Tablero Global de Eventos</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Consulta y filtra todos los eventos de la plataforma
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchEventos(appliedFilters)}
                    disabled={loading}
                    title="Actualizar"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Filter panel */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Filtros</span>
                        {hasActiveFilters && (
                            <span className="ml-auto text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full">
                                Filtros activos
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Fecha desde</Label>
                            <Input
                                type="date"
                                value={filters.fechaDesde}
                                onChange={e => setFilter('fechaDesde', e.target.value)}
                                max={filters.fechaHasta || undefined}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Fecha hasta</Label>
                            <Input
                                type="date"
                                value={filters.fechaHasta}
                                onChange={e => setFilter('fechaHasta', e.target.value)}
                                min={filters.fechaDesde || undefined}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Empresa</Label>
                            <Select
                                value={filters.empresa}
                                onChange={e => setFilter('empresa', e.target.value)}
                            >
                                <option value="">Todas las empresas</option>
                                {empresas.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Tipo de evento</Label>
                            <Select
                                value={filters.modalidad}
                                onChange={e => setFilter('modalidad', e.target.value)}
                            >
                                {MODALIDADES.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Estado</Label>
                            <Select
                                value={filters.estado}
                                onChange={e => setFilter('estado', e.target.value)}
                            >
                                {ESTADOS_EVENTO.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button variant="outline" size="sm" onClick={handleClear}>
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Limpiar
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                            Aplicar filtros
                        </Button>
                    </div>
                </div>

                {/* KPI summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KpiCard icon={LayoutGrid}   title="Total eventos"  value={stats.total}     variant="brand"   />
                    <KpiCard icon={CalendarDays} title="Borradores"     value={stats.borrador}  variant="default" />
                    <KpiCard icon={Activity}     title="Publicados"     value={stats.publicado} variant="success" />
                    <KpiCard icon={X}            title="Cancelados"     value={stats.cancelado} variant="danger"  />
                    <KpiCard icon={Building2}    title="Finalizados"    value={stats.finalizado} variant="warning" />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-6 w-6 animate-spin text-brand-600 mr-3" />
                        <span className="text-slate-500 font-medium">Cargando eventos...</span>
                    </div>
                ) : error ? (
                    <div className="py-10 text-center">
                        <p className="text-red-500 font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchEventos(appliedFilters)}>
                            Reintentar
                        </Button>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <CalendarDays className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                        <p>No se encontraron eventos con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="overflow-auto rounded-xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Título</th>
                                    <th className="px-4 py-3 text-left font-semibold">Empresa</th>
                                    <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                                    <th className="px-4 py-3 text-left font-semibold">Estado</th>
                                    <th className="px-4 py-3 text-left font-semibold">Fecha inicio</th>
                                    <th className="px-4 py-3 text-left font-semibold">Fecha fin</th>
                                    <th className="px-4 py-3 text-right font-semibold">Inscritos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {eventos.map(ev => (
                                    <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[220px]">
                                            <span className="block truncate" title={ev.titulo}>{ev.titulo}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {ev.empresa?.nombre ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {ev.modalidad}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[String(ev.estado)] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {ESTADO_LABELS[String(ev.estado)] ?? ev.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {ev.fecha_inicio
                                                ? new Date(ev.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {ev.fecha_fin
                                                ? new Date(ev.fecha_fin).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                                            {ev.inscripciones?.length ?? 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right">
                            {eventos.length} evento{eventos.length !== 1 ? 's' : ''} encontrado{eventos.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EventosGlobalesDashboard;
