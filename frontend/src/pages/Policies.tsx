import React, { useEffect, useState } from 'react';
import { Shield, Plus, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Policy {
    id: string;
    name: string;
    isActive: boolean;
    rule: {
        field: string;
        operator: string;
        value: string;
    };
}

const Policies: React.FC = () => {
    const { user } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newField, setNewField] = useState('process');
    const [newOperator, setNewOperator] = useState('equals');
    const [newValue, setNewValue] = useState('');
    const [newTactic, setNewTactic] = useState('');
    const [newTechniqueId, setNewTechniqueId] = useState('');
    const [newTechniqueName, setNewTechniqueName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);

    const isAdmin = user?.role === 'ADMIN';

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events/policies');
            setPolicies(res.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch policies:', err);
            setError('Failed to load policies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);

        try {
            const payload = {
                name: newName,
                rule: {
                    field: newField,
                    operator: newOperator,
                    value: newValue
                },
                isActive: true,
                mitreTactic: newTactic || null,
                mitreTechniqueId: newTechniqueId || null,
                mitreTechniqueName: newTechniqueName || null
            };

            await api.post('/events/policies', payload);
            setIsCreating(false);
            setNewName('');
            setNewValue('');
            setNewTactic('');
            setNewTechniqueId('');
            setNewTechniqueName('');
            fetchPolicies(); // Refresh list
        } catch (err: any) {
            console.error('Create policy error:', err);
            setCreateError(err.response?.data?.error || 'Failed to create policy');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Detection Policies</h1>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Policy
                    </button>
                )}
            </div>

            {/* Create Policy Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">Create New Policy</h2>

                        {createError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreatePolicy} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Policy Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. Detect Malicious Script"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Field</label>
                                    <select
                                        className="input-field"
                                        value={newField}
                                        onChange={e => setNewField(e.target.value)}
                                    >
                                        <option value="process">process</option>
                                        <option value="dest_ip">dest_ip</option>
                                        <option value="file">file</option>
                                        <option value="command">command</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Operator</label>
                                    <select
                                        className="input-field"
                                        value={newOperator}
                                        onChange={e => setNewOperator(e.target.value)}
                                    >
                                        <option value="equals">equals</option>
                                        <option value="contains">contains</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Target Value</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. powershell.exe"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                />
                            </div>

                            <div className="border-t border-slate-700 pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    MITRE ATT&CK Mapping
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Tactic</label>
                                        <select
                                            className="input-field"
                                            value={newTactic}
                                            onChange={e => setNewTactic(e.target.value)}
                                        >
                                            <option value="">None</option>
                                            <option value="Execution">Execution</option>
                                            <option value="Persistence">Persistence</option>
                                            <option value="Privilege Escalation">Privilege Escalation</option>
                                            <option value="Defense Evasion">Defense Evasion</option>
                                            <option value="Credential Access">Credential Access</option>
                                            <option value="Discovery">Discovery</option>
                                            <option value="Lateral Movement">Lateral Movement</option>
                                            <option value="Exfiltration">Exfiltration</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Technique ID</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="e.g. T1059"
                                            value={newTechniqueId}
                                            onChange={e => setNewTechniqueId(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Technique Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Command and Scripting Interpreter"
                                        value={newTechniqueName}
                                        onChange={e => setNewTechniqueName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Policy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-center p-8 glass-panel border-red-500/20">
                    <p className="text-red-400">{error}</p>
                    <button onClick={fetchPolicies} className="mt-4 btn-primary text-sm">Retry</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {policies.length === 0 && (
                        <div className="text-center p-12 glass-panel">
                            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No policies active.</p>
                        </div>
                    )}
                    {policies.map((policy) => (
                        <div key={policy.id} className="glass-panel p-6 flex justify-between items-center group hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                    <Shield className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">{policy.name}</h3>
                                    <p className="text-slate-400 text-sm font-mono mt-1">
                                        <span className="text-brand-accent">{policy.rule.field}</span>
                                        {' '}{policy.rule.operator === 'equals' ? '==' : 'contains'}{' '}
                                        <span className="text-orange-400">"{policy.rule.value}"</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${policy.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {policy.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Policies;
