export const MasterAgentDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Master Agent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">My Downlines</h3>
                    <p className="text-3xl font-bold text-white mt-2">0 Agents</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium">Commission Wallet</h3>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">₱ 0.00</p>
                </div>
            </div>
        </div>
    );
};
