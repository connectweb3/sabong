export const LoaderDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Loader Dashboard</h1>
            <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 max-w-2xl mx-auto mt-10">
                <h2 className="text-xl font-bold text-white mb-6">Load Credits to User</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">User ID / Username</label>
                        <input type="text" className="w-full bg-neutral-900 border border-neutral-600 rounded p-2 text-white" placeholder="Search user..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Amount (₱)</label>
                        <input type="number" className="w-full bg-neutral-900 border border-neutral-600 rounded p-2 text-white" placeholder="0.00" />
                    </div>
                    <button type="button" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                        Transfer Credits
                    </button>
                </form>
            </div>
        </div>
    );
};
