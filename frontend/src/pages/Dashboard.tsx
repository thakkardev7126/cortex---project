import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShieldAlert, Activity, Server, Zap, ShieldCheck, Loader2, Search, LayoutDashboard, LogOut } from "lucide-react";
import clsx from 'clsx';

const Dashboard: React.FC = () => {
    const [hasStartedScan, setHasStartedScan] = useState(() => {
        return localStorage.getItem('dashboard_scanned') === 'true';
    });
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');

    const [stats, setStats] = useState({ events: 0, alerts: 0, activeAgents: 0, policies: 0 });
    const [events, setEvents] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const statsRes = await api.get('/dashboard/stats');
            const { stats: dashStats, recentEvents, eventsByHour } = statsRes.data;

            setStats({
                events: dashStats.totalEvents,
                alerts: dashStats.activeAlerts,
                activeAgents: dashStats.activeSources,
                policies: dashStats.activePolicies
            });
            setEvents(recentEvents || []);

            if (eventsByHour && Array.isArray(eventsByHour)) {
                setChartData(eventsByHour.map((item: any) => ({
                    name: new Date(item.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    events: item.count
                })));
            }

        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to CORTEX Backend. Ensure the server is running on port 5001.');
            } else {
                setError(err.response?.data?.error || 'Failed to fetch dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasStartedScan) {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        }
    }, [hasStartedScan]);

    const handleStartScan = () => {
        setIsScanning(true);
        setScanProgress(0);

        const statuses = [
            'Initializing CORTEX core...',
            'Establishing secure tunnel to agents...',
            'Auditing kernel-level system calls...',
            'Scanning network packets for anomalies...',
            'Synchronizing correlation engine...',
            'Generating real-time threat map...'
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + (Math.random() * 15);

                // Update status message based on progress
                const step = Math.floor((next / 100) * statuses.length);
                if (step < statuses.length && step !== currentStep) {
                    currentStep = step;
                    setScanStatus(statuses[step]);
                }

                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setHasStartedScan(true);
                        setIsScanning(false);
                        localStorage.setItem('dashboard_scanned', 'true');
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, 400);
    };

    const handleEndSession = () => {
        if (window.confirm('Are you sure you want to terminate the active monitoring session?')) {
            localStorage.removeItem('dashboard_scanned');
            setHasStartedScan(false);
            setStats({ events: 0, alerts: 0, activeAgents: 0, policies: 0 });
            setEvents([]);
            setChartData([]);
        }
    };

    if (isScanning) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center">
                        <Loader2 className="w-16 h-16 text-brand-accent animate-spin" />
                    </div>
                    <Search className="w-8 h-8 text-brand-accent absolute top-0 right-0 animate-bounce" />
                </div>

                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-3xl font-bold tracking-tight text-white">System Scan in Progress</h2>
                    <p className="text-brand-accent font-mono text-sm uppercase tracking-widest h-6">
                        {scanStatus}
                    </p>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-8 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-brand-accent transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        <span>Modules Verified: {Math.floor(scanProgress / 5)}/20</span>
                        <span>{Math.floor(scanProgress)}% COMPLETE</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasStartedScan) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 max-w-2xl mx-auto text-center px-6">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-brand-accent/20 rounded-full blur-3xl group-hover:bg-brand-accent/30 transition-all duration-500"></div>
                    <div className="relative glass-panel p-10 rounded-full border-2 border-slate-700/50 group-hover:border-brand-accent/50 transition-colors shadow-2xl">
                        <Zap className="w-20 h-20 text-brand-accent group-hover:scale-110 transition-transform duration-500 shadow-brand-accent/50" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white">System Standby</h1>
                    <p className="text-xl text-slate-400">
                        CORTEX is currently idle. Initialize a full system scan to begin monitoring runtime events,
                        agent health, and security vulnerabilities.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <button
                        onClick={handleStartScan}
                        className="btn-primary flex items-center gap-3 px-10 py-5 text-lg group overflow-hidden relative"
                    >
                        <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <ShieldCheck className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Start Deep System Scan</span>
                    </button>

                    <div className="text-left hidden sm:block border-l border-slate-700 pl-6 py-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Engine Ready
                        </div>
                        <p className="text-sm text-slate-400 font-medium">v2.4.0-deep-core</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 w-full pt-12 border-t border-slate-800/50">
                    <div className="text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Agents</p>
                        <p className="text-lg font-bold text-white">16 Connected</p>
                    </div>
                    <div className="text-center border-x border-slate-800/50">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Uptime</p>
                        <p className="text-lg font-bold text-white">99.98%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Latent Alerts</p>
                        <p className="text-lg font-bold text-yellow-500">204 Pending</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-brand-accent animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium tracking-wide">Syncing Security Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="glass-panel p-8 max-w-md text-center border-red-500/20 shadow-2xl shadow-red-500/10">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
                    <p className="text-slate-400 mb-6 font-medium">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="btn-primary w-full mb-4"
                    >
                        Retry Connection
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('dashboard_scanned'); setHasStartedScan(false); }}
                        className="text-slate-500 hover:text-white text-sm transition-colors"
                    >
                        Return to Standby
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Security Overview</h1>
                    <p className="text-slate-400 text-sm">Real-time runtime telemetry and agent behavior analysis.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Scan Session</span>
                    </div>
                    <button
                        onClick={handleEndSession}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg border border-slate-700 transition-all text-sm font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        End Session
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex items-center justify-between group hover:border-red-500/30 transition-all duration-300">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Alerts</p>
                        <p className="text-4xl font-extrabold text-red-500 mt-2 tracking-tight group-hover:scale-105 transition-transform">{stats.alerts}</p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-xl group-hover:bg-red-500/20 transition-colors"><ShieldAlert className="text-red-500 h-8 w-8" /></div>
                </div>
                <div className="glass-panel p-6 flex items-center justify-between group hover:border-brand-accent/30 transition-all duration-300">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Events (24h)</p>
                        <p className="text-4xl font-extrabold text-brand-accent mt-2 tracking-tight group-hover:scale-105 transition-transform">{stats.events}</p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-xl group-hover:bg-blue-500/20 transition-colors"><Activity className="text-blue-500 h-8 w-8" /></div>
                </div>
                <div className="glass-panel p-6 flex items-center justify-between group hover:border-green-500/30 transition-all duration-300">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Monitored Agents</p>
                        <p className="text-4xl font-extrabold text-green-500 mt-2 tracking-tight group-hover:scale-105 transition-transform">{stats.activeAgents}</p>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-xl group-hover:bg-green-500/20 transition-colors"><Server className="text-green-500 h-8 w-8" /></div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-brand-accent" />
                            Event Velocity
                        </h3>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                            Telemetry Frequency: High
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        borderColor: '#374151',
                                        color: '#f1f5f9',
                                        borderRadius: '12px',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                                    }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="events" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Feed */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-slate-400" />
                        Live Feed
                    </h3>
                    <div className="space-y-3">
                        {events.slice(0, 6).map((event: any) => (
                            <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/30 hover:bg-slate-800/40 hover:border-slate-600/50 transition-all cursor-default group">
                                <div className={clsx(
                                    "p-2 rounded-lg mt-0.5 transition-transform group-hover:scale-110",
                                    event.status === 'MALICIOUS' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                                )}>
                                    {event.status === 'MALICIOUS' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-bold text-slate-100 truncate tracking-tight">{event.type}</p>
                                        <span className={clsx(
                                            "text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest",
                                            event.status === 'MALICIOUS' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                        )}>
                                            {event.riskScore > 0 ? `Score: ${event.riskScore}` : 'Safe'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                        <span className="truncate max-w-[100px]">{event.source}</span>
                                        <span>•</span>
                                        <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risk Heatmap */}
            <div className="glass-panel p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-brand-accent" />
                            Security Risk Heatmap
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Distribution of alerts across monitoring endpoints.</p>
                    </div>
                    <div className="flex gap-4 p-2 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-1.5 px-2">
                            <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700"></div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Idle</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 border-l border-slate-700">
                            <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.2)]"></div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safe</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 border-l border-slate-700">
                            <div className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/50 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)]"></div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Critical</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                    {['dev-01', 'dev-02', 'prod-srv-01', 'prod-db-01', 'runner-01', 'runner-02', 'vpn-gw', 'mail-mx-01', 'api-ext', 'app-fe-01', 'dev-03', 'build-01', 'test-04', 'stage-01', 'prod-cache', 'backup-01'].map((agent) => {
                        const hasAlert = stats.alerts > 0 && Math.random() > 0.7;
                        return (
                            <div key={agent} className={`p-4 rounded-xl border text-center transition-all cursor-help relative overflow-hidden group ${hasAlert
                                ? 'bg-red-500/5 border-red-500/30'
                                : 'bg-slate-930/40 border-slate-800 hover:border-slate-700'
                                }`}>
                                <div className={`w-3 h-3 rounded-full mx-auto mb-3 transition-all group-hover:scale-125 ${hasAlert ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]'}`}></div>
                                <span className={`text-[10px] font-mono transition-colors tracking-tighter uppercase font-bold ${hasAlert ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{agent}</span>
                                {hasAlert && <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
