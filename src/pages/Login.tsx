export const Login = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f0a0a]">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

            <div className="z-10 w-full max-w-4xl flex flex-col items-center text-center">
                {/* Logo Section replaced with "22" */}
                <div className="mb-16 transform hover:scale-110 transition-transform duration-700 ease-out cursor-default">
                    <span className="text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700 drop-shadow-[0_0_30px_rgba(249,84,36,0.5)]">
                        22
                    </span>
                </div>

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 leading-tight">
                        GREAT PIRATE<br />
                        <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,84,36,0.5)]">ERA</span>
                    </h1>

                    <div className="flex items-center justify-center space-x-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500/50" />
                        <p className="text-2xl md:text-3xl font-bold text-orange-400 tracking-[0.2em] uppercase">
                            =P
                        </p>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500/50" />
                    </div>

                    <p className="text-gray-400 text-3xl md:text-5xl font-black max-w-lg mx-auto leading-relaxed opacity-90 tracking-tighter italic">
                        ARAY KOH!
                    </p>
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

