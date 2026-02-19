import React, { useEffect, useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
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
    mitreTactic?: string | null;
    mitreTechniqueId?: string | null;
    mitreTechniqueName?: string | null;
}

const Policies: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Create policy form
    const [newName, setNewName] = useState('');
    const [newField, setNewField] = useState('process');
    const [newOperator, setNewOperator] = useState('equals');
    const [newValue, setNewValue] = useState('');
    const [newTactic, setNewTactic] = useState('');
    const [newTechniqueId, setNewTechniqueId] = useState('');
    const [newTechniqueName, setNewTechniqueName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);

    // ======================
    // FETCH POLICIES (FIXED)
    // ======================
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events/policies');

            // Support both API response shapes: [] and { policies: [] }
            const policyList = Array.isArray(res.data)
                ? res.data
                : res.data?.policies ?? [];

            setPolicies(policyList);

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

    // ======================
    // CREATE POLICY
    // ======================
    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);

        try {
            await api.post('/events/policies', {
                name: newName,
                rule: {
                    field: newField,
                    operator: newOperator,
                    value: newValue,
                },
                isActive: true,
                mitreTactic: newTactic || null,
                mitreTechniqueId: newTechniqueId || null,
                mitreTechniqueName: newTechniqueName || null,
            });

            setIsCreating(false);
            setNewName('');
            setNewValue('');
            setNewTactic('');
            setNewTechniqueId('');
            setNewTechniqueName('');

            fetchPolicies();
        } catch (err: any) {
            console.error(err);
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

            {/* CREATE POLICY MODAL */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="glass-panel p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">Create Policy</h2>

                        {createError && (
                            <div className="mb-4 text-red-400 flex gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreatePolicy} className="space-y-4">
                            <input
                                className="input-field"
                                placeholder="Policy Name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="input-field"
                                    value={newField}
                                    onChange={(e) => setNewField(e.target.value)}
                                >
                                    <option value="process">process</option>
                                    <option value="file">file</option>
                                    <option value="command">command</option>
                                    <option value="dest_ip">dest_ip</option>
                                </select>

                                <select
                                    className="input-field"
                                    value={newOperator}
                                    onChange={(e) => setNewOperator(e.target.value)}
                                >
                                    <option value="equals">equals</option>
                                    <option value="contains">contains</option>
                                </select>
                            </div>

                            <input
                                className="input-field"
                                placeholder="Target Value"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                required
                            />

                            <input
                                className="input-field"
                                placeholder="MITRE Tactic"
                                value={newTactic}
                                onChange={(e) => setNewTactic(e.target.value)}
                            />

                            <input
                                className="input-field"
                                placeholder="MITRE Technique ID"
                                value={newTechniqueId}
                                onChange={(e) => setNewTechniqueId(e.target.value)}
                            />

                            <input
                                className="input-field"
                                placeholder="MITRE Technique Name"
                                value={newTechniqueName}
                                onChange={(e) => setNewTechniqueName(e.target.value)}
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POLICY LIST */}
            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : error ? (
                <div className="text-red-400">{error}</div>
            ) : policies.length === 0 ? (
                <div className="text-center text-slate-400">No policies active.</div>
            ) : (
                <div className="grid gap-4">
                    {policies.map((policy) => (
                        <div key={policy.id} className="glass-panel p-5 flex justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{policy.name}</h3>
                                <p className="text-slate-400 text-sm font-mono">
                                    {policy.rule.field} {policy.rule.operator} "{policy.rule.value}"
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs ${policy.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-slate-500/20 text-slate-400'
                                    }`}
                            >
                                {policy.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Policies;
