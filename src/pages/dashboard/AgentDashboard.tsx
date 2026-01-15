export const AgentDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Agent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">Active Loaders</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">Total Players</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
            </div>
        </div>
    );
};
