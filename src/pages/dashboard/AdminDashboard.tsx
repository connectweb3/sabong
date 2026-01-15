import { AdminUserManagement } from './AdminUserManagement';

export const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">1,234</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">Total Bets (Today)</h3>
                    <p className="text-3xl font-bold text-white mt-2">₱ 540,000</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">System GGR</h3>
                    <p className="text-3xl font-bold text-green-500 mt-2">₱ 120,000</p>
                </div>
            </div>

            <AdminUserManagement />
        </div>
    );
};
