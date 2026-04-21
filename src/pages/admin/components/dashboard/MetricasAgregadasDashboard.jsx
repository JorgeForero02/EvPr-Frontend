import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Building2, LayoutGrid, Users, CheckCircle2, ClipboardCheck, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';

const TABS = [
    { key: 'empresa',   label: 'Por empresa',         icon: Building2  },
    { key: 'modalidad', label: 'Por tipo de evento',   icon: LayoutGrid },
];

const TasaBadge = ({ value }) => {
    const color =
        value >= 75 ? 'bg-green-100 text-green-700' :
        value >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700';
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', color)}>
            {value}%
        </span>
    );
};

const MiniBar = ({ value }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={cn(
                    'h-full rounded-full transition-all duration-500',
                    value >= 75 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
        <TasaBadge value={value} />
    </div>
);

const Th = ({ children, right }) => (
    <th className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap',
        right ? 'text-right' : 'text-left'
    )}>
        {children}
    </th>
);

const Td = ({ children, right, muted }) => (
    <td className={cn(
        'px-4 py-3 text-sm whitespace-nowrap',
        right ? 'text-right' : 'text-left',
        muted ? 'text-slate-500' : 'text-slate-800 font-medium'
    )}>
        {children}
    </td>
);

const SkeletonRow = ({ cols }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 bg-slate-100 rounded animate-pulse" />
            </td>
        ))}
    </tr>
);

const MODALIDAD_LABEL = {
    Presencial: 'Presencial',
    Virtual: 'Virtual',
    'Híbrida': 'Híbrida',
};

const MetricasAgregadasDashboard = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    const [tab, setTab]         = useState('empresa');
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/admin/dashboard/metricas-agregadas`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setData(json.data ?? null);
        } catch {
            setError('Error al cargar las métricas. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const rows = data
        ? (tab === 'empresa' ? data.por_empresa : data.por_modalidad)
        : [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-xl font-bold">Métricas Agregadas</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Inscripciones, asistencia real, encuestas respondidas y satisfacción
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchData}
                    disabled={loading}
                    title="Actualizar"
                >
                    <RefreshCw className={cn('h-4 w-4 text-slate-500', loading && 'animate-spin')} />
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                    tab === t.key
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Summary KPI strip */}
                {data && !loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: Users,         label: 'Inscripciones',     value: rows.reduce((s, r) => s + r.total_inscripciones, 0),   color: 'bg-blue-50 text-blue-600' },
                            { icon: CheckCircle2,  label: 'Asistencias reales', value: rows.reduce((s, r) => s + r.total_asistencias, 0),     color: 'bg-green-50 text-green-600' },
                            { icon: ClipboardCheck,label: 'Encuestas respondidas', value: rows.reduce((s, r) => s + r.encuestas_respondidas, 0), color: 'bg-amber-50 text-amber-600' },
                            { icon: Star,          label: 'Respuestas satisfacción', value: rows.reduce((s, r) => s + r.satisfaccion_respondidas, 0), color: 'bg-purple-50 text-purple-600' },
                        ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 leading-none mb-1">{label}</p>
                                    <p className="text-lg font-bold text-slate-800">{value.toLocaleString('es-CO')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table */}
                {error ? (
                    <div className="py-10 text-center">
                        <p className="text-red-500 font-medium">{error}</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={fetchData}>
                            Reintentar
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-auto rounded-xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <Th>{tab === 'empresa' ? 'Empresa' : 'Tipo de evento'}</Th>
                                    <Th right>Eventos</Th>
                                    <Th right>Inscripciones</Th>
                                    <Th right>Confirmadas</Th>
                                    <Th right>Asistencias</Th>
                                    <Th>Tasa asistencia</Th>
                                    <Th right>Encuestas enviadas</Th>
                                    <Th right>Respondidas</Th>
                                    <Th>Tasa respuesta</Th>
                                    <Th>Tasa satisfacción</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading
                                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                                    : rows.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                                                Sin datos disponibles
                                            </td>
                                        </tr>
                                    )
                                    : rows.map((row, idx) => {
                                        const label = tab === 'empresa'
                                            ? row.empresa_nombre
                                            : (MODALIDAD_LABEL[row.modalidad] ?? row.modalidad ?? '—');
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <Td>
                                                    <span className="block max-w-[200px] truncate" title={label}>{label}</span>
                                                </Td>
                                                <Td right muted>{row.total_eventos.toLocaleString('es-CO')}</Td>
                                                <Td right>{row.total_inscripciones.toLocaleString('es-CO')}</Td>
                                                <Td right muted>{row.inscripciones_confirmadas.toLocaleString('es-CO')}</Td>
                                                <Td right>{row.total_asistencias.toLocaleString('es-CO')}</Td>
                                                <td className="px-4 py-3 min-w-[140px]">
                                                    <MiniBar value={row.tasa_asistencia} />
                                                </td>
                                                <Td right muted>{row.encuestas_enviadas.toLocaleString('es-CO')}</Td>
                                                <Td right>{row.encuestas_respondidas.toLocaleString('es-CO')}</Td>
                                                <td className="px-4 py-3 min-w-[140px]">
                                                    <MiniBar value={row.tasa_respuesta_encuestas} />
                                                </td>
                                                <td className="px-4 py-3 min-w-[140px]">
                                                    {row.satisfaccion_enviadas > 0
                                                        ? <MiniBar value={row.tasa_satisfaccion} />
                                                        : <span className="text-xs text-slate-400">Sin datos</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                        {!loading && rows.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right">
                                {rows.length} {tab === 'empresa' ? 'empresa' : 'tipo'}{rows.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" /> ≥ 75%</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-yellow-500 inline-block" /> 40 – 74%</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-red-500 inline-block" /> &lt; 40%</span>
                    <span className="ml-auto">Satisfacción = tasa de respuesta de encuestas tipo <em>satisfacción_evento</em></span>
                </div>
            </CardContent>
        </Card>
    );
};

export default MetricasAgregadasDashboard;
