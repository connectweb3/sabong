export const Login = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f0a0a]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="z-10 w-full max-w-4xl flex flex-col items-center text-center">

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                </div>

                {/* Footer Payment Methods */}
                <div className="mt-24 flex flex-col items-center space-y-4 opacity-40 hover:opacity-80 transition-opacity duration-500">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-light">
                        Trusted Platforms
                    </p>
                    <div className="flex items-center space-x-8">
                        <span className="text-blue-400/80 font-bold text-xl tracking-tight grayscale hover:grayscale-0 transition-all cursor-default">GCash</span>
                        <span className="text-green-500/80 font-bold text-xl tracking-tight grayscale hover:grayscale-0 transition-all cursor-default">maya</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

