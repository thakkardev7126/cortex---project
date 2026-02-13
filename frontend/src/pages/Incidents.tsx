import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Clock, ArrowRight, Activity } from 'lucide-react';
import api from '../services/api';

const Incidents: React.FC = () => {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await api.get('/events/incidents');
                setIncidents(res.data);
            } catch (error) {
                console.error('Failed to fetch incidents', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading incidents...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertOctagon className="text-brand-accent" />
                Security Incidents
            </h1>

            <div className="grid gap-4">
                {incidents.length === 0 && (
                    <div className="text-center p-12 glass-panel">
                        <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No active incidents found.</p>
                    </div>
                )}

                {incidents.map((incident: any) => (
                    <div key={incident.id} className="glass-panel p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                                        }`}>
                                        {incident.severity}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">ID: {incident.id.substring(0, 8)}</span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(incident.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {incident.summary || `Incident detected with ${incident.alerts.length} alerts`}
                                </h3>
                                <div className="flex gap-2">
                                    <div className="text-sm text-slate-400">
                                        Related Alerts: <span className="text-white font-medium">{incident.alerts.length}</span>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Sources: <span className="text-white font-medium">{[...new Set(incident.alerts.map((a: any) => a.event.source))].join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/incidents/${incident.id}`}
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                View Timeline <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Incidents;
