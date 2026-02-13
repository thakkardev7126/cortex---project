import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, AlertTriangle, Shield, LogOut, Activity, FileText } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
        { icon: Shield, label: 'Policies', path: '/policies' },
        { icon: Activity, label: 'Incidents', path: '/incidents' },
        { icon: FileText, label: 'Sandbox', path: '/analysis' },
    ];

    return (
        <div className="min-h-screen flex bg-brand-dark text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
                <div className="p-6 flex items-center gap-3">
                    <Activity className="text-brand-accent w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight">CORTEX</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                location.pathname === item.path
                                    ? 'bg-brand-accent/10 text-brand-accent border-l-2 border-brand-accent'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-slate-500">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 px-4 py-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
