import { MonitorPlay, Settings, Coins } from 'lucide-react';

export const UserDashboard = () => {
    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-[#1a1a1a] overflow-hidden">
            {/* LEFT COLUMN: LIVE STREAM (approx 66% width) */}
            <div className="flex-1 flex flex-col p-1 relative bg-black">
                {/* Stream Header Info */}
                <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <span className="text-cyan-400 font-bold text-sm bg-black/50 px-2 py-1 rounded">
                        Jan 15, 2026, 11:52:26 PM
                    </span>
                </div>

                {/* Video Container */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden border border-[#333]">
                    {/* Stream Placeholder */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <MonitorPlay size={64} className="text-gray-700 opacity-50 mb-4" />
                        <span className="text-gray-500 font-mono">LIVE FEED LOADING...</span>
                    </div>

                    {/* Overlay Stats (Reference Image Style) */}
                    <div className="absolute top-10 left-10">
                        <div className="bg-red-500 text-white font-bold text-2xl px-4 py-1 uppercase tracking-widest shadow-lg">MERON</div>
                    </div>
                    <div className="absolute top-10 right-10">
                        <div className="bg-blue-600 text-white font-bold text-2xl px-4 py-1 uppercase tracking-widest shadow-lg">WALA</div>
                    </div>

                    {/* Fight Number Badge */}
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 font-bold text-xs border-2 border-red-800">
                        FIGHT # 68
                    </div>

                    {/* Video Controls Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex items-center justify-between text-yellow-500 text-xs">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 cursor-pointer"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: BETTING CONSOLE (approx 33% width) */}
            <div className="w-full lg:w-[450px] bg-[#1a1a1a] flex flex-col border-l border-[#333]">
                {/* Header: Last Call / Fight Num */}
                <div className="h-10 bg-yellow-500 text-black flex items-center justify-between px-4 font-bold uppercase text-xs">
                    <span>LAST CALL, PL</span>
                </div>

                {/* Status Bar */}
                <div className="bg-[#222] py-2 px-4 flex items-center justify-between border-b border-[#333]">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        LAST CALL
                    </div>
                    <span className="text-white font-bold text-lg">68</span>
                </div>

                {/* MERON / WALA COLUMNS */}
                <div className="flex-1 flex flex-col">
                    {/* Headers */}
                    <div className="flex h-10">
                        <div className="flex-1 bg-red-600 flex items-center justify-center text-white font-black tracking-widest text-lg border-r border-red-700">MERON</div>
                        <div className="flex-1 bg-blue-600 flex items-center justify-center text-white font-black tracking-widest text-lg">WALA</div>
                    </div>

                    {/* Stats & Payouts */}
                    <div className="flex flex-1 bg-[#1a1a1a]">
                        {/* MERON SIDE */}
                        <div className="flex-1 flex flex-col items-center p-2 border-r border-[#333]">
                            <div className="text-3xl font-black text-white mt-2">573,137</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-4">PAYOUT = <span className="text-white">183.24</span></div>

                            <div className="text-xs text-green-500 mb-4">My bets: 0</div>

                            <button className="w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold py-3 rounded-full uppercase text-sm shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 mb-2">
                                <Coins size={16} /> BET MERON
                            </button>

                            <div className="mt-auto w-full bg-[#222] rounded border border-[#333] px-2 py-1 flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 uppercase">PAYS:</span>
                                <span className="text-yellow-500 font-bold">0 💰</span>
                            </div>
                        </div>

                        {/* WALA SIDE */}
                        <div className="flex-1 flex flex-col items-center p-2">
                            <div className="text-3xl font-black text-yellow-500 mt-2">586,492</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-4">PAYOUT = <span className="text-white">177.25</span></div>

                            <div className="text-xs text-green-500 mb-4">My bets: 0</div>

                            <button className="w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold py-3 rounded-full uppercase text-sm shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 mb-2">
                                <Coins size={16} /> BET WALA
                            </button>

                            <div className="mt-auto w-full bg-[#222] rounded border border-[#333] px-2 py-1 flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 uppercase">PAYS:</span>
                                <span className="text-yellow-500 font-bold">0 💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BET AMOUNT INPUT */}
                <div className="bg-[#111] p-2 border-t border-[#333]">
                    <div className="flex items-center justify-between bg-[#000] border border-[#333] rounded px-4 py-2 mb-2">
                        <span className="text-white font-mono text-xl">0</span>
                        <button className="text-[10px] font-bold text-white uppercase hover:text-red-500">CLEAR</button>
                    </div>

                    {/* QUICK CHIPS */}
                    <div className="grid grid-cols-6 gap-1 mb-2">
                        {[50, 100, 500, '1K', '2K', '3K', '5K', 'MAX'].map((chip, i) => (
                            <button
                                key={i}
                                className="bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white text-[10px] font-bold py-2 rounded shadow border border-blue-400/30"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* DRAW BAR */}
                    <div className="bg-green-600 text-black text-[10px] font-bold px-2 py-1 mb-1 flex items-center gap-2">
                        <div className="bg-white rounded-full p-0.5"><Settings size={8} /></div>
                        DRAW WINS X 8. Max DRAW bet 1000/fight
                    </div>

                    <div className="flex items-center gap-2 bg-[#222] p-2 rounded">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-full text-xs uppercase flex items-center justify-center gap-2">
                            <Coins size={12} /> BET DRAW
                        </button>
                        <span className="text-white font-bold px-4">0</span>
                    </div>
                </div>

                {/* WINSTREAK PATTERN FOOTER */}
                <div className="bg-[#0a0a0a] border-t border-blue-900/50 p-2">
                    <div className="text-[10px] text-blue-400 font-bold uppercase mb-2">WINSTREAK PATTERN</div>
                    <div className="flex justify-between px-2 overflow-x-auto gap-4 scrollbar-hide">
                        {/* Pattern Placeholders */}
                        {[1, 2, 3, 4, 5, 6].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 min-w-[30px]">
                                <div className="w-8 h-8 rounded-full border border-yellow-500 flex items-center justify-center text-[10px] text-white">
                                    0
                                </div>
                                <span className="text-[8px] text-gray-500 whitespace-nowrap">30 winstreak</span>
                                <span className="text-[6px] text-orange-500">Reward: 150000</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
