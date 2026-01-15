import { useAuthStore } from '../lib/store';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { MasterAgentDashboard } from './dashboard/MasterAgentDashboard';
import { AgentDashboard } from './dashboard/AgentDashboard';
import { LoaderDashboard } from './dashboard/LoaderDashboard';
import { UserDashboard } from './dashboard/UserDashboard';

export const Dashboard = () => {
    const { profile, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mr-2"></div>
                Loading Dashboard...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <p className="mb-4">Profile not found.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    switch (profile.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'master_agent':
            return <MasterAgentDashboard />;
        case 'agent':
            return <AgentDashboard />;
        case 'loader':
            return <LoaderDashboard />;
        case 'user':
            return <UserDashboard />;
        default:
            return <div>Unknown Role</div>;
    }
};
