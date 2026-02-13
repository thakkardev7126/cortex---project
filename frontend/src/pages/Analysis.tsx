import React, { useState, useRef } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, FileText, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface ScanResult {
    fileName: string;
    status: 'safe' | 'malicious' | 'suspicious';
    threatLevel: number;
    findings: string[];
    timestamp: string;
    analysisTime: string;
}

const Analysis: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsScanning(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/analysis/scan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to scan file. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Malware Sandbox</h1>
                <p className="text-slate-400">Upload suspicious files to perform automated behavioral analysis and signature scanning.</p>
            </div>

            {!result && !isScanning ? (
                <div
                    className={clsx(
                        "glass-panel p-12 flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer",
                        file ? "border-brand-accent bg-brand-accent/5" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                        <Upload className={clsx("w-8 h-8", file ? "text-brand-accent" : "text-slate-500")} />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                        {file ? file.name : "Select a file to scan"}
                    </h3>
                    <p className="text-slate-400 text-center mb-8">
                        Drag and drop files here, or click to browse.<br />
                        Supported formats: EXE, SH, PDF, JS, BIN, and more.
                    </p>

                    {file && (
                        <div className="flex gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Run Analysis
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="px-6 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            ) : isScanning ? (
                <div className="glass-panel p-20 flex flex-col items-center justify-center">
                    <div className="relative">
                        <Loader2 className="w-20 h-20 text-brand-accent animate-spin" />
                        <Shield className="w-8 h-8 text-brand-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h2 className="text-2xl font-bold mt-8 mb-2">Analyzing File...</h2>
                    <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-brand-accent animate-progress-indefinite"></div>
                    </div>
                    <p className="text-slate-400 mt-6 animate-pulse">
                        Extracting strings, checking signatures, and running behavioral heuristics...
                    </p>
                </div>
            ) : result && (
                <div className="space-y-6">
                    <div className={clsx(
                        "glass-panel p-8 border-l-4",
                        result.status === 'safe' ? "border-green-500" :
                            result.status === 'malicious' ? "border-red-500" : "border-yellow-500"
                    )}>
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "p-3 rounded-xl",
                                    result.status === 'safe' ? "bg-green-500/10 text-green-500" :
                                        result.status === 'malicious' ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                                )}>
                                    {result.status === 'safe' ? <CheckCircle className="w-8 h-8" /> :
                                        result.status === 'malicious' ? <AlertTriangle className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-wider">{result.status} Result</h2>
                                    <p className="text-slate-400">Analysis completed for <span className="text-white font-mono">{result.fileName}</span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Threat Score</p>
                                <div className="text-3xl font-bold">{result.threatLevel}/100</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Time Elapsed</p>
                                <p className="text-lg font-medium">{(result as any).analysisTime}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Entropy Score</p>
                                <p className="text-lg font-medium">{(result as any).entropy || '0.00'}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Engine Version</p>
                                <p className="text-lg font-medium">v2.4.0-deep</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Timestamp</p>
                                <p className="text-lg font-medium">{new Date(result.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="mb-8 p-4 bg-slate-900 border border-slate-700/50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">SHA-256 Fingerprint</p>
                            <p className="text-sm font-mono text-brand-accent break-all">{(result as any).sha256}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" />
                                Analysis Findings
                            </h3>
                            <div className="space-y-2">
                                {result.findings.map((finding, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                                        <div className={clsx(
                                            "w-2 h-2 rounded-full",
                                            result.status === 'safe' ? "bg-green-500" :
                                                result.status === 'malicious' ? "bg-red-500" : "bg-yellow-500"
                                        )}></div>
                                        <span>{finding}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-700 flex justify-between items-center">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Scan Another File
                            </button>
                            <button className="text-brand-accent hover:underline font-medium">
                                Download Full Report (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default Analysis;
