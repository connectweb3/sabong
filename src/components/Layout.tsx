import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import {
    Users,
    Wallet,
    Settings,
    LogOut,
    History,
    Gamepad2,
    Menu,
} from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
    const { profile, signOut } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!profile) return null;

    // Sabonglava787 Sidebar Items
    const sidebarItems = [
        { name: 'PLAYER', icon: null, isHeader: true },
        { name: 'Game Lounge', icon: Gamepad2, path: '/' },
        { name: 'Sabong Bet Logs', icon: History, path: '/transactions' },
        { name: 'Credits', icon: Wallet, path: '/commission' },
        { name: 'SETTINGS', icon: null, isHeader: true },
        { name: 'Change Password', icon: Settings, path: '/settings' },
        { name: 'Create MPIN', icon: Users, path: '/mpin' }, // Placeholder path
        { name: 'Logout', icon: LogOut, action: signOut, path: '#' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white font-sans overflow-hidden">
            {/* HEADR */}
            <header className="h-16 bg-[#111] flex items-center px-4 justify-between border-b border-[#333] z-50 relative sticky top-0">
                <div className="flex items-center gap-4">
                    {/* Brand / Logo Area */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center border-2 border-orange-500 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="font-exhibit text-xs text-orange-500 font-bold">SL</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-wide uppercase font-display"><span className="text-orange-500">SABONG</span>LAVA</h1>
                    </div>

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-[#222] rounded border border-[#333] hover:border-orange-500 transition-colors text-orange-500"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Balance Widget */}
                    <div className="hidden md:flex items-center bg-[#222] rounded-full px-4 py-1.5 border border-[#333]">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-black font-bold text-xs shadow-lg">₱</div>
                        <div className="flex flex-col leading-none mr-6">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Balance</span>
                            <span className="text-sm font-bold text-white">{profile.credits?.toLocaleString() ?? '0.00'}</span>
                        </div>
                        <div className="flex flex-col leading-none border-l border-gray-600 pl-4">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">WS</span>
                            <span className="text-sm font-bold text-white">0</span>
                        </div>
                    </div>
                </div>

                {/* Marquee (Scrolling Text) */}
                <div className="hidden lg:flex flex-1 mx-8 overflow-hidden relative h-full items-center bg-[#111]">
                    <div className="marquee-container w-full whitespace-nowrap overflow-hidden">
                        <p className="inline-block animate-marquee text-sm text-white/90 font-medium">
                            📢 <span className="text-orange-500 font-bold uppercase">Game Announcement:</span> Congrats to A** V***! Winning ₱100,000 at the casino is truly exciting. Wishing you more luck and wins ahead.
                        </p>
                    </div>
                </div>


                {/* Profile / User */}
                <div className="flex items-center gap-3 bg-[#222] pl-4 pr-1 py-1 rounded-full border border-[#333]">
                    <div className="flex flex-col items-end mr-2 hidden sm:block">
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider">Welcome back,</span>
                        <span className="text-sm font-bold text-orange-500">{profile.username}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            <Users size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </header>

            {/* MARQUEE for Mobile (Below header) */}
            <div className="lg:hidden bg-[#1a1a1a] py-1 overflow-hidden border-b border-[#333]">
                <div className="marquee-container w-full whitespace-nowrap overflow-hidden">
                    <p className="inline-block animate-marquee text-xs text-white">
                        🎉 Congrats to User123 for winning ₱50k! • Maintenance scheduled at 3AM •
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* SIDEBAR */}
                <aside className={clsx(
                    "w-64 bg-black flex-shrink-0 flex flex-col border-r-4 border-orange-600 absolute lg:static inset-y-0 left-0 z-40 transition-transform duration-300",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <nav className="flex-1 py-6 px-0 space-y-1 overflow-y-auto">
                        {sidebarItems.map((item, index) => {
                            if (item.isHeader) {
                                return (
                                    <div key={index} className="mt-8 mb-3 px-6">
                                        <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-orange-900/30 pb-2">
                                            {item.name === 'PLAYER' && <Gamepad2 size={12} />}
                                            {item.name === 'SETTINGS' && <Settings size={12} />}
                                            {item.name}
                                        </h3>
                                    </div>
                                );
                            }

                            const Icon = item.icon;
                            // const isActive = item.path && location.pathname === item.path; 

                            return (
                                <Link
                                    key={index}
                                    to={item.path || '#'}
                                    onClick={(e) => {
                                        if (item.action) {
                                            e.preventDefault();
                                            item.action();
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center px-6 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all group border-l-2 border-transparent hover:border-orange-500"
                                >
                                    {Icon && <Icon className="w-4 h-4 mr-3 text-gray-600 group-hover:text-orange-500 transition-colors" />}
                                    <span className="uppercase tracking-wider group-hover:translate-x-1 transition-transform">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-hidden bg-[#0d0d0d] relative w-full h-full">
                    <Outlet />
                </main>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};
