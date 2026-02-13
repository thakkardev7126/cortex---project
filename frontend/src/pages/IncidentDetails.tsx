import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, ArrowLeft, Brain, Cpu, Activity } from 'lucide-react';
import api from '../services/api';

const IncidentDetails: React.FC = () => {
    const { id } = useParams();
    const [incident, setIncident] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                const res = await api.get(`/events/incidents/${id}`);
                setIncident(res.data);
            } catch (error) {
                console.error('Failed to fetch incident', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchIncident();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading incident details...</div>;
    if (!incident) return <div className="p-8 text-center text-red-500">Incident not found</div>;

    // Derived AI Summary (if backend didn't provide one, generate a frontend one for fallback)
    const aiSummary = incident.summary || `This incident involves ${incident.alerts.length} high-severity alerts from sources: ${Array.from(new Set(incident.alerts.map((a: any) => a.event.source))).join(', ')}. Initial vector appears to be related to ${incident.alerts[0]?.mitreTactic || 'Suspicious Activity'}.`;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/incidents" className="text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Incident #{incident.id.substring(0, 8)}
                    <span className={`text-sm px-2 py-0.5 rounded-full ${incident.status === 'OPEN' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                        {incident.status}
                    </span>
                </h1>
            </div>

            {/* AI Summary Card */}
            <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 to-indigo-900/20 border-indigo-500/30">
                <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-indigo-100">AI Analysis</h2>
                </div>
                <p className="text-slate-300 leading-relaxed font-light">
                    {aiSummary}
                </p>
                <div className="mt-4 flex gap-2">
                    {incident.alerts.map((alert: any) => (
                        alert.mitreTactic && (
                            <span key={alert.id} className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {alert.mitreTactic}: {alert.mitreTechniqueID}
                            </span>
                        )
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-accent" />
                    Attack Timeline
                </h2>

                <div className="relative pl-6 border-l border-slate-700 space-y-8">
                    {incident.timeline?.map((entry: any, index: number) => (
                        <div key={index} className="relative group">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-4 border-slate-900 transition-all ${entry.type === 'ALERT' ? 'bg-red-500 group-hover:bg-red-400 group-hover:scale-125' : 'bg-slate-600 group-hover:bg-slate-500'
                                }`}></div>

                            <div className={`p-4 rounded-lg border transition-colors ${entry.type === 'ALERT'
                                ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {entry.type === 'ALERT' ? (
                                            <Shield className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <Activity className="w-4 h-4 text-slate-400" />
                                        )}
                                        <span className={`font-semibold ${entry.type === 'ALERT' ? 'text-white' : 'text-slate-300'}`}>
                                            {entry.message}
                                        </span>
                                        {entry.type === 'ALERT' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                                                {entry.severity}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                        <Clock className="w-3 h-3" />
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase tracking-widest mb-1 font-bold">Source Agent</span>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Cpu className="w-3 h-3" />
                                            {entry.source}
                                        </div>
                                    </div>
                                    {entry.type === 'ALERT' && entry.mitreTactic && (
                                        <div>
                                            <span className="text-slate-500 block text-[10px] uppercase tracking-widest mb-1 font-bold">MITRE ATT&CK</span>
                                            <div className="text-brand-accent font-mono text-xs">
                                                {entry.mitreTactic} ({entry.mitreTechniqueId})
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {entry.type === 'ALERT' && entry.aiSummary && (
                                    <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg text-sm text-indigo-300 italic border-l-4 border-indigo-500/50 font-light leading-relaxed">
                                        <div className="flex items-center gap-2 mb-1 not-italic">
                                            <Brain className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">AI Summary</span>
                                        </div>
                                        "{entry.aiSummary}"
                                    </div>
                                )}

                                {entry.type === 'EVENT' && entry.details && (
                                    <div className="mt-3 p-2 bg-slate-900/30 rounded text-[10px] text-slate-500 font-mono overflow-hidden truncate">
                                        {JSON.stringify(entry.details)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IncidentDetails;
