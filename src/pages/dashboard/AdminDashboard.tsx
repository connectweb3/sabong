import { useNavigate } from 'react-router-dom';
import { Users, Activity, DollarSign, Settings, Gamepad2, FileText, Globe } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useStreamSettings } from '../../hooks/useStreamSettings';
import { StatCard } from '../../components/dashboard/StatCard';
import { RoleAnalyticsCard } from '../../components/dashboard/RoleAnalyticsCard';
import { AdminUserManagement } from './AdminUserManagement';

export const AdminDashboard = () => {
    const { stats } = useAdminStats();
    const { streamUrl, updateStreamUrl } = useStreamSettings();
    const navigate = useNavigate();



    return (
        <div className="space-y-8 p-6 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-orange-500" />
                        Mission Control
                    </h1>
                    <p className="text-gray-400 mt-1">System Overview & Administrative Functions</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                        <Gamepad2 size={16} />
                        Create Match
                    </button>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={<Users />}
                />
                <StatCard
                    title="Active Bets (Today)"
                    value={stats.totalBetsToday.toLocaleString()}
                    icon={<Activity />}
                    trend="+12%" // Placeholder trend
                    trendUp={true}
                />
                <StatCard
                    title="System Liability (Credits)"
                    value={`₱${Object.values(stats.roleCredits).reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign />}
                    className="border-red-900/30 bg-red-900/10"
                />
                <StatCard
                    title="System Status"
                    value="Operational"
                    icon={<Globe />}
                    className="border-green-900/30 bg-green-900/10 text-green-500"
                />
            </div>

            {/* Role Analytics Grid */}
            <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Users size={18} className="text-orange-500" />
                    Role Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <RoleAnalyticsCard
                        roleName="Master Agents"
                        count={stats.roleCounts.master_agent}
                        totalCredits={stats.roleCredits.master_agent}
                        colorClass="bg-purple-500"
                        onClick={() => navigate('/users?role=master_agent')}
                    />
                    <RoleAnalyticsCard
                        roleName="Agents"
                        count={stats.roleCounts.agent}
                        totalCredits={stats.roleCredits.agent}
                        colorClass="bg-blue-500"
                        onClick={() => navigate('/users?role=agent')}
                    />
                    <RoleAnalyticsCard
                        roleName="Loaders"
                        count={stats.roleCounts.loader}
                        totalCredits={stats.roleCredits.loader}
                        colorClass="bg-yellow-500"
                        onClick={() => navigate('/users?role=loader')}
                    />
                    <RoleAnalyticsCard
                        roleName="Players"
                        count={stats.roleCounts.user}
                        totalCredits={stats.roleCredits.user}
                        colorClass="bg-green-500"
                        onClick={() => navigate('/users?role=user')}
                    />
                </div>
            </div>

            {/* Control Center Quick Links */}
            <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-orange-500" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => navigate('/users')} className="bg-[#222] hover:bg-[#2a2a2a] p-4 rounded-xl border border-[#333] flex flex-col items-center gap-2 transition-colors group">
                        <Users size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-bold text-gray-300">User Management</span>
                    </button>
                    <button onClick={() => navigate('/transactions')} className="bg-[#222] hover:bg-[#2a2a2a] p-4 rounded-xl border border-[#333] flex flex-col items-center gap-2 transition-colors group">
                        <FileText size={24} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                        <span className="text-sm font-bold text-gray-300">Transaction Logs</span>
                    </button>
                    <button onClick={() => navigate('/betting')} className="bg-[#222] hover:bg-[#2a2a2a] p-4 rounded-xl border border-[#333] flex flex-col items-center gap-2 transition-colors group">
                        <Gamepad2 size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-bold text-gray-300">Betting Operations</span>
                    </button>
                    <button onClick={() => navigate('/settings')} className="bg-[#222] hover:bg-[#2a2a2a] p-4 rounded-xl border border-[#333] flex flex-col items-center gap-2 transition-colors group">
                        <Settings size={24} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                        <span className="text-sm font-bold text-gray-300">System Settings</span>
                    </button>
                </div>
            </div>

            {/* Stream Configuration Section */}
            <div className="bg-[#222] border border-[#333] rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity className="text-red-500" />
                    Live Stream Configuration
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Stream URL (HLS / m3u8 / YouTube)</label>
                        <input
                            type="text"
                            placeholder="e.g. https://stream.mux.com/..."
                            className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg focus:border-orange-500 outline-none"
                            defaultValue={streamUrl}
                            onChange={(e) => updateStreamUrl(e.target.value)}
                        />
                        <p className="text-[10px] text-gray-500 mt-2">
                            Paste your HLS (.m3u8) or YouTube URL here. The player on the User Dashboard will update automatically.
                        </p>
                    </div>
                </div>
            </div>

            {/* Legacy User Management (Kept for now, possibly move to separate page fully later) */}
            <div className="pt-8 border-t border-[#333]">
                <AdminUserManagement />
            </div>
        </div>
    );
};
