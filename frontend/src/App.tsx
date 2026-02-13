import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Incidents from './pages/Incidents';
import IncidentDetails from './pages/IncidentDetails';
import Analysis from './pages/Analysis';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" />;

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <Alerts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/policies"
                    element={
                        <ProtectedRoute>
                            <Policies />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incidents"
                    element={
                        <ProtectedRoute>
                            <Incidents />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incidents/:id"
                    element={
                        <ProtectedRoute>
                            <IncidentDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analysis"
                    element={
                        <ProtectedRoute>
                            <Analysis />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
