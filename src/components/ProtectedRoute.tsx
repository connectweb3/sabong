import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export const ProtectedRoute = () => {
    const { session, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return session ? <Outlet /> : <Navigate to="/login" replace />;
};
