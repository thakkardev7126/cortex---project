import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert, Clock, Activity } from 'lucide-react';

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.get('/events/alerts');
                setAlerts(res.data);
            } catch (error) {
                console.error('Failed to fetch alerts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

            await api.patch(`/events/alerts/${id}/status`, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert on failure (could improve this with robust state management, but fine for now)
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading alerts...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                            <th className="p-4 font-medium text-slate-400">Severity</th>
                            <th className="p-4 font-medium text-slate-400">Message</th>
                            <th className="p-4 font-medium text-slate-400">Status</th>
                            <th className="p-4 font-medium text-slate-400">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    No alerts found.
                                </td>
                            </tr>
                        ) : (
                            alerts.map((alert: any) => (
                                <tr key={alert.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                            <ShieldAlert className="w-3 h-3" />
                                            {alert.severity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white">
                                        <div>{alert.message}</div>
                                        {alert.mitreTactic && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                                                    MITRE: {alert.mitreTactic} ({alert.mitreTechniqueId || 'N/A'})
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {alert.incidentId ? (
                                            <Link to={`/incidents/${alert.incidentId}`} className="text-brand-accent hover:underline flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                View Incident
                                            </Link>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            className={`text-sm border-0 rounded px-2 py-1 cursor-pointer focus:ring-2 focus:ring-brand-accent outline-none ${alert.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                                                alert.status === 'ACKNOWLEDGED' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}
                                            value={alert.status}
                                            onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                                        >
                                            <option value="OPEN" className="bg-slate-800 text-red-400">OPEN</option>
                                            <option value="ACKNOWLEDGED" className="bg-slate-800 text-yellow-400">ACKNOWLEDGED</option>
                                            <option value="RESOLVED" className="bg-slate-800 text-green-400">RESOLVED</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Alerts;
